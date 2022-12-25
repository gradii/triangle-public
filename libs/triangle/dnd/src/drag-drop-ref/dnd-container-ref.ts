/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import type { Direction } from '@angular/cdk/bidi';
import { coerceElement } from '@angular/cdk/coercion';
import { _getShadowRoot } from '@angular/cdk/platform';
import type { ViewportRuler } from '@angular/cdk/scrolling';
import type { ElementRef, NgZone } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { TriDropContainer } from '../directives/drop-container';
import type { DragDropRegistry } from '../drag-drop-registry';
import type { DragCSSStyleDeclaration } from '../drag-styling';
import { ParentPositionTracker } from '../parent-position-tracker';
import type { PositionStrategy } from '../position-strategy/position-strategy';
import { ScrollingStrategy } from '../scrolling-strategy/scrolling-strategy';
import { getTransformTransitionDurationInMs } from '../transition-duration';
import { adjustClientRect, getMutableClientRect, isInsideClientRect, } from '../utils/client-rect';
import { orderByHierarchy } from '../utils/hierarchy';
import type { DragRefInternal as DragRef, Point } from './drag-ref';

export type RootNode = DocumentOrShadowRoot & {
  // As of TS 4.4 the built in DOM typings don't include `elementFromPoint` on `ShadowRoot`,
  // even though it exists (see https://developer.mozilla.org/en-US/docs/Web/API/ShadowRoot).
  // This type is a utility to avoid having to add casts everywhere.
  elementFromPoint(x: number, y: number): Element | null;
};

/**
 * Internal compile-time-only representation of a `DropContainerRef`.
 * Used to avoid circular import issues between the `DropContainerRef` and the `DragRef`.
 * @docs-private
 */
export interface DropContainerRefInternal extends DndContainerRef {
}

/**
 * Reference to a drop list. Used to manipulate or dispose of the container.
 */
export class DndContainerRef<T = any> {

  /** Element that the drop list is attached to. */
  element: HTMLElement | ElementRef<HTMLElement>;

  /** Whether starting a dragging sequence from this container is disabled. */
  disabled: boolean = false;

  /** Locks the position of the draggable elements inside the container along the specified axis. */
  lockAxis: 'x' | 'y';

  /**
   * Whether auto-scrolling the view when the user
   * moves their pointer close to the edges is disabled.
   */
  autoScrollDisabled: boolean = false;

  /** Number of pixels to scroll for each frame when auto-scrolling an element. */
  autoScrollStep: number = 2;

  /**
   * Function that is used to determine whether an item
   * is allowed to be moved into a drop container.
   */
  enterPredicate: (drag: DragRef, drop: DndContainerRef) => boolean = () => true;

  /** Functions that is used to determine whether an item can be sorted into a particular index. */
  sortPredicate: (index: number, drag: DragRef, drop: DndContainerRef) => boolean = () => true;

  /** Emits right before dragging has started. */
  readonly beforeStarted = new Subject<void>();

  /**
   * Emits when the user has moved a new drag item into this container.
   */
  readonly entered = new Subject<{ item: DragRef, container: DndContainerRef, currentIndex?: number }>();

  /**
   * Emits when the user removes an item from the container
   * by dragging it into another container.
   */
  readonly exited = new Subject<{ item: DragRef, container: DndContainerRef }>();

  /** Emits when the user drops an item inside the container. */
  readonly dropped = new Subject<{
    item: DragRef,
    currentIndex: number,
    positionX?: number,
    positionY?: number,
    previousIndex: number,
    container: DndContainerRef,
    previousContainer: DndContainerRef,
    isPointerOverContainer: boolean,
    distance: Point;
    dropPoint: Point;
    elementPosition?: Point;
    elementRelativePosition?: Point;
  }>();

  /** Arbitrary data that can be attached to the drop list. */
  data: T;

  /** Whether an item in the list is being dragged. */
  protected _isDragging = false;

  _isPreStarted = false;

  // /** Keeps track of the positions of any parent scrollable elements. */
  // _parentPositions: ParentPositionTracker;

  /** Cached `ClientRect` of the drop list. */
  _clientRect: ClientRect | undefined;

  /**
   * Draggable items that are currently active inside the container. Includes the items
   * from `_draggables`, as well as any items that have been dragged in, but haven't
   * been dropped yet.
   */
  _activeDraggables: DragRef[];

  /** Draggable items in the container. */
  _draggables: readonly DragRef[] = [];

  /** Drop lists that are connected to the current one. */
  protected _siblings: readonly DndContainerRef[] = [];

  /**
   * Direction in which the list is oriented.
   * @deprecated
   * @breaking-change 1.13.0
   */
  _orientation: 'horizontal' | 'vertical' = 'vertical';

  /** Connected siblings that currently have a dragged item. */
  _activeSiblings = new Set<DndContainerRef>();

  /** Layout direction of the drop list. */
  _direction: Direction = 'ltr';

  /** Subscription to the window being scrolled. */
  protected _viewportScrollSubscription = Subscription.EMPTY;

  /** Shadow root of the current element. Necessary for `elementFromPoint` to resolve correctly. */
  protected _cachedShadowRoot: RootNode | null = null;

  /** Reference to the document. */
  protected _document: Document;

  /** Elements that can be scrolled while the user is dragging. */
  protected _scrollableElements: HTMLElement[];

  /** Initial value for the element's `scroll-snap-type` style. */
  protected _initialScrollSnap: string;

  public scrollingStrategy: ScrollingStrategy;

  constructor(
    element: ElementRef<HTMLElement> | HTMLElement,
    protected _dragDropRegistry: DragDropRegistry<DragRef, DndContainerRef>,
    _document: any,
    protected _ngZone: NgZone,
    protected _viewportRuler: ViewportRuler,
    protected positionStrategy: PositionStrategy,
  ) {
    this.element   = coerceElement(element);
    this._document = _document;
    this.withScrollableParents([this.element]);
    _dragDropRegistry.registerDropContainer(this);

    this.scrollingStrategy = new ScrollingStrategy(
      this._document,
      new ParentPositionTracker(_document, _viewportRuler),
      this._ngZone,
      this._viewportRuler,
      this,
    );
  }


  /** Removes the drop list functionality from the DOM element. */
  dispose() {
    this._stopScrolling();
    // this._stopScrollTimers.complete();
    this._viewportScrollSubscription.unsubscribe();
    this.beforeStarted.complete();
    this.entered.complete();
    this.exited.complete();
    this.dropped.complete();
    // this.sorted.complete();
    this._activeSiblings.clear();
    // this._scrollNode = null!;
    this._dragDropRegistry.removeDropContainer(this);

    this.positionStrategy.dispose();
    this.scrollingStrategy.dispose();

    // this.positionStrategy._stopScrolling();
    // this.positionStrategy._stopScrollTimers.complete();
  }

  /** Whether an item from this list is currently being dragged. */
  isDragging() {
    return this._isDragging;
  }

  /** Starts dragging an item. */
  start(): void {
    this._draggingStarted();
    this._notifyReceivingSiblings();
  }

  /**
   * Emits an event to indicate that the user moved an item into the container.
   * @param item Item that was moved into the container.
   * @param pointerX Position of the item along the X axis.
   * @param pointerY Position of the item along the Y axis.
   * @param index Index at which the item entered. If omitted, the container will try to figure it
   *   out automatically.
   */
  enter(item: DragRef, pointerX: number, pointerY: number): void {

  }

  /**
   * Removes an item from the container after it was dragged into another container by the user.
   * @param item Item that was dragged out.
   */
  exit(item: DragRef): void {
    const placeholder = item.getPlaceholderElement();

    if (placeholder.parentNode) {
      placeholder.parentNode.removeChild(placeholder);
    }

    this._reset();
    this.exited.next({item, container: this});
  }

  /**
   * Drops an item into this container.
   * @param item Item being dropped into the container.
   * @param currentIndex Index at which the item should be inserted.
   * @param elementPositionX
   * @param elementPositionY
   * @param previousIndex Index of the item when dragging started.
   * @param previousContainer Container from which the item got dragged in.
   * @param isPointerOverContainer Whether the user's pointer was over the
   *    container when the item was dropped.
   * @param distance Distance the user has dragged since the start of the dragging sequence.
   * @param dropPoint
   */
  drop(item: DragRef, currentIndex: number,
       elementPositionX: number, elementPositionY: number,
       previousIndex: number, previousContainer: DndContainerRef,
       isPointerOverContainer: boolean, distance: Point, dropPoint: Point,
       elementRelativePosition?: Point): void {
    this._reset();
    this.dropped.next({
      item,
      currentIndex,
      previousIndex,
      container      : this,
      previousContainer,
      isPointerOverContainer,
      distance,
      dropPoint,
      elementPosition: {x: elementPositionX, y: elementPositionY},
      elementRelativePosition,
    });
  }

  /**
   * Sets the draggable items that are a part of this list.
   * @param items Items that are a part of this list.
   */
  withItems(items: DragRef[]): this {
    const previousItems = this._draggables;
    this._draggables    = items;
    items.forEach(item => item._withDropContainer(this));

    if (this.isDragging()) {
      const draggedItems = previousItems.filter(item => item.isDragging());

      // If all of the items being dragged were removed
      // from the list, abort the current drag sequence.
      if (draggedItems.every(item => items.indexOf(item) === -1)) {
        this._reset();
      } else {
        this._cacheItems();
      }
    }

    return this;
  }

  /** Sets the layout direction of the drop list. */
  withDirection(direction: Direction): this {
    this._direction = direction;
    return this;
  }

  /**
   * Sets the containers that are connected to this one. When two or more containers are
   * connected, the user will be allowed to transfer items between them.
   * @param connectedTo Other containers that the current containers should be connected to.
   */
  connectedTo(connectedTo: DndContainerRef[]): this {
    this._siblings = connectedTo.slice();
    return this;
  }

  /**
   * Sets the orientation of the container.
   * @param orientation New orientation for the container.
   * @deprecated will use withPositionStrategy
   * @breaking-change 1.13.0
   */
  withOrientation(orientation: 'vertical' | 'horizontal'): this {
    this._orientation = orientation;
    // this.positionStrategy._orientation = orientation;
    return this;
  }

  withPositionStrategy(positionStrategy: 'vertical' | 'horizontal' |
    'flex-row' | 'flex-column' | 'grid'): this {
    // this.positionStrategy = new ...
    return this;
  }

  /**
   * Sets which parent elements are can be scrolled while the user is dragging.
   * @param elements Elements that can be scrolled.
   */
  withScrollableParents(elements: HTMLElement[]): this {
    const element = coerceElement(this.element);

    // We always allow the current element to be scrollable
    // so we need to ensure that it's in the array.
    this._scrollableElements =
      elements.indexOf(element) === -1 ? [element, ...elements] : elements.slice();
    return this;
  }

  /** Gets the scrollable parents that are registered with this drop container. */
  getScrollableParents(): readonly HTMLElement[] {
    return this._scrollableElements;
  }

  /**
   * Figures out the index of an item in the container.
   * @param item Item whose index should be determined.
   */
  getItemIndex(item: DragRef): number {
    if (!this._isDragging) {
      return this._draggables.indexOf(item);
    }

    return this.positionStrategy._findItemIndex(item);
  }

  // absolute or relative
  getItemPosition(item: DragRef): string {
    return '';
  }

  /**
   * Whether the list is able to receive the item that
   * is currently being dragged inside a connected drop list.
   */
  isReceiving(): boolean {
    return this._activeSiblings.size > 0;
  }

  /**
   * Sorts an item inside the container based on its position.
   * @param item Item to be sorted.
   * @param pointerX Position of the item along the X axis.
   * @param pointerY Position of the item along the Y axis.
   * @param elementPointX
   * @param elementPointY
   * @param pointerDelta Direction in which the pointer is moving along each axis.
   */
  _arrangeItem(item: DragRef, pointerX: number, pointerY: number,
               elementPointX: number, elementPointY: number,
               pointerDelta: { x: number, y: number }): void {

    // this.positionStrategy._sortItem(item, pointerX, pointerY, pointerDelta);
  }

  /**
   * Checks whether the user's pointer is close to the edges of either the
   * viewport or the drop list and starts the auto-scroll sequence.
   * @param pointerX User's pointer position along the x axis.
   * @param pointerY User's pointer position along the y axis.
   */
  _startScrollingIfNecessary(pointerX: number, pointerY: number) {
    if (this.autoScrollDisabled) {
      return;
    }

    this.scrollingStrategy.startScrolling(pointerX, pointerY);
  }

  /** Stops any currently-running auto-scroll sequences. */
  _stopScrolling() {
    this.scrollingStrategy.stopScrolling();
  }

  protected _preStart() {

  }

  /** Starts the dragging sequence within the list. */
  protected _draggingStarted() {
    const styles = coerceElement(this.element).style as DragCSSStyleDeclaration;
    this.beforeStarted.next();
    this._isDragging = true;

    // We need to disable scroll snapping while the user is dragging, because it breaks automatic
    // scrolling. The browser seems to round the value based on the snapping points which means
    // that we can't increment/decrement the scroll position.
    this._initialScrollSnap = styles.msScrollSnapType || styles.scrollSnapType || '';
    styles.scrollSnapType   = styles.msScrollSnapType = 'none';

    this._cacheItems();
    this._viewportScrollSubscription.unsubscribe();
    this._listenToScrollEvents();
  }

  /** Caches the positions of the configured scrollable parents. */
  protected _cacheParentPositions() {
    const element = coerceElement(this.element);
    this.scrollingStrategy.cacheParentPositions(this._scrollableElements);

    // The list element is always in the `scrollableElements`
    // so we can take advantage of the cached `ClientRect`.
    this._clientRect = this.scrollingStrategy.getElementClientRect(element);
  }

  /** Refreshes the position cache of the items and sibling containers. */
  protected _cacheItemPositions() {
    this.positionStrategy._cacheItemPositions();
  }

  /** Resets the container to its initial state. */
  protected _reset() {
    this._isDragging = false;

    const styles          = coerceElement(this.element).style as DragCSSStyleDeclaration;
    styles.scrollSnapType = styles.msScrollSnapType = this._initialScrollSnap;

    // TODO(crisbeto): may have to wait for the animations to finish.
    this._activeDraggables.forEach(item => {
      const rootElement = item.getRootElement();

      if (rootElement) {
        const duration = getTransformTransitionDurationInMs(rootElement);
        item._animateDone(rootElement, duration, 'transform').then(() => {
          // @ts-ignore
          TriDropContainer._dropContainers.forEach(container => {
            if (rootElement.contains(container.element.nativeElement)) {
              const clientRect                               = getMutableClientRect(
                container.element.nativeElement);
              // @ts-ignore
              container._dropContainerRef._clientRect.top    = clientRect.top;
              // @ts-ignore
              container._dropContainerRef._clientRect.bottom = clientRect.bottom;
              // @ts-ignore
              container._dropContainerRef._clientRect.left   = clientRect.left;
              // @ts-ignore
              container._dropContainerRef._clientRect.right  = clientRect.right;
            }
          });
        });
        const initialTransform      = this.positionStrategy._itemPositions
          .find(current => current.drag === item)?.initialTransform;
        rootElement.style.transform = initialTransform || 'translate3d(0, 0, 0)';
      }
    });
    this._siblings.forEach(sibling => sibling._stopReceiving(this));

    this.positionStrategy.reset();

    this._activeDraggables = [];

    this._stopScrolling();
    this._viewportScrollSubscription.unsubscribe();
    this.scrollingStrategy.reset();
  }

  /**
   * Checks if pointer is entering in the first position
   * @param pointerX Position of the user's pointer along the X axis.
   * @param pointerY Position of the user's pointer along the Y axis.
   */
  protected _shouldEnterAsFirstChild(pointerX: number, pointerY: number) {
    if (!this._activeDraggables.length) {
      return false;
    }

    const itemPositions = this.positionStrategy._itemPositions;
    const isHorizontal  = this._orientation === 'horizontal';

    // `itemPositions` are sorted by position while `activeDraggables` are sorted by child index
    // check if container is using some sort of "reverse" ordering (eg: flex-direction: row-reverse)
    const reversed = itemPositions[0].drag !== this._activeDraggables[0];
    if (reversed) {
      const lastItemRect = itemPositions[itemPositions.length - 1].clientRect;
      return isHorizontal ? pointerX >= lastItemRect.right : pointerY >= lastItemRect.bottom;
    } else {
      const firstItemRect = itemPositions[0].clientRect;
      return isHorizontal ? pointerX <= firstItemRect.left : pointerY <= firstItemRect.top;
    }
  }

  /** Caches the current items in the list and their positions. */
  protected _cacheItems(): void {
    this._activeDraggables = this._draggables.slice();
    this._cacheItemPositions();
    this._cacheParentPositions();
  }

  /**
   * Checks whether the user's pointer is positioned over the container.
   * @param x Pointer position along the X axis.
   * @param y Pointer position along the Y axis.
   */
  _isOverContainer(x: number, y: number): boolean {
    return this._clientRect != null && isInsideClientRect(this._clientRect, x, y);
  }

  /**
   * Figures out whether an item should be moved into a sibling
   * drop container, based on its current position.
   * @param item Drag item that is being moved.
   * @param x Position of the item along the X axis.
   * @param y Position of the item along the Y axis.
   */
  _getSiblingContainerFromPosition(item: DragRef, x: number,
                                   y: number): DndContainerRef | undefined {
    // Possible targets include siblings and 'this'
    const targets = [this, ...this._siblings];

    // Only consider targets where the drag postition is within the client rect
    // (this avoids calling enterPredicate on each possible target)
    let matchingTargets = targets.filter(ref => {
      return ref._clientRect && isInsideClientRect(ref._clientRect, x, y);
    });

    // Stop if no targets match the coordinates
    if (matchingTargets.length == 0) {
      return undefined;
    }

    if (matchingTargets.length > 1) {
      // Order candidates by DOM hierarchy and z-index
      matchingTargets = orderByHierarchy(matchingTargets);
    }
    // The drop target is the last matching target in the list
    const matchingTarget = matchingTargets.pop();

    // Only return matching target if it is a sibling
    if (matchingTarget === this) {
      return undefined;
    }

    // Can the matching target receive the item?
    if (!matchingTarget._canReceive(item, x, y)) {
      return undefined;
    }

    // Return matching target
    return matchingTarget;
  }

  /**
   * Checks whether the drop list can receive the passed-in item.
   * @param item Item that is being dragged into the list.
   * @param x Position of the item along the X axis.
   * @param y Position of the item along the Y axis.
   */
  _canReceive(item: DragRef, x: number, y: number): boolean {
    if (!this._clientRect || !isInsideClientRect(this._clientRect, x, y) ||
      !this.enterPredicate(item, this)) {
      return false;
    }

    const elementFromPoint = this._getShadowRoot().elementFromPoint(x, y) as HTMLElement | null;

    // If there's no element at the pointer position, then
    // the client rect is probably scrolled out of the view.
    if (!elementFromPoint) {
      return false;
    }

    const nativeElement = coerceElement(this.element);

    // The `ClientRect`, that we're using to find the container over which the user is
    // hovering, doesn't give us any information on whether the element has been scrolled
    // out of the view or whether it's overlapping with other containers. This means that
    // we could end up transferring the item into a container that's invisible or is positioned
    // below another one. We use the result from `elementFromPoint` to get the top-most element
    // at the pointer position and to find whether it's one of the intersecting drop containers.
    return elementFromPoint === nativeElement || nativeElement.contains(elementFromPoint);
  }

  /**
   * Called by one of the connected drop lists when a dragging sequence has started.
   * @param sibling Sibling in which dragging has started.
   */
  _startReceiving(sibling: DndContainerRef, items: DragRef[]) {
    const activeSiblings = this._activeSiblings;

    if (!activeSiblings.has(sibling) && items.every(item => {
      // Note that we have to add an exception to the `enterPredicate` for items that started off
      // in this drop list. The drag ref has logic that allows an item to return to its initial
      // container, if it has left the initial container and none of the connected containers
      // allow it to enter. See `DragRef._updateActiveDropContainer` for more context.
      return this.enterPredicate(item, this) || this._draggables.indexOf(item) > -1;
    })) {
      activeSiblings.add(sibling);
      this._cacheParentPositions();
      this._listenToScrollEvents();
    }
  }

  /**
   * Called by a connected drop list when dragging has stopped.
   * @param sibling Sibling whose dragging has stopped.
   */
  _stopReceiving(sibling: DndContainerRef) {
    this._activeSiblings.delete(sibling);
    this._viewportScrollSubscription.unsubscribe();
  }

  /**
   * Starts listening to scroll events on the viewport.
   * Used for updating the internal state of the list.
   */
  protected _listenToScrollEvents() {
    this._viewportScrollSubscription = this._dragDropRegistry.scroll.subscribe(event => {
      if (this.isDragging()) {
        const scrollDifference = this.scrollingStrategy.handleScroll(event);

        if (scrollDifference) {
          this.positionStrategy.adjustItemPositions((clientRect) => {
            adjustClientRect(clientRect, scrollDifference.top, scrollDifference.left);
          });

          this.positionStrategy.repositionDraggingItem();
        }
      } else if (this.isReceiving()) {
        this._cacheParentPositions();
      }
    });
  }

  /**
   * Lazily resolves and returns the shadow root of the element. We do this in a function, rather
   * than saving it in property directly on init, because we want to resolve it as late as possible
   * in order to ensure that the element has been moved into the shadow DOM. Doing it inside the
   * constructor might be too early if the element is inside of something like `ngFor` or `ngIf`.
   */
  protected _getShadowRoot(): RootNode {
    if (!this._cachedShadowRoot) {
      const shadowRoot       = _getShadowRoot(coerceElement(this.element));
      this._cachedShadowRoot = (shadowRoot || this._document) as RootNode;
    }

    return this._cachedShadowRoot;
  }

  /** Notifies any siblings that may potentially receive the item. */
  protected _notifyReceivingSiblings() {
    const draggedItems = this._activeDraggables.filter(item => item.isDragging());
    this._siblings.forEach(sibling => sibling._startReceiving(this, draggedItems));
  }
}
