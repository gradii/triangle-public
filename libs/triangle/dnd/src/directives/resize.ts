/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */


import { Directionality } from '@angular/cdk/bidi';
import {
  BooleanInput, coerceBooleanProperty, coerceElement, coerceNumberProperty
} from '@angular/cdk/coercion';
import { ScrollDispatcher } from '@angular/cdk/scrolling';
import {
  AfterViewInit, ChangeDetectorRef, ContentChild, Directive, ElementRef, EventEmitter, Inject,
  Input, NgZone, OnChanges, OnDestroy, OnInit, Optional, Output, QueryList, SimpleChanges, SkipSelf,
  ViewContainerRef,
} from '@angular/core';
import { Observable, Observer, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { DragDrop } from '../drag-drop';
import {
  AnchorPosition, OffsetPoint, Point, PreviewContainer, ResizeRef
} from '../drag-drop-ref/resize-ref';
import {
  TriResized, TriResizeEnd, TriResizeMove, TriResizeRelease, TriResizeStart,
} from '../event/resize-events';
import { assertElementNode } from './assertions';
import { DragAxis, DragDropConfig, DragStartDelay, TRI_RESIZE_CONFIG } from './config';
import { TRI_DROP_CONTAINER } from './drop-container';
import { TriDropContainerInternal as TriDropContainer } from './drop-list-container';
import { TriResizeHandle } from './resize-handle';
import { TRI_RESIZE_PLACEHOLDER, TriResizePlaceholder } from './resize-placeholder';
import { TRI_RESIZE_PREVIEW, TriResizePreview } from './resize-preview';

declare const ngDevMode: object | null;

const RESIZE_HOST_CLASS = 'tri-resize';

/** Element that can be moved inside a TriDropContainer container. */
@Directive({
  selector: '[triResize]',
  exportAs: 'triResize',
  host    : {
    'class'                      : RESIZE_HOST_CLASS,
    '[class.tri-resize-disabled]': 'disabled',
    '[class.tri-resize-resizing]': '_resizeRef.isDragging()',
  },
})
export class TriResize<T = any> implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  private readonly _destroyed                = new Subject<void>();
  private static _dragInstances: TriResize[] = [];

  /** Reference to the underlying drag instance. */
  _resizeRef: ResizeRef<TriResize<T>>;

  /** Elements that can be used to drag the draggable item. */
  _handles: QueryList<TriResizeHandle>;

  /** Element that will be used as a template to create the draggable item's preview. */
  @ContentChild(TRI_RESIZE_PREVIEW) _previewTemplate: TriResizePreview;

  /** Template for placeholder element rendered to show where a draggable would be dropped. */
  @ContentChild(TRI_RESIZE_PLACEHOLDER) _placeholderTemplate: TriResizePlaceholder;

  /**
   * @deprecated
   * Arbitrary data to attach to this drag instance.
   */
  @Input('triResizeData') data: T;

  /**
   * @deprecated
   * Locks the position of the dragged element along the specified axis.
   */
  @Input('triResizeLockAxis') lockAxis: DragAxis;

  /**
   * Selector that will be used to determine the root draggable element, starting from
   * the `triDrag` element and going up the DOM. Passing an alternate root element is useful
   * when trying to enable resizing on an element that you might not have access to.
   */
  @Input('triResizeRootElement') rootElementSelector: string;

  /**
   * Node or selector that will be used to determine the element to which the draggable's
   * position will be constrained. If a string is passed in, it'll be used as a selector that
   * will be matched starting from the element's parent and going up the DOM until a match
   * has been found.
   */
  @Input('triResizeBoundary') boundaryElement: string | ElementRef<HTMLElement> | HTMLElement;

  /**
   * Amount of milliseconds to wait after the user has put their
   * pointer down before starting to drag the element.
   */
  @Input('triResizeStartDelay') dragStartDelay: DragStartDelay;

  /**
   * Sets the position of a `TriResize` that is outside of a drop container.
   * Can be used to restore the element's position for a returning user.
   */
  @Input('triResizeFreeDragPosition') freeDragPosition: { x: number, y: number };

  /** Whether starting to drag this element is disabled. */
  @Input('triResizeDisabled')
  get disabled(): boolean {
    return this._disabled || (this.dropContainer && this.dropContainer.disabled);
  }

  set disabled(value: boolean) {
    this._disabled           = coerceBooleanProperty(value);
    this._resizeRef.disabled = this._disabled;
  }

  private _disabled: boolean;

  /**
   * Function that can be used to customize the logic of how the position of the drag item
   * is limited while it's being dragged. Gets called with a point containing the current position
   * of the user's pointer on the page and should return a point describing where the item should
   * be rendered.
   */
  @Input('triResizeConstrainPosition') constrainPosition?: (point: Point,
                                                            dragRef: ResizeRef) => Point;

  // @Input('triResizeConstrainOffsetPosition') constrainOffsetPosition?: (
  //   anchorPosition: AnchorPosition,
  //   delta: { x: -1 | 0 | 1, y: -1 | 0 | 1 },
  //   point: OffsetPoint,
  //   dragRef: ResizeRef) => OffsetPoint;

  /** Class to be added to the preview element. */
  @Input('triResizePreviewClass') previewClass: string | string[];


  @Input('triResizePreviewContainer') previewContainer: PreviewContainer;

  /** Emits when the user starts resizing the item. */
  @Output('triResizeStarted') readonly started: EventEmitter<TriResizeStart> =
    new EventEmitter<TriResizeStart>();

  /** Emits when the user has released a drag item, before any animations have started. */
  @Output('triResizeReleased') readonly released: EventEmitter<TriResizeRelease> =
    new EventEmitter<TriResizeRelease>();

  /** Emits when the user stops resizing an item in the container. */
  @Output(
    'triResizeEnded') readonly ended: EventEmitter<TriResizeEnd> = new EventEmitter<TriResizeEnd>();


  /** Emits when the user drops the item inside a container. */
  @Output('triResizeResized') readonly resized: EventEmitter<TriResized<any>> =
    new EventEmitter<TriResized<any>>();

  /**
   * Emits as the user is resizing the item. Use with caution,
   * because this event will fire for every pixel that the user has dragged.
   */
  @Output('triResizeResizing')
  readonly resizing: Observable<TriResizeMove<T>> =
    new Observable((observer: Observer<TriResizeMove<T>>) => {
      const subscription = this._resizeRef.resizing.pipe(map(resizingEvent => ({
        source              : this,
        pointerPosition     : resizingEvent.pointerPosition,
        event               : resizingEvent.event,
        distance            : resizingEvent.distance,
        delta               : resizingEvent.delta,
        resizeAnchorPosition: resizingEvent.resizeAnchorPosition
      }))).subscribe(observer);

      return () => {
        subscription.unsubscribe();
      };
    });

  constructor(
    /** Element that the draggable is attached to. */
    public element: ElementRef<HTMLElement>,
    @Inject(TRI_DROP_CONTAINER) @Optional() @SkipSelf() public dropContainer: TriDropContainer,
    protected _ngZone: NgZone,
    protected _viewContainerRef: ViewContainerRef,
    @Optional() @Inject(TRI_RESIZE_CONFIG) config: DragDropConfig,
    @Optional() protected _dir: Directionality, dragDrop: DragDrop,
    protected _changeDetectorRef: ChangeDetectorRef,
    protected _scrollDispatcher: ScrollDispatcher,
  ) {
    this._resizeRef      = dragDrop.createResize(element, {
      dragStartThreshold             : config && config.dragStartThreshold != null ?
        config.dragStartThreshold : 5,
      pointerDirectionChangeThreshold: config && config.pointerDirectionChangeThreshold != null ?
        config.pointerDirectionChangeThreshold : 5,
      zIndex                         : config?.zIndex,
    });
    this._resizeRef.data = this;

    // this._scrollDispatcher
    //   .getAncestorScrollContainers(this.element)
    //   .map(scrollable => scrollable.getElementRef().nativeElement);

    if (config) {
      this._assignDefaults(config);
    }

    const scrollableParents = this._scrollDispatcher
      .getAncestorScrollContainers(this.element)
      .map(scrollable => scrollable.getElementRef().nativeElement);

    let scrollableElements = scrollableParents.slice();
    if (dropContainer && scrollableParents.indexOf(dropContainer.element.nativeElement) === -1) {
      scrollableElements = [dropContainer.element.nativeElement, ...scrollableParents];
    }
    this._resizeRef.withScrollElements(scrollableElements);

    this._syncInputs(this._resizeRef);
    this._handleEvents(this._resizeRef);
  }

  /**
   * Returns the element that is being used as a placeholder
   * while the current element is being dragged.
   */
  getPlaceholderElement(): HTMLElement {
    return this._resizeRef.getPlaceholderElement();
  }

  /** Returns the root draggable element. */
  getRootElement(): HTMLElement {
    return this._resizeRef.getRootElement();
  }

  /** Resets a standalone drag item to its initial position. */
  reset(): void {
    this._resizeRef.reset();
  }

  /**
   * Gets the pixel coordinates of the draggable outside of a drop container.
   */
  getFreeDragPosition(): { readonly x: number, readonly y: number } {
    return this._resizeRef.getFreeDragPosition();
  }

  _buildResizeHandler(position: string) {
    const dragElement = document.createElement('div');
    dragElement.classList.add('gridster-item-resizable-handler', `handle-${position}`);

    this.element.nativeElement.append(dragElement);
    return dragElement;

    // const dragRef = this._dragDrop.createDrag(dragElement)
    //   .withRootElement(dragElement)
    //   .withParent(this._parentDrag?._dragRef);
    //
    // dragRef.started.subscribe(event => this.onDragStarted(event));
    // dragRef.moved.subscribe(
    //   event => {
    //     if (position === 's') {
    //       this.onDragSMoved(event);
    //     } else if (position === 'n') {
    //       this.onDragNMoved(event);
    //     } else if (position === 'w') {
    //       this.onDragWMoved(event);
    //     } else if (position === 'e') {
    //       this.onDragEMoved(event);
    //     } else if (position === 'sw') {
    //       this.onDragSwMoved(event);
    //     } else if (position === 'nw') {
    //       this.onDragNwMoved(event);
    //     } else if (position === 'se') {
    //       this.onDragSeMoved(event);
    //     } else if (position === 'ne') {
    //       this.onDragNeMoved(event);
    //     }
    //   });
    // dragRef.ended.subscribe(event => this.onDragEnded(event));
    // return dragRef;
  }


  ngOnInit() {
    const direction = ['s', 'n', 'w', 'e', 'ws', 'we', 'es', 'en'];
    this._resizeRef.withSouthHandle(this._buildResizeHandler('s'));
    this._resizeRef.withNorthHandle(this._buildResizeHandler('n'));
    this._resizeRef.withWestHandle(this._buildResizeHandler('w'));
    this._resizeRef.withEastHandle(this._buildResizeHandler('e'));

    this._resizeRef.withWestSouthHandle(this._buildResizeHandler('sw'));
    this._resizeRef.withWestNorthHandle(this._buildResizeHandler('nw'));
    this._resizeRef.withEastSouthHandle(this._buildResizeHandler('se'));
    this._resizeRef.withEastNorthHandle(this._buildResizeHandler('ne'));
  }

  ngAfterViewInit() {
    // We need to wait for the zone to stabilize, in order for the reference
    // element to be in the proper place in the DOM. This is mostly relevant
    // for draggable elements inside portals since they get stamped out in
    // their original DOM position and then they get transferred to the portal.
    // this._ngZone.onStable
    //   .pipe(take(1), takeUntil(this._destroyed))
    //   .subscribe(() => {
    //     this._updateRootElement();
    //
    //     // Listen for any newly-added handles.
    //     this._handles.changes.pipe(
    //       startWith(this._handles),
    //       // Sync the new handles with the ResizeRef.
    //       tap((handles: QueryList<TriResizeHandle>) => {
    //         const childHandleElements = handles
    //           .filter(handle => handle._parentDrag === this)
    //           .map(handle => handle.element);
    //
    //         this._resizeRef.withHandles(childHandleElements);
    //       }),
    //       // Listen if the state of any of the handles changes.
    //       switchMap((handles: QueryList<TriResizeHandle>) => {
    //         return merge(...handles.map(item => {
    //           return item._stateChanges.pipe(startWith(item));
    //         })) as Observable<TriResizeHandle>;
    //       }),
    //       takeUntil(this._destroyed)
    //     ).subscribe(handleInstance => {
    //       // Enabled/disable the handle that changed in the ResizeRef.
    //       const dragRef = this._resizeRef;
    //       const handle  = handleInstance.element.nativeElement;
    //       handleInstance.disabled ? dragRef.disableHandle(handle) : dragRef.enableHandle(handle);
    //     });
    //
    //     if (this.freeDragPosition) {
    //       this._resizeRef.setFreeDragPosition(this.freeDragPosition);
    //     }
    //   });
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
      this._resizeRef.setFreeDragPosition(this.freeDragPosition);
    }
  }

  ngOnDestroy() {
    this._destroyed.next();
    this._destroyed.complete();
    this._resizeRef.dispose();
  }

  /** Syncs the root element with the `ResizeRef`. */
  private _updateRootElement() {
    const element     = this.element.nativeElement;
    const rootElement = this.rootElementSelector ?
      getClosestMatchingAncestor(element, this.rootElementSelector) : element;

    if (rootElement && (typeof ngDevMode === 'undefined' || ngDevMode)) {
      assertElementNode(rootElement, 'triDrag');
    }

    this._resizeRef.withRootElement(rootElement || element);
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

  /** Syncs the inputs of the TriResize with the options of the underlying ResizeRef. */
  private _syncInputs(ref: ResizeRef<TriResize<T>>) {
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

        ref.disabled                = this.disabled;
        ref.lockAxis                = this.lockAxis;
        ref.dragStartDelay          = (typeof dragStartDelay === 'object' && dragStartDelay) ?
          dragStartDelay : coerceNumberProperty(dragStartDelay);
        ref.constrainPosition       = this.constrainPosition;
        // ref.constrainOffsetPosition = this.constrainOffsetPosition;
        ref.previewClass            = this.previewClass;
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
  }

  /** Handles the events from the underlying `ResizeRef`. */
  private _handleEvents(ref: ResizeRef<TriResize<T>>) {
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

    ref.resized.subscribe(event => {
      this.resized.emit({
        // item    : this,
        // distance: event.distance,
        // dropPoint             : event.dropPoint,
        resizePoint: {
          x : 0,
          y : 0,
          x2: 0,
          y2: 0
        }
      });
    });
  }

  /** Assigns the default input values based on a provided config object. */
  protected _assignDefaults(config: any) {
    const {
            lockAxis,
            dragStartDelay,
            constrainPosition,
            // constrainOffsetPosition,
            previewClass,
            boundaryElement,
            resizingDisabled,
            rootElementSelector,
            previewContainer
          } = config;

    this.disabled       = resizingDisabled == null ? false : resizingDisabled;
    this.dragStartDelay = dragStartDelay || 0;

    if (lockAxis) {
      this.lockAxis = lockAxis;
    }

    if (constrainPosition) {
      this.constrainPosition = constrainPosition;
    }

    // if (constrainOffsetPosition) {
    //   this.constrainOffsetPosition = constrainOffsetPosition;
    // }

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

