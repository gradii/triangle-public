/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */


import { Directionality } from '@angular/cdk/bidi';
import {
  BooleanInput, coerceBooleanProperty, coerceElement, coerceNumberProperty
} from '@angular/cdk/coercion';
import {
  AfterViewInit, ChangeDetectorRef, ContentChild, ContentChildren, Directive, ElementRef,
  EventEmitter, Inject, Input, NgZone, OnChanges, OnDestroy, Optional, Output, QueryList, Self,
  SimpleChanges, SkipSelf, ViewContainerRef,
} from '@angular/core';
import { merge, Observable, Observer, Subject } from 'rxjs';
import { map, startWith, switchMap, take, takeUntil, tap } from 'rxjs/operators';
import { DragDrop } from '../drag-drop';
import { DragRef, Point, PreviewContainer } from '../drag-drop-ref/drag-ref';
import { TRI_DRAG_PARENT } from '../drag-parent';
import {
  TriDragDrop, TriDragEnd, TriDragEnter, TriDragExit, TriDragMove, TriDragRelease, TriDragStart,
} from '../event/drag-events';
import { assertElementNode } from './assertions';
import { DragAxis, DragDropConfig, DragStartDelay, TRI_DRAG_CONFIG } from './config';
import { TRI_DRAG_HANDLE, TriDragHandle } from './drag-handle';
import { TRI_DRAG_PLACEHOLDER, TriDragPlaceholder } from './drag-placeholder';
import { TRI_DRAG_PREVIEW, TriDragPreview } from './drag-preview';
import { TRI_DROP_CONTAINER } from './drop-container';
import { TriDropContainerInternal as TriDropContainer } from './drop-list-container';

declare const ngDevMode: object | null;

const DRAG_HOST_CLASS = 'tri-drag';

/** Element that can be moved inside a TriDropContainer container. */
@Directive({
  selector : '[triDrag]',
  exportAs : 'triDrag',
  host     : {
    'class'                    : DRAG_HOST_CLASS,
    '[class.tri-drag-disabled]': 'disabled',
    '[class.tri-drag-dragging]': '_dragRef.isDragging()',
  },
  providers: [{provide: TRI_DRAG_PARENT, useExisting: TriDrag}]
})
export class TriDrag<T = any> implements AfterViewInit, OnChanges, OnDestroy {
  private readonly _destroyed              = new Subject<void>();
  private static _dragInstances: TriDrag[] = [];

  /** Reference to the underlying drag instance. */
  _dragRef: DragRef<TriDrag<T>>;

  /** Elements that can be used to drag the draggable item. */
  @ContentChildren(TRI_DRAG_HANDLE, {descendants: true}) _handles: QueryList<TriDragHandle>;

  /** Element that will be used as a template to create the draggable item's preview. */
  @ContentChild(TRI_DRAG_PREVIEW) _previewTemplate: TriDragPreview;

  /** Template for placeholder element rendered to show where a draggable would be dropped. */
  @ContentChild(TRI_DRAG_PLACEHOLDER) _placeholderTemplate: TriDragPlaceholder;

  /** Arbitrary data to attach to this drag instance. */
  @Input('triDragData') data: T;

  /** Locks the position of the dragged element along the specified axis. */
  @Input('triDragLockAxis') lockAxis: DragAxis;

  /**
   * Selector that will be used to determine the root draggable element, starting from
   * the `triDrag` element and going up the DOM. Passing an alternate root element is useful
   * when trying to enable dragging on an element that you might not have access to.
   */
  @Input('triDragRootElement') rootElementSelector: string;

  /**
   * Node or selector that will be used to determine the element to which the draggable's
   * position will be constrained. If a string is passed in, it'll be used as a selector that
   * will be matched starting from the element's parent and going up the DOM until a match
   * has been found.
   */
  @Input('triDragBoundary') boundaryElement: string | ElementRef<HTMLElement> | HTMLElement;

  /**
   * Amount of milliseconds to wait after the user has put their
   * pointer down before starting to drag the element.
   */
  @Input('triDragStartDelay') dragStartDelay: DragStartDelay;

  /**
   * Sets the position of a `TriDrag` that is outside of a drop container.
   * Can be used to restore the element's position for a returning user.
   */
  @Input('triDragFreeDragPosition') freeDragPosition: { x: number, y: number };

  programDragPosition: { x: number, y: number };

  /** Whether starting to drag this element is disabled. */
  @Input('triDragDisabled')
  get disabled(): boolean {
    return this._disabled || (this.dropContainer && this.dropContainer.disabled);
  }

  set disabled(value: boolean) {
    this._disabled         = coerceBooleanProperty(value);
    this._dragRef.disabled = this._disabled;
  }

  private _disabled: boolean;

  /**
   * Function that can be used to customize the logic of how the position of the drag item
   * is limited while it's being dragged. Gets called with a point containing the current position
   * of the user's pointer on the page and should return a point describing where the item should
   * be rendered.
   */
  @Input('triDragConstrainPosition') constrainPosition?: (point: Point, dragRef: DragRef) => Point;

  /** Class to be added to the preview element. */
  @Input('triDragPreviewClass') previewClass: string | string[];

  /**
   * Configures the place into which the preview of the item will be inserted. Can be configured
   * globally through `TRI_DROP_CONTAINER`. Possible values:
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
  @Input('triDragPreviewContainer') previewContainer: PreviewContainer;

  /** Emits when the user starts dragging the item. */
  @Output('triDragStarted') readonly started: EventEmitter<TriDragStart> =
    new EventEmitter<TriDragStart>();

  /** Emits when the user has released a drag item, before any animations have started. */
  @Output('triDragReleased') readonly released: EventEmitter<TriDragRelease> =
    new EventEmitter<TriDragRelease>();

  /** Emits when the user stops dragging an item in the container. */
  @Output('triDragEnded') readonly ended: EventEmitter<TriDragEnd> = new EventEmitter<TriDragEnd>();

  /** Emits when the user has moved the item into a new container. */
  @Output('triDragEntered') readonly entered: EventEmitter<TriDragEnter<any>> =
    new EventEmitter<TriDragEnter<any>>();

  /** Emits when the user removes the item its container by dragging it into another container. */
  @Output('triDragExited') readonly exited: EventEmitter<TriDragExit<any>> =
    new EventEmitter<TriDragExit<any>>();

  /** Emits when the user drops the item inside a container. */
  @Output('triDragDropped') readonly dropped: EventEmitter<TriDragDrop<any>> =
    new EventEmitter<TriDragDrop<any>>();

  /**
   * Emits as the user is dragging the item. Use with caution,
   * because this event will fire for every pixel that the user has dragged.
   */
  @Output('triDragMoved')
  readonly moved: Observable<TriDragMove<T>> =
    new Observable((observer: Observer<TriDragMove<T>>) => {
      const subscription = this._dragRef.moved.pipe(map(movedEvent => ({
        source         : this,
        pointerPosition: movedEvent.pointerPosition,
        event          : movedEvent.event,
        delta          : movedEvent.delta,
        distance       : movedEvent.distance
      }))).subscribe(observer);

      return () => {
        subscription.unsubscribe();
      };
    });

  constructor(
    /** Element that the draggable is attached to. */
    public element: ElementRef<HTMLElement>,
    /** Droppable container that the draggable is a part of. */
    @Inject(TRI_DROP_CONTAINER) @Optional() @SkipSelf() public dropContainer: TriDropContainer,
    protected _ngZone: NgZone,
    protected _viewContainerRef: ViewContainerRef,
    @Optional() @Inject(TRI_DRAG_CONFIG) config: DragDropConfig,
    @Optional() protected _dir: Directionality, dragDrop: DragDrop,
    protected _changeDetectorRef: ChangeDetectorRef,
    @Optional() @Self() @Inject(TRI_DRAG_HANDLE) protected _selfHandle?: TriDragHandle,
    @Optional() @SkipSelf() @Inject(TRI_DRAG_PARENT) protected _parentDrag?: TriDrag) {
    this._dragRef      = dragDrop.createDrag(element, {
      dragStartThreshold             : config && config.dragStartThreshold != null ?
        config.dragStartThreshold : 5,
      pointerDirectionChangeThreshold: config && config.pointerDirectionChangeThreshold != null ?
        config.pointerDirectionChangeThreshold : 5,
      zIndex                         : config?.zIndex,
    });
    this._dragRef.data = this;

    // We have to keep track of the drag instances in order to be able to match an element to
    // a drag instance. We can't go through the global registry of `DragRef`, because the root
    // element could be different.
    TriDrag._dragInstances.push(this);

    if (config) {
      this._assignDefaults(config);
    }

    // Note that usually the container is assigned when the drop list is picks up the item, but in
    // some cases (mainly transplanted views with OnPush, see #18341) we may end up in a situation
    // where there are no items on the first change detection pass, but the items get picked up as
    // soon as the user triggers another pass by dragging. This is a problem, because the item would
    // have to switch from standalone mode to drag mode in the middle of the dragging sequence which
    // is too late since the two modes save different kinds of information. We work around it by
    // assigning the drop container both from here and the list.
    if (dropContainer) {
      this._dragRef._withDropContainer(dropContainer._dropContainerRef);
      dropContainer.addItem(this);
    }

    this._syncInputs(this._dragRef);
    this._handleEvents(this._dragRef);
  }

  /**
   * Returns the element that is being used as a placeholder
   * while the current element is being dragged.
   */
  getPlaceholderElement(): HTMLElement {
    return this._dragRef.getPlaceholderElement();
  }

  /** Returns the root draggable element. */
  getRootElement(): HTMLElement {
    return this._dragRef.getRootElement();
  }

  /** Resets a standalone drag item to its initial position. */
  reset(): void {
    this._dragRef.reset();
  }

  /**
   * Gets the pixel coordinates of the draggable outside of a drop container.
   */
  getFreeDragPosition(): { readonly x: number, readonly y: number } {
    return this._dragRef.getFreeDragPosition();
  }

  ngAfterViewInit() {
    // We need to wait for the zone to stabilize, in order for the reference
    // element to be in the proper place in the DOM. This is mostly relevant
    // for draggable elements inside portals since they get stamped out in
    // their original DOM position and then they get transferred to the portal.
    this._ngZone.onStable
      .pipe(take(1), takeUntil(this._destroyed))
      .subscribe(() => {
        this._updateRootElement();

        // Listen for any newly-added handles.
        this._handles.changes.pipe(
          startWith(this._handles),
          // Sync the new handles with the DragRef.
          tap((handles: QueryList<TriDragHandle>) => {
            const childHandleElements = handles
              .filter(handle => handle._parentDrag === this)
              .map(handle => handle.element);

            // Usually handles are only allowed to be a descendant of the drag element, but if
            // the consumer defined a different drag root, we should allow the drag element
            // itself to be a handle too.
            if (this._selfHandle && this.rootElementSelector) {
              childHandleElements.push(this.element);
            }

            this._dragRef.withHandles(childHandleElements);
          }),
          // Listen if the state of any of the handles changes.
          switchMap((handles: QueryList<TriDragHandle>) => {
            return merge(...handles.map(item => {
              return item._stateChanges.pipe(startWith(item));
            })) as Observable<TriDragHandle>;
          }),
          takeUntil(this._destroyed)
        ).subscribe(handleInstance => {
          // Enabled/disable the handle that changed in the DragRef.
          const dragRef = this._dragRef;
          const handle  = handleInstance.element.nativeElement;
          handleInstance.disabled ? dragRef.disableHandle(handle) : dragRef.enableHandle(handle);
        });

        if (this.freeDragPosition) {
          this._dragRef.setFreeDragPosition(this.freeDragPosition);
        }
      });
  }

  ngOnChanges(changes: SimpleChanges) {
    const rootSelectorChange = changes['rootElementSelector'];
    const positionChange     = changes['freeDragPosition'];

    // We don't have to react to the first change since it's being
    // handled in `ngAfterViewInit` where it needs to be deferred.
    if (rootSelectorChange && !rootSelectorChange.firstChange) {
      this._updateRootElement();
    }

    // Skip the first change since it's being handled in `ngAfterViewInit`.
    if (positionChange && !positionChange.firstChange && this.freeDragPosition) {
      this._dragRef.setFreeDragPosition(this.freeDragPosition);
    }
  }

  ngOnDestroy() {
    if (this.dropContainer) {
      this.dropContainer.removeItem(this);
    }

    const index = TriDrag._dragInstances.indexOf(this);
    if (index > -1) {
      TriDrag._dragInstances.splice(index, 1);
    }
    this._destroyed.next();
    this._destroyed.complete();
    this._dragRef.dispose();
  }

  /** Syncs the root element with the `DragRef`. */
  private _updateRootElement() {
    const element     = this.element.nativeElement;
    const rootElement = this.rootElementSelector ?
      getClosestMatchingAncestor(element, this.rootElementSelector) : element;

    if (rootElement && (typeof ngDevMode === 'undefined' || ngDevMode)) {
      assertElementNode(rootElement, 'triDrag');
    }

    this._dragRef.withRootElement(rootElement || element);
  }

  /** Gets the boundary element, based on the `boundaryElement` value. */
  private _getBoundaryElement() {
    const boundary = this.boundaryElement;

    if (!boundary) {
      return null;
    }

    if (typeof boundary === 'string') {
      return getClosestMatchingAncestor(this.element.nativeElement, boundary);
    }

    const element = coerceElement(boundary);

    if ((typeof ngDevMode === 'undefined' || ngDevMode) &&
      !element.contains(this.element.nativeElement)) {
      throw Error('Draggable element is not inside of the node passed into triDragBoundary.');
    }

    return element;
  }

  /** Syncs the inputs of the TriDrag with the options of the underlying DragRef. */
  private _syncInputs(ref: DragRef<TriDrag<T>>) {
    ref.beforeStarted.subscribe(() => {
      if (!ref.isDragging()) {
        const dir            = this._dir;
        const dragStartDelay = this.dragStartDelay;
        const placeholder    = this._placeholderTemplate ? {
          template     : this._placeholderTemplate.templateRef,
          context      : this._placeholderTemplate.data,
          viewContainer: this._viewContainerRef
        } : null;
        const preview        = this._previewTemplate ? {
          template     : this._previewTemplate.templateRef,
          context      : this._previewTemplate.data,
          matchSize    : this._previewTemplate.matchSize,
          viewContainer: this._viewContainerRef
        } : null;

        ref.disabled          = this.disabled;
        ref.lockAxis          = this.lockAxis;
        ref.dragStartDelay    = (typeof dragStartDelay === 'object' && dragStartDelay) ?
          dragStartDelay : coerceNumberProperty(dragStartDelay);
        ref.constrainPosition = this.constrainPosition;
        ref.previewClass      = this.previewClass;
        ref
          .withBoundaryElement(this._getBoundaryElement())
          .withPlaceholderTemplate(placeholder)
          .withPreviewTemplate(preview)
          .withPreviewContainer(this.previewContainer || 'global');

        if (dir) {
          ref.withDirection(dir.value);
        }
      }
    });

    // This only needs to be resolved once.
    ref.beforeStarted.pipe(take(1)).subscribe(() => {
      // If we managed to resolve a parent through DI, use it.
      if (this._parentDrag) {
        ref.withParent(this._parentDrag._dragRef);
        return;
      }

      // Otherwise fall back to resolving the parent by looking up the DOM. This can happen if
      // the item was projected into another item by something like `ngTemplateOutlet`.
      let parent = this.element.nativeElement.parentElement;
      while (parent) {
        // `classList` needs to be null checked, because IE doesn't have it on some elements.
        if (parent.classList?.contains(DRAG_HOST_CLASS)) {
          ref.withParent(TriDrag._dragInstances.find(drag => {
            return drag.element.nativeElement === parent;
          })?._dragRef || null);
          break;
        }
        parent = parent.parentElement;
      }
    });
  }

  /** Handles the events from the underlying `DragRef`. */
  private _handleEvents(ref: DragRef<TriDrag<T>>) {
    ref.started.subscribe(() => {
      this.started.emit({source: this});

      // Since all of these events run outside of change detection,
      // we need to ensure that everything is marked correctly.
      this._changeDetectorRef.markForCheck();
    });

    ref.released.subscribe(() => {
      this.released.emit({source: this});
    });

    ref.ended.subscribe(event => {
      this.ended.emit({
        source   : this,
        distance : event.distance,
        dropPoint: event.dropPoint
      });

      // Since all of these events run outside of change detection,
      // we need to ensure that everything is marked correctly.
      this._changeDetectorRef.markForCheck();
    });

    ref.entered.subscribe(event => {
      this.entered.emit({
        container   : event.container.data,
        item        : this,
        currentIndex: event.currentIndex
      });
    });

    ref.exited.subscribe(event => {
      this.exited.emit({
        container: event.container.data,
        item     : this
      });
    });

    ref.dropped.subscribe(event => {
      this.dropped.emit({
        previousIndex         : event.previousIndex,
        currentIndex          : event.currentIndex,
        previousContainer     : event.previousContainer.data,
        container             : event.container.data,
        isPointerOverContainer: event.isPointerOverContainer,
        item                  : this,
        distance              : event.distance,
        dropPoint             : event.dropPoint
      });
    });
  }

  /** Assigns the default input values based on a provided config object. */
  protected _assignDefaults(config: DragDropConfig) {
    const {
            lockAxis,
            dragStartDelay,
            constrainPosition,
            previewClass,
            boundaryElement,
            draggingDisabled,
            rootElementSelector,
            previewContainer
          } = config;

    this.disabled       = draggingDisabled == null ? false : draggingDisabled;
    this.dragStartDelay = dragStartDelay || 0;

    if (lockAxis) {
      this.lockAxis = lockAxis;
    }

    if (constrainPosition) {
      this.constrainPosition = constrainPosition;
    }

    if (previewClass) {
      this.previewClass = previewClass;
    }

    if (boundaryElement) {
      this.boundaryElement = boundaryElement;
    }

    if (rootElementSelector) {
      this.rootElementSelector = rootElementSelector;
    }

    if (previewContainer) {
      this.previewContainer = previewContainer;
    }
  }

  static ngAcceptInputType_disabled: BooleanInput;
}

/** Gets the closest ancestor of an element that matches a selector. */
function getClosestMatchingAncestor(element: HTMLElement, selector: string) {
  let currentElement = element.parentElement as HTMLElement | null;

  while (currentElement) {
    // IE doesn't support `matches` so we have to fall back to `msMatchesSelector`.
    if (currentElement.matches ? currentElement.matches(selector) :
      (currentElement as any).msMatchesSelector(selector)) {
      return currentElement;
    }

    currentElement = currentElement.parentElement;
  }

  return null;
}

