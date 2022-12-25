/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */


import { Direction } from '@angular/cdk/bidi';
import { coerceBooleanProperty, coerceElement } from '@angular/cdk/coercion';
import { _getShadowRoot, normalizePassiveListenerOptions } from '@angular/cdk/platform';
import { ViewportRuler } from '@angular/cdk/scrolling';
import { ElementRef, EmbeddedViewRef, NgZone, TemplateRef, ViewContainerRef } from '@angular/core';
import { Observable, Subject, Subscription } from 'rxjs';
import { finalize, take, takeLast, tap } from 'rxjs/operators';
import { DragContainerRef } from '../drag-drop-ref/drag-container-ref';
import { DragDropRegistry } from '../drag-drop-registry';
import {
  combineTransforms, DragCSSStyleDeclaration, toggleNativeDragInteractions, toggleVisibility
} from '../drag-styling';
import { ParentPositionTracker } from '../parent-position-tracker';
import { getTransformTransitionDurationInMs } from '../transition-duration';
import { adjustClientRect, getMutableClientRect } from '../utils/client-rect';
import { deepCloneNode } from '../utils/clone-node';
import { DropContainerRefInternal as DropContainerRef } from './dnd-container-ref';
import { DragPreviewRef } from './drag-preview-ref';

/** Object that can be used to configure the behavior of DragRef. */
export interface DragRefConfig {
  /**
   * Minimum amount of pixels that the user should
   * drag, before the TRI initiates a drag sequence.
   */
  dragStartThreshold: number;

  /**
   * Amount the pixels the user should drag before the TRI
   * considers them to have changed the drag direction.
   */
  pointerDirectionChangeThreshold: number;

  /** `z-index` for the absolutely-positioned elements that are created by the drag item. */
  zIndex?: number;

  /** Ref that the current drag item is nested in. */
  parentDragRef?: DragRef;
}

/** Options that can be used to bind a passive event listener. */
const passiveEventListenerOptions = normalizePassiveListenerOptions({passive: true});

/** Options that can be used to bind an active event listener. */
const activeEventListenerOptions = normalizePassiveListenerOptions({passive: false});

/**
 * Time in milliseconds for which to ignore mouse events, after
 * receiving a touch event. Used to avoid doing double work for
 * touch devices where the browser fires fake mouse events, in
 * addition to touch events.
 */
const MOUSE_EVENT_IGNORE_TIME = 800;

/**
 * Internal compile-time-only representation of a `DragRef`.
 * Used to avoid circular import issues between the `DragRef` and the `DropContainerRef`.
 * @docs-private
 */
export interface DragRefInternal<T = any> extends DragRef<T> {
}

/** Template that can be used to create a drag helper element (e.g. a preview or a placeholder). */
interface DragHelperTemplate<T = any> {
  template: TemplateRef<T> | null;
  viewContainer: ViewContainerRef;
  context: T;
}

/** Template that can be used to create a drag preview element. */
interface DragPreviewTemplate<T = any> extends DragHelperTemplate<T> {
  matchSize?: boolean;
}

/** Point on the page or within an element. */
export interface Point {
  x: number;
  y: number;
}

/**
 * Possible places into which the preview of a drag item can be inserted.
 * - `global` - Preview will be inserted at the bottom of the `<body>`. The advantage is that
 * you don't have to worry about `overflow: hidden` or `z-index`, but the item won't retain
 * its inherited styles.
 * - `parent` - Preview will be inserted into the parent of the drag item. The advantage is that
 * inherited styles will be preserved, but it may be clipped by `overflow: hidden` or not be
 * visible due to `z-index`. Furthermore, the preview is going to have an effect over selectors
 * like `:nth-child` and some flexbox configurations.
 * - `ElementRef<HTMLElement> | HTMLElement` - Preview will be inserted into a specific element.
 * Same advantages and disadvantages as `parent`.
 */
export type PreviewContainer = 'global' | 'parent' | ElementRef<HTMLElement> | HTMLElement;

/**
 * Reference to a draggable item. Used to manipulate or dispose of the item.
 */
export class DragRef<T = any> {
  /** Element displayed next to the user's pointer while the element is dragged. */
  private _preview: HTMLElement | null;

  public _previewRef: DragPreviewRef | undefined;

  /** Reference to the view of the preview element. */
  // private _previewEmbeddedViewRef: EmbeddedViewRef<any> | null;

  /** Container into which to insert the preview. */
  private _previewContainer: PreviewContainer | undefined;

  /** Reference to the view of the placeholder element. */
  private _placeholderEmbeddedViewRef: EmbeddedViewRef<any> | null;

  /** Element that is rendered instead of the draggable item while it is being sorted. */
  private _placeholder: HTMLElement;

  /** Coordinates within the element at which the user picked up the element. */
  private _pickupPositionInElement: Point;

  /** Coordinates on the page at which the user picked up the element. */
  private _pickupPositionOnPage: Point;

  /**
   * Anchor node used to save the place in the DOM where the element was
   * picked up so that it can be restored at the end of the drag sequence.
   */
  private _anchor: Comment;

  /**
   * CSS `transform` applied to the element when it isn't being dragged. We need a
   * passive transform in order for the dragged element to retain its new position
   * after the user has stopped dragging and because we need to know the relative
   * position in case they start dragging again. This corresponds to `element.style.transform`.
   */
  private _passiveTransform: Point = {x: 0, y: 0};

  /** CSS `transform` that is applied to the element while it's being dragged. */
  private _activeTransform: Point = {x: 0, y: 0};

  /** Inline `transform` value that the element had before the first dragging sequence. */
  private _initialTransform?: string;

  /**
   * Whether the dragging sequence has been started. Doesn't
   * necessarily mean that the element has been moved.
   */
  private _hasStartedDragging: boolean;

  /** Whether the element has moved since the user started dragging it. */
  private _hasMoved: boolean;

  /** Drop container in which the DragRef resided when dragging began. */
  private _initialContainer: DropContainerRef;

  /** Index at which the item started in its initial container. */
  /*private*/
  _initialIndex: number;

  /** Cached positions of scrollable parent elements. */
  private _parentPositions: ParentPositionTracker;

  /** Emits when the item is being moved. */
  private readonly _moveEvents = new Subject<{
    source: DragRef;
    pointerPosition: { x: number, y: number };
    event: MouseEvent | TouchEvent;
    distance: Point;
    delta: { x: -1 | 0 | 1, y: -1 | 0 | 1 };
  }>();

  /** Keeps track of the direction in which the user is dragging along each axis. */
  private _pointerDirectionDelta: { x: -1 | 0 | 1, y: -1 | 0 | 1 };

  /** Pointer position at which the last change in the delta occurred. */
  private _pointerPositionAtLastDirectionChange: Point;

  /** Position of the pointer at the last pointer event. */
  private _lastKnownPointerPosition: Point;

  /**
   * Root DOM node of the drag instance. This is the element that will
   * be moved around as the user is dragging.
   */
  private _rootElement: HTMLElement;

  /**
   * Nearest ancestor SVG, relative to which coordinates are calculated if dragging SVGElement
   */
  private _ownerSVGElement: SVGSVGElement | null;

  /**
   * Inline style value of `-webkit-tap-highlight-color` at the time the
   * dragging was started. Used to restore the value once we're done dragging.
   */
  private _rootElementTapHighlight: string;

  /** Subscription to pointer movement events. */
  private _pointerMoveSubscription = Subscription.EMPTY;

  private _pointerMoveIdleSubscription = Subscription.EMPTY;

  /** Subscription to the event that is dispatched when the user lifts their pointer. */
  private _pointerUpSubscription = Subscription.EMPTY;

  /** Subscription to the viewport being scrolled. */
  private _scrollSubscription = Subscription.EMPTY;

  /** Subscription to the viewport being resized. */
  private _resizeSubscription = Subscription.EMPTY;

  /**
   * Time at which the last touch event occurred. Used to avoid firing the same
   * events multiple times on touch devices where the browser will fire a fake
   * mouse event for each touch event, after a certain time.
   */
  private _lastTouchEventTime: number;

  /** Time at which the last dragging sequence was started. */
  private _dragStartTime: number;

  /** Cached reference to the boundary element. */
  private _boundaryElement: HTMLElement | null = null;

  /** Whether the native dragging interactions have been enabled on the root element. */
  private _nativeInteractionsEnabled = true;

  /** Cached dimensions of the preview element. */
  private _previewRect?: ClientRect;

  /** Cached dimensions of the boundary element. */
  private _boundaryRect?: ClientRect;

  /** Element that will be used as a template to create the draggable item's preview. */
  private _previewTemplate?: DragPreviewTemplate | null;

  /** Template for placeholder element rendered to show where a draggable would be dropped. */
  private _placeholderTemplate?: DragHelperTemplate | null;

  /** Elements that can be used to drag the draggable item. */
  private _handles: HTMLElement[] = [];

  /** Registered handles that are currently disabled. */
  private _disabledHandles = new Set<HTMLElement>();

  /** used for preStarted container */
  private _preStartedContainerRef?: DropContainerRef;

  /** Droppable container that the draggable is a part of. */
  private _dndContainerRef?: DropContainerRef;

  /** Layout direction of the item. */
  private _direction: Direction = 'ltr';

  /** Ref that the current drag item is nested in. */
  private _parentDragRef: DragRef<unknown> | null;

  /**
   * Cached shadow root that the element is placed in. `null` means that the element isn't in
   * the shadow DOM and `undefined` means that it hasn't been resolved yet. Should be read via
   * `_getShadowRoot`, not directly.
   */
  private _cachedShadowRoot: ShadowRoot | null | undefined;

  /** Axis along which dragging is locked. */
  lockAxis: 'x' | 'y';

  /**
   * Amount of milliseconds to wait after the user has put their
   * pointer down before starting to drag the element.
   */
  dragStartDelay: number | { touch: number, mouse: number } = 0;

  /** Class to be added to the preview element. */
  previewClass: string | string[] | undefined;

  /** Whether starting to drag this element is disabled. */
  get disabled(): boolean {
    return this._disabled || !!(this._dndContainerRef && this._dndContainerRef.disabled);
  }

  set disabled(value: boolean) {
    const newValue = coerceBooleanProperty(value);

    if (newValue !== this._disabled) {
      this._disabled = newValue;
      this._toggleNativeDragInteractions();
      this._handles.forEach(handle => toggleNativeDragInteractions(handle, newValue));
    }
  }

  private _disabled = false;

  /** Emits as the drag sequence is being prepared. */
  readonly beforeStarted = new Subject<void>();

  /** Emits when the user starts dragging the item. */
  readonly started = new Subject<{ source: DragRef }>();

  /** Emits when the user has released a drag item, before any animations have started. */
  readonly released = new Subject<{ source: DragRef }>();

  /** Emits when the user stops dragging an item in the container. */
  readonly ended = new Subject<{ source: DragRef, distance: Point, dropPoint: Point }>();

  /** Emits when the user has moved the item into a new container. */
  readonly entered = new Subject<{ container: DropContainerRef, item: DragRef, currentIndex: number }>();

  /** Emits when the user removes the item its container by dragging it into another container. */
  readonly exited = new Subject<{ container: DropContainerRef, item: DragRef }>();

  /** Emits when the user drops the item inside a container. */
  readonly dropped = new Subject<{
    previousIndex: number;
    currentIndex: number;
    elementPositionX: number;
    elementPositionY: number;
    item: DragRef;
    container: DropContainerRef;
    previousContainer: DropContainerRef;
    distance: Point;
    dropPoint: Point;
    isPointerOverContainer: boolean;
    elementRelativePosition?: Point
  }>();

  /**
   * Emits as the user is dragging the item. Use with caution,
   * because this event will fire for every pixel that the user has dragged.
   */
  readonly moved: Observable<{
    source: DragRef;
    pointerPosition: { x: number, y: number };
    event: MouseEvent | TouchEvent;
    distance: Point;
    delta: { x: -1 | 0 | 1, y: -1 | 0 | 1 };
  }> = this._moveEvents;

  transferData: any;

  /** Arbitrary data that can be attached to the drag item. */
  data: T;

  /**
   * Function that can be used to customize the logic of how the position of the drag item
   * is limited while it's being dragged. Gets called with a point containing the current position
   * of the user's pointer on the page and should return a point describing where the item should
   * be rendered.
   */
  constrainPosition?: (point: Point, dragRef: DragRef) => Point;

  constructor(
    element: ElementRef<HTMLElement> | HTMLElement,
    private _config: DragRefConfig,
    private _document: Document,
    private _ngZone: NgZone,
    private _viewportRuler: ViewportRuler,
    private _dragDropRegistry: DragDropRegistry<DragRef, DropContainerRef>) {

    this.withRootElement(element).withParent(_config.parentDragRef || null);
    this._parentPositions = new ParentPositionTracker(_document, _viewportRuler);
    _dragDropRegistry.registerDragItem(this);
  }

  /**
   * Returns the element that is being used as a placeholder
   * while the current element is being dragged.
   */
  getPlaceholderElement(): HTMLElement {
    return this._placeholder;
  }

  /** Returns the root draggable element. */
  getRootElement(): HTMLElement {
    return this._rootElement;
  }

  getPreviewRef() {
    return this._previewRef;
  }

  /**
   * Gets the currently-visible element that represents the drag item.
   * While dragging this is the placeholder, otherwise it's the root element.
   */
  getVisibleElement(): HTMLElement {
    return this.isDragging() ? this.getPlaceholderElement() : this.getRootElement();
  }

  /** Registers the handles that can be used to drag the element. */
  withHandles(handles: (HTMLElement | ElementRef<HTMLElement>)[]): this {
    this._handles = handles.map(handle => coerceElement(handle));
    this._handles.forEach(handle => toggleNativeDragInteractions(handle, this.disabled));
    this._toggleNativeDragInteractions();

    // Delete any lingering disabled handles that may have been destroyed. Note that we re-create
    // the set, rather than iterate over it and filter out the destroyed handles, because while
    // the ES spec allows for sets to be modified while they're being iterated over, some polyfills
    // use an array internally which may throw an error.
    const disabledHandles = new Set<HTMLElement>();
    this._disabledHandles.forEach(handle => {
      if (this._handles.indexOf(handle) > -1) {
        disabledHandles.add(handle);
      }
    });
    this._disabledHandles = disabledHandles;
    return this;
  }

  /**
   * Registers the template that should be used for the drag preview.
   * @param template Template that from which to stamp out the preview.
   */
  withPreviewTemplate(template: DragPreviewTemplate | null): this {
    this._previewTemplate = template;
    return this;
  }

  /**
   * Registers the template that should be used for the drag placeholder.
   * @param template Template that from which to stamp out the placeholder.
   */
  withPlaceholderTemplate(template: DragHelperTemplate | null): this {
    this._placeholderTemplate = template;
    return this;
  }

  /**
   * Sets an alternate drag root element. The root element is the element that will be moved as
   * the user is dragging. Passing an alternate root element is useful when trying to enable
   * dragging on an element that you might not have access to.
   */
  withRootElement(rootElement: ElementRef<HTMLElement> | HTMLElement): this {
    const element = coerceElement(rootElement);

    if (element !== this._rootElement) {
      if (this._rootElement) {
        this._removeRootElementListeners(this._rootElement);
      }

      this._ngZone.runOutsideAngular(() => {
        element.addEventListener('mousedown', this._pointerDown, activeEventListenerOptions);
        element.addEventListener('touchstart', this._pointerDown, passiveEventListenerOptions);
      });
      this._initialTransform = undefined;
      this._rootElement      = element;
    }

    if (typeof SVGElement !== 'undefined' && this._rootElement instanceof SVGElement) {
      this._ownerSVGElement = this._rootElement.ownerSVGElement;
    }

    return this;
  }

  /**
   * Element to which the draggable's position will be constrained.
   */
  withBoundaryElement(boundaryElement: ElementRef<HTMLElement> | HTMLElement | null): this {
    this._boundaryElement = boundaryElement ? coerceElement(boundaryElement) : null;
    this._resizeSubscription.unsubscribe();
    if (boundaryElement) {
      this._resizeSubscription = this._viewportRuler
        .change(10)
        .subscribe(() => this._containInsideBoundaryOnResize());
    }
    return this;
  }

  /** Sets the parent ref that the ref is nested in.  */
  withParent(parent: DragRef<unknown> | null): this {
    this._parentDragRef = parent;
    return this;
  }

  /** Removes the dragging functionality from the DOM element. */
  dispose() {
    this._removeRootElementListeners(this._rootElement);

    // Do this check before removing from the registry since it'll
    // stop being considered as dragged once it is removed.
    if (this.isDragging()) {
      // Since we move out the element to the end of the body while it's being
      // dragged, we have to make sure that it's removed if it gets destroyed.
      removeNode(this._rootElement);
    }

    removeNode(this._anchor);
    this._destroyPreview();
    this._destroyPlaceholder();
    this._dragDropRegistry.removeDragItem(this);
    this._removeSubscriptions();
    this.beforeStarted.complete();
    this.started.complete();
    this.released.complete();
    this.ended.complete();
    this.entered.complete();
    this.exited.complete();
    this.dropped.complete();
    this._moveEvents.complete();
    this._handles = [];
    this._disabledHandles.clear();
    this._dndContainerRef = undefined;
    this._resizeSubscription.unsubscribe();
    this._parentPositions.clear();
    this._boundaryElement = this._rootElement = this._ownerSVGElement = this._placeholderTemplate =
      this._previewTemplate = this._anchor = this._parentDragRef = null!;
  }

  public isInInitialContainer(): boolean {
    return this._dndContainerRef === this._initialContainer;
  }

  private isDropInDragContainer(): boolean {
    return this._dndContainerRef && this._dndContainerRef instanceof DragContainerRef;
  }

  /** Checks whether the element is currently being dragged. */
  isDragging(): boolean {
    return this._hasStartedDragging && this._dragDropRegistry.isDragging(this);
  }

  /** Resets a standalone drag item to its initial position. */
  reset(): void {
    this._rootElement.style.transform = this._initialTransform || '';
    this._activeTransform             = {x: 0, y: 0};
    this._passiveTransform            = {x: 0, y: 0};
  }

  /**
   * Sets a handle as disabled. While a handle is disabled, it'll capture and interrupt dragging.
   * @param handle Handle element that should be disabled.
   */
  disableHandle(handle: HTMLElement) {
    if (!this._disabledHandles.has(handle) && this._handles.indexOf(handle) > -1) {
      this._disabledHandles.add(handle);
      toggleNativeDragInteractions(handle, true);
    }
  }

  /**
   * Enables a handle, if it has been disabled.
   * @param handle Handle element to be enabled.
   */
  enableHandle(handle: HTMLElement) {
    if (this._disabledHandles.has(handle)) {
      this._disabledHandles.delete(handle);
      toggleNativeDragInteractions(handle, this.disabled);
    }
  }

  /** Sets the layout direction of the draggable item. */
  withDirection(direction: Direction): this {
    this._direction = direction;
    return this;
  }

  /** Sets the container that the item is part of. */
  _withDropContainer(container: DropContainerRef) {
    this._dndContainerRef = container;
  }

  /**
   * Gets the current position in pixels the draggable outside of a drop container.
   */
  getFreeDragPosition(): Readonly<Point> {
    const position = this.isDragging() ? this._activeTransform : this._passiveTransform;
    return {x: position.x, y: position.y};
  }

  /**
   * Sets the current position in pixels the draggable outside of a drop container.
   * @param value New position to be set.
   */
  setFreeDragPosition(value: Point): this {
    this._activeTransform    = {x: 0, y: 0};
    this._passiveTransform.x = value.x;
    this._passiveTransform.y = value.y;

    if (!this._dndContainerRef) {
      this._applyRootElementTransform(value.x, value.y);
    }

    return this;
  }

  setProgramDragPosition(value: Point): this {
    this._activeTransform    = {x: 0, y: 0};
    this._passiveTransform.x = value.x;
    this._passiveTransform.y = value.y;

    this._initialTransform            = getTransform(value.x, value.y);
    this._rootElement.style.transform = this._initialTransform;

    return this;
  }

  /**
   * Sets the container into which to insert the preview element.
   * @param value Container into which to insert the preview.
   */
  withPreviewContainer(value: PreviewContainer): this {
    this._previewContainer = value;
    return this;
  }

  /** Updates the item's sort order based on the last-known pointer position. */
  _sortFromLastPointerPosition() {
    const position = this._lastKnownPointerPosition;

    if (position && this._dndContainerRef) {
      this._updateActiveDropContainer(this._getConstrainedPointerPosition(position), position);
    }
  }

  /** Unsubscribes from the global subscriptions. */
  private _removeSubscriptions() {
    this._pointerMoveSubscription.unsubscribe();
    this._pointerMoveIdleSubscription.unsubscribe();
    this._pointerUpSubscription.unsubscribe();
    this._scrollSubscription.unsubscribe();
  }

  /** Destroys the preview element and its ViewRef. */
  private _destroyPreview() {
    if (this._preview) {
      removeNode(this._preview);
    }

    // if (this._previewEmbeddedViewRef) {
    //   this._previewEmbeddedViewRef.destroy();
    // }

    if (this._previewRef) {
      this._previewRef.destroy();
    }

    this._preview = null!;
  }

  /** Destroys the placeholder element and its ViewRef. */
  private _destroyPlaceholder() {
    if (this._placeholder) {
      removeNode(this._placeholder);
    }

    if (this._placeholderEmbeddedViewRef) {
      this._placeholderEmbeddedViewRef.destroy();
    }

    this._placeholder = this._placeholderEmbeddedViewRef = null!;
  }

  /** Handler for the `mousedown`/`touchstart` events. */
  private _pointerDown = (event: MouseEvent | TouchEvent) => {
    this.beforeStarted.next();

    // Delegate the event based on whether it started from a handle or the element itself.
    if (this._handles.length) {
      const targetHandle = this._handles.find(handle => {
        const target = event.target;
        return !!target && (target === handle || handle.contains(target as HTMLElement));
      });

      if (targetHandle && !this._disabledHandles.has(targetHandle) && !this.disabled) {
        this._initializeDragSequence(targetHandle, event);
      }
    } else if (!this.disabled) {
      this._initializeDragSequence(this._rootElement, event);
    }
  };

  /**
   * sub function block of {@href _pointerMove}
   */
  private _startDragging(pointerPosition: Point, event: MouseEvent | TouchEvent) {
    const distanceX       = Math.abs(pointerPosition.x - this._pickupPositionOnPage.x);
    const distanceY       = Math.abs(pointerPosition.y - this._pickupPositionOnPage.y);
    const isOverThreshold = distanceX + distanceY >= this._config.dragStartThreshold;

    // Only start dragging after the user has moved more than the minimum distance in either
    // direction. Note that this is preferrable over doing something like `skip(minimumDistance)`
    // in the `pointerMove` subscription, because we're not guaranteed to have one move event
    // per pixel of movement (e.g. if the user moves their pointer quickly).
    if (isOverThreshold) {
      const isDelayElapsed = Date.now() >= this._dragStartTime + this._getDragStartDelay(event);
      const container      = this._dndContainerRef;

      if (!isDelayElapsed) {
        this._endDragSequence(event);
        return;
      }

      // Prevent other drag sequences from starting while something in the container is still
      // being dragged. This can happen while we're waiting for the drop animation to finish
      // and can cause errors, because some elements might still be moving around.
      if (!container || (!container.isDragging() && !container.isReceiving())) {
        // Prevent the default action as soon as the dragging sequence is considered as
        // "started" since waiting for the next event can allow the device to begin scrolling.
        event.preventDefault();
        this._hasStartedDragging = true;
        this._ngZone.run(() => this._startDragSequence(event));
      }
    }
  }

  /** Handler that is invoked when the user moves their pointer after they've initiated a drag. */
  private _pointerMove = (event: MouseEvent | TouchEvent) => {
    const pointerPosition = this._getPointerPositionOnPage(event);

    if (!this._hasStartedDragging) {
      this._startDragging(pointerPosition, event);

      return;
    }

    // We only need the preview dimensions if we have a boundary element.
    if (this._boundaryElement) {
      // Cache the preview element rect if we haven't cached it already or if
      // we cached it too early before the element dimensions were computed.
      if (!this._previewRect || (!this._previewRect.width && !this._previewRect.height)) {
        this._previewRect = (this._preview || this._rootElement).getBoundingClientRect();
      }
    }

    // We prevent the default action down here so that we know that dragging has started. This is
    // important for touch devices where doing this too early can unnecessarily block scrolling,
    // if there's a dragging delay.
    event.preventDefault();

    const constrainedPointerPosition = this._getConstrainedPointerPosition(pointerPosition);
    this._hasMoved                   = true;
    this._lastKnownPointerPosition   = pointerPosition;
    this._updatePointerDirectionDelta(constrainedPointerPosition);

    if (this._dndContainerRef) {
      this._updateActiveDropContainer(constrainedPointerPosition, pointerPosition);
    } else {
      const activeTransform = this._activeTransform;
      activeTransform.x     =
        constrainedPointerPosition.x - this._pickupPositionOnPage.x + this._passiveTransform.x;
      activeTransform.y     =
        constrainedPointerPosition.y - this._pickupPositionOnPage.y + this._passiveTransform.y;

      this._applyRootElementTransform(activeTransform.x, activeTransform.y);

      // Apply transform as attribute if dragging and svg element to work for IE
      if (typeof SVGElement !== 'undefined' && this._rootElement instanceof SVGElement) {
        const appliedTransform = `translate(${activeTransform.x} ${activeTransform.y})`;
        this._rootElement.setAttribute('transform', appliedTransform);
      }
    }

    // Since this event gets fired for every pixel while dragging, we only
    // want to fire it if the consumer opted into it. Also we have to
    // re-enter the zone because we run all of the events on the outside.
    if (this._moveEvents.observers.length) {
      this._ngZone.run(() => {
        this._moveEvents.next({
          source         : this,
          pointerPosition: constrainedPointerPosition,
          event,
          distance       : this._getDragDistance(constrainedPointerPosition),
          delta          : this._pointerDirectionDelta
        });
      });
    }
  };

  /** Handler that is invoked when the user lifts their pointer up, after initiating a drag. */
  private _pointerUp = (event: MouseEvent | TouchEvent) => {
    this._endDragSequence(event);
  };

  /**
   * Clears subscriptions and stops the dragging sequence.
   * @param event Browser event object that ended the sequence.
   */
  private _endDragSequence(event: MouseEvent | TouchEvent) {
    // Note that here we use `isDragging` from the service, rather than from `this`.
    // The difference is that the one from the service reflects whether a dragging sequence
    // has been initiated, whereas the one on `this` includes whether the user has passed
    // the minimum dragging threshold.
    if (!this._dragDropRegistry.isDragging(this)) {
      return;
    }

    this._removeSubscriptions();
    this._dragDropRegistry.stopDragging(this);
    this._toggleNativeDragInteractions();

    if (this._handles) {
      (this._rootElement.style as DragCSSStyleDeclaration).webkitTapHighlightColor = this._rootElementTapHighlight;
    }

    if (!this._hasStartedDragging) {
      return;
    }

    this.released.next({source: this});

    if (this._dndContainerRef) {
      // Stop scrolling immediately, instead of waiting for the animation to finish.
      this._dndContainerRef._stopScrolling();
      this._animatePreviewToPlaceholder().then(() => {
        this._cleanupDragArtifacts(event);
        this._cleanupCachedDimensions();
        this._dragDropRegistry.stopDragging(this);
      });
    } else {
      // Convert the active transform into a passive one. This means that next time
      // the user starts dragging the item, its position will be calculated relatively
      // to the new passive transform.
      this._passiveTransform.x = this._activeTransform.x;
      this._passiveTransform.y = this._activeTransform.y;
      const pointerPosition    = this._getPointerPositionOnPage(event);
      this._ngZone.run(() => {
        this.ended.next({
          source   : this,
          distance : this._getDragDistance(pointerPosition),
          dropPoint: pointerPosition
        });
      });
      this._cleanupCachedDimensions();
      this._dragDropRegistry.stopDragging(this);
    }
  }

  /** Starts the dragging sequence. */
  private _startDragSequence(event: MouseEvent | TouchEvent) {
    if (isTouchEvent(event)) {
      this._lastTouchEventTime = Date.now();
    }

    this._toggleNativeDragInteractions();

    const dndContainer = this._dndContainerRef;

    if (dndContainer) {
      const element     = this._rootElement;
      const parent      = element.parentNode as HTMLElement;
      const placeholder = this._placeholder = this._createPlaceholderElement();
      const anchor      = this._anchor = this._anchor || this._document.createComment('');

      // Needs to happen before the root element is moved.
      const shadowRoot = this._getShadowRoot();

      // Insert an anchor node so that we can restore the element's position in the DOM.
      parent.insertBefore(anchor, element);

      // There's no risk of transforms stacking when inside a drop container so
      // we can keep the initial transform up to date any time dragging starts.
      this._initialTransform = element.style.transform || '';

      // Create the preview after the initial transform has
      // been cached, because it can be affected by the transform.
      this._previewRef = this._createPreviewRef();

      this._preview = this._previewRef.previewElement;

      // if trag start in drag container
      if (dndContainer instanceof DragContainerRef) {
        removeNode(placeholder);
      } else {
        // We move the element out at the end of the body and we make it hidden, because keeping it in
        // place will throw off the consumer's `:last-child` selectors. We can't remove the element
        // from the DOM completely, because iOS will stop firing all subsequent events in the chain.
        toggleVisibility(element, false);
        this._document.body.appendChild(parent.replaceChild(placeholder, element));
      }

      this._getPreviewInsertionPoint(parent, shadowRoot).appendChild(this._preview);
      this.started.next({source: this}); // Emit before notifying the container.
      dndContainer.start();
      this._initialContainer = dndContainer;
      this._initialIndex     = dndContainer.getItemIndex(this);
    } else {
      this.started.next({source: this});
      this._initialContainer = this._initialIndex = undefined!;
    }

    // Important to run after we've called `start` on the parent container
    // so that it has had time to resolve its scrollable parents.
    this._parentPositions.cache(dndContainer ? dndContainer.getScrollableParents() : []);
  }

  /**
   * Sets up the different variables and subscriptions
   * that will be necessary for the dragging sequence.
   * @param referenceElement Element that started the drag sequence.
   * @param event Browser event object that started the sequence.
   */
  private _initializeDragSequence(referenceElement: HTMLElement, event: MouseEvent | TouchEvent) {
    // Stop propagation if the item is inside another
    // draggable so we don't start multiple drag sequences.
    if (this._parentDragRef) {
      event.stopPropagation();
    }

    const isDragging             = this.isDragging();
    const isTouchSequence        = isTouchEvent(event);
    const isAuxiliaryMouseButton = !isTouchSequence && (event as MouseEvent).button !== 0;
    const rootElement            = this._rootElement;
    const isSyntheticEvent       = !isTouchSequence && this._lastTouchEventTime &&
      this._lastTouchEventTime + MOUSE_EVENT_IGNORE_TIME > Date.now();

    // If the event started from an element with the native HTML drag&drop, it'll interfere
    // with our own dragging (e.g. `img` tags do it by default). Prevent the default action
    // to stop it from happening. Note that preventing on `dragstart` also seems to work, but
    // it's flaky and it fails if the user drags it away quickly. Also note that we only want
    // to do this for `mousedown` since doing the same for `touchstart` will stop any `click`
    // events from firing on touch devices.
    if (event.target && (event.target as HTMLElement).draggable && event.type === 'mousedown') {
      event.preventDefault();
    }

    // Abort if the user is already dragging or is using a mouse button other than the primary one.
    if (isDragging || isAuxiliaryMouseButton || isSyntheticEvent) {
      return;
    }

    // If we've got handles, we need to disable the tap highlight on the entire root element,
    // otherwise iOS will still add it, even though all the drag interactions on the handle
    // are disabled.
    if (this._handles.length) {
      this._rootElementTapHighlight                      = (rootElement.style as any).webkitTapHighlightColor || '';
      (rootElement.style as any).webkitTapHighlightColor = 'transparent';
    }

    this._hasStartedDragging = this._hasMoved = false;

    // Avoid multiple subscriptions and memory leaks when multi touch
    // (isDragging check above isn't enough because of possible temporal and/or dimensional delays)
    this._removeSubscriptions();
    this._pointerMoveSubscription = this._dragDropRegistry.pointerMove.subscribe(this._pointerMove);
    this._pointerUpSubscription   = this._dragDropRegistry.pointerUp.subscribe(this._pointerUp);
    this._scrollSubscription      = this._dragDropRegistry.scroll.subscribe(scrollEvent => {
      this._updateOnScroll(scrollEvent);
    });

    if (this._boundaryElement) {
      this._boundaryRect = getMutableClientRect(this._boundaryElement);
    }

    // If we have a custom preview we can't know ahead of time how large it'll be so we position
    // it next to the cursor. The exception is when the consumer has opted into making the preview
    // the same size as the root element, in which case we do know the size.
    const previewTemplate                      = this._previewTemplate;
    this._pickupPositionInElement              = previewTemplate && previewTemplate.template &&
    !previewTemplate.matchSize ? {x: 0, y: 0} :
      this._getPointerPositionInElement(referenceElement, event);
    const pointerPosition                      = this._pickupPositionOnPage = this._lastKnownPointerPosition =
      this._getPointerPositionOnPage(event);
    this._pointerDirectionDelta                = {x: 0, y: 0};
    this._pointerPositionAtLastDirectionChange = {x: pointerPosition.x, y: pointerPosition.y};
    this._dragStartTime                        = Date.now();
    this._dragDropRegistry.startDragging(this, event);
  }

  /** Cleans up the DOM artifacts that were added to facilitate the element being dragged. */
  private _cleanupDragArtifacts(event: MouseEvent | TouchEvent) {
    // Restore the element's visibility and insert it at its old position in the DOM.
    // It's important that we maintain the position, because moving the element around in the DOM
    // can throw off `NgFor` which does smart diffing and re-creates elements only when necessary,
    // while moving the existing elements in all other cases.
    toggleVisibility(this._rootElement, true, undefined,
      this._initialContainer.getItemPosition(this));
    this._anchor.parentNode!.replaceChild(this._rootElement, this._anchor);

    this._destroyPreview();
    this._destroyPlaceholder();
    this._boundaryRect = this._previewRect = this._initialTransform = undefined;

    // Re-enter the NgZone since we bound `document` events on the outside.
    this._ngZone.run(() => {
      const container              = this._dndContainerRef!;
      const currentIndex           = container.getItemIndex(this);
      const pointerPosition        = this._getPointerPositionOnPage(event);
      const distance               = this._getDragDistance(pointerPosition);
      const isPointerOverContainer = container._isOverContainer(
        pointerPosition.x, pointerPosition.y);

      const {x, y} = this._getConstrainedPointerPosition(pointerPosition);

      const elementPositionX = x - this._pickupPositionInElement.x;
      const elementPositionY = y - this._pickupPositionInElement.y;
      let elementRelativePosition;
      if (isPointerOverContainer) {
        elementRelativePosition = {
          x: elementPositionX - container._clientRect.left,
          y: elementPositionY - container._clientRect.top,
        };
      }

      this.ended.next({source: this, distance, dropPoint: pointerPosition});
      this.dropped.next({
        item             : this,
        currentIndex,
        elementPositionX,
        elementPositionY,
        previousIndex    : this._initialIndex,
        container        : container,
        previousContainer: this._initialContainer,
        isPointerOverContainer,
        distance,
        dropPoint        : pointerPosition,
        elementRelativePosition,
      });
      container.drop(this, currentIndex, elementPositionX, elementPositionY,
        this._initialIndex, this._initialContainer,
        isPointerOverContainer, distance, pointerPosition, elementRelativePosition);
      this._dndContainerRef = this._initialContainer;
    });
  }

  /**
   * Updates the item's position in its drop container, or moves it
   * into a new one, depending on its current drag position.
   */
  private _updateActiveDropContainer({x, y}: Point, {x: rawX, y: rawY}: Point) {
    if (this._preStartedContainerRef) {
      this._preStartedContainerRef._isPreStarted = false;
    }
    this._pointerMoveIdleSubscription.unsubscribe();

    // Drop container that draggable has been moved into.
    let newContainer = this._initialContainer._getSiblingContainerFromPosition(this, x, y);

    // If we couldn't find a new container to move the item into, and the item has left its
    // initial container, check whether the it's over the initial container. This handles the
    // case where two containers are connected one way and the user tries to undo dragging an
    // item into a new container.
    // drag back to _initialContainer when have drag out to another container
    if (!newContainer && this._dndContainerRef !== this._initialContainer &&
      this._initialContainer._isOverContainer(x, y)) {
      newContainer = this._initialContainer;
    }

    if (newContainer && newContainer !== this._dndContainerRef) {
      const element                     = coerceElement(newContainer!.element);
      element.style.filter              = 'blur(1px)';
      element.style.opacity             = '0.9';
      newContainer._isPreStarted        = true;
      this._preStartedContainerRef      = newContainer;
      this._pointerMoveIdleSubscription = this._dragDropRegistry.pointerPressIdle.pipe(
        // tap(() => {
        //   element.style.filter  = '';
        //   element.style.opacity = '';
        // }),
        take(2),
        finalize(() => {
          element.style.filter       = null;
          element.style.opacity      = null;
          newContainer._isPreStarted = false;
        }),
        takeLast(1),
        tap(() => {
          this._ngZone.run(() => {
            // Notify the old container that the item has left.
            this.exited.next({item: this, container: this._dndContainerRef!});
            this._dndContainerRef!.exit(this);

            // Notify the new container that the item has entered.
            this._dndContainerRef = newContainer!;
            this._dndContainerRef.enter(this, x, y);
            this.entered.next({
              item        : this,
              container   : newContainer!,
              currentIndex: newContainer!.getItemIndex(this)
            });
          });
        })
      ).subscribe();
    }

    this._dndContainerRef!._startScrollingIfNecessary(rawX, rawY);
    const elementPositionX = x - this._pickupPositionInElement.x;
    const elementPositionY = y - this._pickupPositionInElement.y;
    this._dndContainerRef!._arrangeItem(this, x, y, elementPositionX, elementPositionY,
      this._pointerDirectionDelta);
    this._applyPreviewTransform(
      x - this._pickupPositionInElement.x, y - this._pickupPositionInElement.y);
  }

  private _createPreviewRef() {
    const previewConfig   = this._previewTemplate;
    const previewClass    = this.previewClass;
    const previewTemplate = previewConfig ? previewConfig.template : null;

    if (previewTemplate && previewConfig) {
      const previewRef = DragPreviewRef.createPreviewByTemplate(
        this._document,
        this._rootElement,
        previewClass,
        previewTemplate,
        previewConfig,
        this._pickupPositionOnPage,
        this._config.zIndex,
        this._direction,
        this._pickupPositionInElement
      );
      // this._previewEmbeddedViewRef = previewRef._previewEmbeddedViewRef;
      return previewRef;
    } else {
      return DragPreviewRef.createPreviewByElement(
        previewConfig,
        this._rootElement,
        previewClass,
        this._initialTransform,
        this._config.zIndex,
        this._direction,
        this._pickupPositionOnPage,
        this._pickupPositionInElement
      );
    }
  }

  /**
   * Animates the preview element from its current position to the location of the drop placeholder.
   * @returns Promise that resolves when the animation completes.
   */
  private _animatePreviewToPlaceholder(): Promise<void> {
    // If the user hasn't moved yet, the transitionend event won't fire.
    if (!this._hasMoved || this.isDropInDragContainer()) {
      return Promise.resolve();
    }

    const placeholderRect = this._placeholder.getBoundingClientRect();

    // Apply the class that adds a transition to the preview.
    this._preview.classList.add('tri-drag-animating');

    // Move the preview to the placeholder position.
    this._applyPreviewTransform(placeholderRect.left, placeholderRect.top);
    this._applyPreviewSize(placeholderRect.width, placeholderRect.height);

    // If the element doesn't have a `transition`, the `transitionend` event won't fire. Since
    // we need to trigger a style recalculation in order for the `tri-drag-animating` class to
    // apply its style, we take advantage of the available info to figure out whether we need to
    // bind the event in the first place.
    const duration = getTransformTransitionDurationInMs(this._preview);

    return this._animateDone(this._preview, duration, 'transform');
  }

  _animateDone(element: HTMLElement, duration: number, property: string): Promise<void> {
    if (duration === 0) {
      return Promise.resolve();
    }
    return this._ngZone.runOutsideAngular(() => {
      return new Promise(resolve => {
        const handler = ((event: TransitionEvent) => {
          if (!event || (event.target === element && event.propertyName === property)) {
            element.removeEventListener('transitionend', handler);
            resolve();
            clearTimeout(timeout);
          }
        }) as EventListenerOrEventListenerObject;

        // If a transition is short enough, the browser might not fire the `transitionend` event.
        // Since we know how long it's supposed to take, add a timeout with a 50% buffer that'll
        // fire if the transition hasn't completed when it was supposed to.
        const timeout = setTimeout(handler as Function, duration * 1.5);
        element.addEventListener('transitionend', handler);
      });
    });
  }

  /** Creates an element that will be shown instead of the current element while dragging. */
  private _createPlaceholderElement(): HTMLElement {
    const placeholderConfig   = this._placeholderTemplate;
    const placeholderTemplate = placeholderConfig ? placeholderConfig.template : null;
    let placeholder: HTMLElement;

    if (placeholderTemplate) {
      this._placeholderEmbeddedViewRef = placeholderConfig!.viewContainer.createEmbeddedView(
        placeholderTemplate,
        placeholderConfig!.context
      );
      this._placeholderEmbeddedViewRef.detectChanges();
      placeholder = getRootNode(this._placeholderEmbeddedViewRef, this._document);
    } else {
      placeholder = deepCloneNode(this._rootElement);
    }

    placeholder.classList.add('tri-drag-placeholder');
    return placeholder;
  }

  /**
   * Figures out the coordinates at which an element was picked up.
   * @param referenceElement Element that initiated the dragging.
   * @param event Event that initiated the dragging.
   */
  private _getPointerPositionInElement(referenceElement: HTMLElement,
                                       event: MouseEvent | TouchEvent): Point {
    const elementRect    = this._rootElement.getBoundingClientRect();
    const handleElement  = referenceElement === this._rootElement ? null : referenceElement;
    const referenceRect  = handleElement ? handleElement.getBoundingClientRect() : elementRect;
    const point          = isTouchEvent(event) ? event.targetTouches[0] : event;
    const scrollPosition = this._getViewportScrollPosition();
    const x              = point.pageX - referenceRect.left - scrollPosition.left;
    const y              = point.pageY - referenceRect.top - scrollPosition.top;

    return {
      x: referenceRect.left - elementRect.left + x,
      y: referenceRect.top - elementRect.top + y
    };
  }

  /** Determines the point of the page that was touched by the user. */
  private _getPointerPositionOnPage(event: MouseEvent | TouchEvent): Point {
    const scrollPosition = this._getViewportScrollPosition();
    const point          = isTouchEvent(event) ?
      // `touches` will be empty for start/end events so we have to fall back to `changedTouches`.
      // Also note that on real devices we're guaranteed for either `touches` or `changedTouches`
      // to have a value, but Firefox in device emulation mode has a bug where both can be empty
      // for `touchstart` and `touchend` so we fall back to a dummy object in order to avoid
      // throwing an error. The value returned here will be incorrect, but since this only
      // breaks inside a developer tool and the value is only used for secondary information,
      // we can get away with it. See https://bugzilla.mozilla.org/show_bug.cgi?id=1615824.
      (event.touches[0] || event.changedTouches[0] || {pageX: 0, pageY: 0}) : event;

    const x = point.pageX - scrollPosition.left;
    const y = point.pageY - scrollPosition.top;

    // if dragging SVG element, try to convert from the screen coordinate system to the SVG
    // coordinate system
    if (this._ownerSVGElement) {
      const svgMatrix = this._ownerSVGElement.getScreenCTM();
      if (svgMatrix) {
        const svgPoint = this._ownerSVGElement.createSVGPoint();
        svgPoint.x     = x;
        svgPoint.y     = y;
        return svgPoint.matrixTransform(svgMatrix.inverse());
      }
    }

    return {x, y};
  }


  /** Gets the pointer position on the page, accounting for any position constraints. */
  private _getConstrainedPointerPosition(point: Point): Point {
    const dropContainerLock = this._dndContainerRef ? this._dndContainerRef.lockAxis : null;
    let {x, y}              = this.constrainPosition ? this.constrainPosition(point, this) : point;

    if (this.lockAxis === 'x' || dropContainerLock === 'x') {
      y = this._pickupPositionOnPage.y;
    } else if (this.lockAxis === 'y' || dropContainerLock === 'y') {
      x = this._pickupPositionOnPage.x;
    }

    if (this._boundaryRect) {
      const {x: pickupX, y: pickupY} = this._pickupPositionInElement;
      const boundaryRect             = this._boundaryRect;
      const previewRect              = this._previewRect!;
      const minY                     = boundaryRect.top + pickupY;
      const maxY                     = boundaryRect.bottom - (previewRect.height - pickupY);
      const minX                     = boundaryRect.left + pickupX;
      const maxX                     = boundaryRect.right - (previewRect.width - pickupX);

      x = clamp(x, minX, maxX);
      y = clamp(y, minY, maxY);
    }

    return {x, y};
  }


  /** Updates the current drag delta, based on the user's current pointer position on the page. */
  private _updatePointerDirectionDelta(pointerPositionOnPage: Point) {
    const {x, y}                  = pointerPositionOnPage;
    const delta                   = this._pointerDirectionDelta;
    const positionSinceLastChange = this._pointerPositionAtLastDirectionChange;

    // Amount of pixels the user has dragged since the last time the direction changed.
    const changeX = Math.abs(x - positionSinceLastChange.x);
    const changeY = Math.abs(y - positionSinceLastChange.y);

    // Because we handle pointer events on a per-pixel basis, we don't want the delta
    // to change for every pixel, otherwise anything that depends on it can look erratic.
    // To make the delta more consistent, we track how much the user has moved since the last
    // delta change and we only update it after it has reached a certain threshold.
    if (changeX > this._config.pointerDirectionChangeThreshold) {
      delta.x                   = x > positionSinceLastChange.x ? 1 : -1;
      positionSinceLastChange.x = x;
    }

    if (changeY > this._config.pointerDirectionChangeThreshold) {
      delta.y                   = y > positionSinceLastChange.y ? 1 : -1;
      positionSinceLastChange.y = y;
    }

    return delta;
  }

  /** Toggles the native drag interactions, based on how many handles are registered. */
  private _toggleNativeDragInteractions() {
    if (!this._rootElement || !this._handles) {
      return;
    }

    const shouldEnable = this._handles.length > 0 || !this.isDragging();

    if (shouldEnable !== this._nativeInteractionsEnabled) {
      this._nativeInteractionsEnabled = shouldEnable;
      toggleNativeDragInteractions(this._rootElement, shouldEnable);
    }
  }

  /** Removes the manually-added event listeners from the root element. */
  private _removeRootElementListeners(element: HTMLElement) {
    element.removeEventListener('mousedown', this._pointerDown, activeEventListenerOptions);
    element.removeEventListener('touchstart', this._pointerDown, passiveEventListenerOptions);
  }

  /**
   * Applies a `transform` to the root element, taking into account any existing transforms on it.
   * @param x New transform value along the X axis.
   * @param y New transform value along the Y axis.
   */
  private _applyRootElementTransform(x: number, y: number) {
    const transform = getTransform(x, y);

    // Cache the previous transform amount only after the first drag sequence, because
    // we don't want our own transforms to stack on top of each other.
    if (this._initialTransform == null) {
      this._initialTransform = this._rootElement.style.transform || '';
    }

    // Preserve the previous `transform` value, if there was one. Note that we apply our own
    // transform before the user's, because things like rotation can affect which direction
    // the element will be translated towards.
    this._rootElement.style.transform = combineTransforms(transform, this._initialTransform);
  }

  /**
   * Applies a `transform` to the preview, taking into account any existing transforms on it.
   * @param x New transform value along the X axis.
   * @param y New transform value along the Y axis.
   */
  private _applyPreviewTransform(x: number, y: number) {
    this._previewRef.applyTransform(x, y);
  }

  private _applyPreviewSize(width: number, height: number) {
    this._previewRef.applySize(width, height);
  }

  /**
   * Gets the distance that the user has dragged during the current drag sequence.
   * @param currentPosition Current position of the user's pointer.
   */
  private _getDragDistance(currentPosition: Point): Point {
    const pickupPosition = this._pickupPositionOnPage;

    if (pickupPosition) {
      return {x: currentPosition.x - pickupPosition.x, y: currentPosition.y - pickupPosition.y};
    }

    return {x: 0, y: 0};
  }

  /** Cleans up any cached element dimensions that we don't need after dragging has stopped. */
  private _cleanupCachedDimensions() {
    this._boundaryRect = this._previewRect = undefined;
    this._parentPositions.clear();
  }

  /**
   * Checks whether the element is still inside its boundary after the viewport has been resized.
   * If not, the position is adjusted so that the element fits again.
   */
  private _containInsideBoundaryOnResize() {
    let {x, y} = this._passiveTransform;

    if ((x === 0 && y === 0) || this.isDragging() || !this._boundaryElement) {
      return;
    }

    const boundaryRect = this._boundaryElement.getBoundingClientRect();
    const elementRect  = this._rootElement.getBoundingClientRect();

    // It's possible that the element got hidden away after dragging (e.g. by switching to a
    // different tab). Don't do anything in this case so we don't clear the user's position.
    if ((boundaryRect.width === 0 && boundaryRect.height === 0) ||
      (elementRect.width === 0 && elementRect.height === 0)) {
      return;
    }

    const leftOverflow   = boundaryRect.left - elementRect.left;
    const rightOverflow  = elementRect.right - boundaryRect.right;
    const topOverflow    = boundaryRect.top - elementRect.top;
    const bottomOverflow = elementRect.bottom - boundaryRect.bottom;

    // If the element has become wider than the boundary, we can't
    // do much to make it fit so we just anchor it to the left.
    if (boundaryRect.width > elementRect.width) {
      if (leftOverflow > 0) {
        x += leftOverflow;
      }

      if (rightOverflow > 0) {
        x -= rightOverflow;
      }
    } else {
      x = 0;
    }

    // If the element has become taller than the boundary, we can't
    // do much to make it fit so we just anchor it to the top.
    if (boundaryRect.height > elementRect.height) {
      if (topOverflow > 0) {
        y += topOverflow;
      }

      if (bottomOverflow > 0) {
        y -= bottomOverflow;
      }
    } else {
      y = 0;
    }

    if (x !== this._passiveTransform.x || y !== this._passiveTransform.y) {
      this.setFreeDragPosition({y, x});
    }
  }

  /** Gets the drag start delay, based on the event type. */
  private _getDragStartDelay(event: MouseEvent | TouchEvent): number {
    const value = this.dragStartDelay;

    if (typeof value === 'number') {
      return value;
    } else if (isTouchEvent(event)) {
      return value.touch;
    }

    return value ? value.mouse : 0;
  }

  /** Updates the internal state of the draggable element when scrolling has occurred. */
  private _updateOnScroll(event: Event) {
    const scrollDifference = this._parentPositions.handleScroll(event);

    if (scrollDifference) {
      const target = event.target as Node;

      // ClientRect dimensions are based on the scroll position of the page and its parent node so
      // we have to update the cached boundary ClientRect if the user has scrolled. Check for
      // the `document` specifically since IE doesn't support `contains` on it.
      if (this._boundaryRect && (target === this._document ||
        (target !== this._boundaryElement && target.contains(this._boundaryElement)))) {
        adjustClientRect(this._boundaryRect, scrollDifference.top, scrollDifference.left);
      }

      this._pickupPositionOnPage.x += scrollDifference.left;
      this._pickupPositionOnPage.y += scrollDifference.top;

      // If we're in free drag mode, we have to update the active transform, because
      // it isn't relative to the viewport like the preview inside a drop list.
      if (!this._dndContainerRef) {
        this._activeTransform.x -= scrollDifference.left;
        this._activeTransform.y -= scrollDifference.top;
        this._applyRootElementTransform(this._activeTransform.x, this._activeTransform.y);
      }
    }
  }

  /** Gets the scroll position of the viewport. */
  private _getViewportScrollPosition() {
    const cachedPosition = this._parentPositions.positions.get(this._document);
    return cachedPosition ? cachedPosition.scrollPosition :
      this._viewportRuler.getViewportScrollPosition();
  }

  /**
   * Lazily resolves and returns the shadow root of the element. We do this in a function, rather
   * than saving it in property directly on init, because we want to resolve it as late as possible
   * in order to ensure that the element has been moved into the shadow DOM. Doing it inside the
   * constructor might be too early if the element is inside of something like `ngFor` or `ngIf`.
   */
  private _getShadowRoot(): ShadowRoot | null {
    if (this._cachedShadowRoot === undefined) {
      this._cachedShadowRoot = _getShadowRoot(this._rootElement) as ShadowRoot | null;
    }

    return this._cachedShadowRoot;
  }

  /** Gets the element into which the drag preview should be inserted. */
  private _getPreviewInsertionPoint(initialParent: HTMLElement,
                                    shadowRoot: ShadowRoot | null): HTMLElement {
    const previewContainer = this._previewContainer || 'global';

    if (previewContainer === 'parent') {
      return initialParent;
    }

    if (previewContainer === 'global') {
      const documentRef = this._document;

      // We can't use the body if the user is in fullscreen mode,
      // because the preview will render under the fullscreen element.
      // TODO(crisbeto): dedupe this with the `FullscreenOverlayContainer` eventually.
      return shadowRoot ||
        documentRef.fullscreenElement ||
        (documentRef as any).webkitFullscreenElement ||
        (documentRef as any).mozFullScreenElement ||
        (documentRef as any).msFullscreenElement ||
        documentRef.body;
    }

    return coerceElement(previewContainer);
  }
}

/**
 * Gets a 3d `transform` that can be applied to an element.
 * @param x Desired position of the element along the X axis.
 * @param y Desired position of the element along the Y axis.
 */
function getTransform(x: number, y: number): string {
  // Round the transforms since some browsers will
  // blur the elements for sub-pixel transforms.
  return `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0)`;
}

/** Clamps a value between a minimum and a maximum. */
function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

/**
 * Helper to remove a node from the DOM and to do all the necessary null checks.
 * @param node Node to be removed.
 */
function removeNode(node: Node | null) {
  if (node && node.parentNode) {
    node.parentNode.removeChild(node);
  }
}

/** Determines whether an event is a touch event. */
function isTouchEvent(event: MouseEvent | TouchEvent): event is TouchEvent {
  // This function is called for every pixel that the user has dragged so we need it to be
  // as fast as possible. Since we only bind mouse events and touch events, we can assume
  // that if the event's name starts with `t`, it's a touch event.
  return event.type[0] === 't';
}

/**
 * Gets the root HTML element of an embedded view.
 * If the root is not an HTML element it gets wrapped in one.
 */
function getRootNode(viewRef: EmbeddedViewRef<any>, _document: Document): HTMLElement {
  const rootNodes: Node[] = viewRef.rootNodes;

  if (rootNodes.length === 1 && rootNodes[0].nodeType === _document.ELEMENT_NODE) {
    return rootNodes[0] as HTMLElement;
  }

  const wrapper = _document.createElement('div');
  rootNodes.forEach(node => wrapper.appendChild(node));
  return wrapper;
}

/**
 * Matches the target element's size to the source's size.
 * @param target Element that needs to be resized.
 * @param sourceRect Dimensions of the source element.
 */
function matchElementSize(target: HTMLElement, sourceRect: ClientRect): void {
  target.style.width     = `${sourceRect.width}px`;
  target.style.height    = `${sourceRect.height}px`;
  target.style.transform = getTransform(sourceRect.left, sourceRect.top);
}
