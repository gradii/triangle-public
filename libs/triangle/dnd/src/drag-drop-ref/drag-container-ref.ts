/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Direction } from '@angular/cdk/bidi';
import { coerceElement } from '@angular/cdk/coercion';
import { _getShadowRoot } from '@angular/cdk/platform';
import { ViewportRuler } from '@angular/cdk/scrolling';
import { ElementRef, NgZone } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { DragDropRegistry } from '../drag-drop-registry';
import { DragCSSStyleDeclaration } from '../drag-styling';
import { CachedItemPosition } from '../drop-container.interface';
import { SortPositionStrategy } from '../position-strategy/sort-position-strategy';
import { adjustClientRect, isInsideClientRect, } from '../utils/client-rect';
import { orderByHierarchy } from '../utils/hierarchy';
import { DndContainerRef, RootNode } from './dnd-container-ref';
import { DragRefInternal as DragRef, Point } from './drag-ref';

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
export class DragContainerRef<T = any> extends DndContainerRef<T> {
  /** Element that the drop list is attached to. */
  element: HTMLElement | ElementRef<HTMLElement>;

  /** Whether starting a dragging sequence from this container is disabled. */
  disabled: boolean = false;

  /** Whether sorting items within the list is disabled. */
  // sortingDisabled: boolean = true;

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
  enterPredicate: (drag: DragRef, drop: DndContainerRef) => boolean = () => false;

  /** Functions that is used to determine whether an item can be sorted into a particular index. */
  sortPredicate: (index: number, drag: DragRef, drop: DndContainerRef) => boolean = () => false;

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
    previousIndex: number,
    container: DndContainerRef,
    previousContainer: DndContainerRef,
    isPointerOverContainer: boolean,
    distance: Point;
    dropPoint: Point;
  }>();

  /** Emits as the user is swapping items while actively dragging. */
  readonly sorted = new Subject<{
    previousIndex: number,
    currentIndex: number,
    container: DndContainerRef,
    item: DragRef
  }>();

  /** Arbitrary data that can be attached to the drop list. */
  data: T;

  /** Whether an item in the list is being dragged. */
  protected _isDragging = false;

  /** Cache of the dimensions of all the items inside the container. */
  _itemPositions: CachedItemPosition[] = [];

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

  /** Node that is being auto-scrolled. */
  _scrollNode: HTMLElement | Window;

  /** Used to signal to the current auto-scroll sequence when to stop. */
  protected readonly _stopScrollTimers = new Subject<void>();

  /** Shadow root of the current element. Necessary for `elementFromPoint` to resolve correctly. */
  protected _cachedShadowRoot: RootNode | null = null;

  /** Reference to the document. */
  protected _document: Document;

  /** Elements that can be scrolled while the user is dragging. */
  protected _scrollableElements: HTMLElement[];

  /** Initial value for the element's `scroll-snap-type` style. */
  protected _initialScrollSnap: string;

  constructor(
    element: ElementRef<HTMLElement> | HTMLElement,
    protected _dragDropRegistry: DragDropRegistry<DragRef, DndContainerRef>,
    _document: any,
    protected _ngZone: NgZone,
    protected _viewportRuler: ViewportRuler,
    protected positionStrategy: SortPositionStrategy
  ) {
    super(element, _dragDropRegistry, _document, _ngZone, _viewportRuler, positionStrategy);
  }

  /** Removes the drop list functionality from the DOM element. */
  dispose() {
    this._stopScrolling();
    this._stopScrollTimers.complete();
    this._viewportScrollSubscription.unsubscribe();
    this.beforeStarted.complete();
    this.entered.complete();
    this.exited.complete();
    this.dropped.complete();
    this.sorted.complete();
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
    this._draggingStarted();
    //
    // // If sorting is disabled, we want the item to return to its starting
    // // position if the user is returning it to its initial container.
    // let newIndex: number;
    //
    // if (index == null) {
    //   newIndex = this.sortingDisabled ? this._draggables.indexOf(item) : -1;
    //
    //   if (newIndex === -1) {
    //     // We use the coordinates of where the item entered the drop
    //     // zone to figure out at which index it should be inserted.
    //     newIndex = this.positionStrategy._getItemIndexFromPointerPosition(item, pointerX, pointerY);
    //   }
    // } else {
    //   newIndex = index;
    // }
    //
    // const activeDraggables                        = this._activeDraggables;
    // const currentIndex                            = activeDraggables.indexOf(item);
    const placeholder = item.getPlaceholderElement();

    const previewRef = item.getPreviewRef();
    // let newPositionReference: DragRef | undefined = activeDraggables[newIndex];
    //
    // // If the item at the new position is the same as the item that is being dragged,
    // // it means that we're trying to restore the item to its initial position. In this
    // // case we should use the next item from the list as the reference.
    // if (newPositionReference === item) {
    //   newPositionReference = activeDraggables[newIndex + 1];
    // }
    //
    // // Since the item may be in the `activeDraggables` already (e.g. if the user dragged it
    // // into another container and back again), we have to ensure that it isn't duplicated.
    // if (currentIndex > -1) {
    //   activeDraggables.splice(currentIndex, 1);
    // }
    //
    // // Don't use items that are being dragged as a reference, because
    // // their element has been moved down to the bottom of the body.
    // if (newPositionReference && !this._dragDropRegistry.isDragging(newPositionReference)) {
    //   const element = newPositionReference.getRootElement();
    //   element.parentElement!.insertBefore(placeholder, element);
    //   activeDraggables.splice(newIndex, 0, item);
    // } else if (this._shouldEnterAsFirstChild(pointerX, pointerY)) {
    //   const reference = activeDraggables[0].getRootElement();
    //   reference.parentNode!.insertBefore(placeholder, reference);
    //   activeDraggables.unshift(item);
    // } else {
    //   coerceElement(this.element).appendChild(placeholder);
    //   activeDraggables.push(item);
    // }
    //
    // if (placeholder.parentNode) {
    //   placeholder.parentNode.removeChild(placeholder);
    // }

    // The transform needs to be cleared so it doesn't throw off the measurements.
    placeholder.style.transform = '';

    // Note that the positions were already cached when we called `start` above,
    // but we need to refresh them since the amount of items has changed and also parent rects.
    this._cacheItemPositions();
    this._cacheParentPositions();

    // Notify siblings at the end so that the item has been inserted into the `activeDraggables`.
    this._notifyReceivingSiblings();
    this.entered.next({item, container: this, currentIndex: this.getItemIndex(item)});
  }

  /**
   * Removes an item from the container after it was dragged into another container by the user.
   * @param item Item that was dragged out.
   */
  exit(item: DragRef): void {
    super.exit(item);
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
       isPointerOverContainer: boolean, distance: Point, dropPoint: Point): void {
    this._reset();
    this.dropped.next({
      item,
      currentIndex,
      previousIndex,
      container: this,
      previousContainer,
      isPointerOverContainer,
      distance,
      dropPoint
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

  // /**
  //  * Sets the orientation of the container.
  //  * @param orientation New orientation for the container.
  //  * @deprecated will use withPositionStrategy
  //  * @breaking-change 1.13.0
  //  */
  // withOrientation(orientation: 'vertical' | 'horizontal'): this {
  //   this._orientation = orientation;
  //   return this;
  // }

  withPositionStrategy(positionStrategy: 'vertical' | 'horizontal' |
    'flex-row' | 'flex-column' | 'grid'): this {

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
   * @param elementPositionY
   * @param pointerDelta Direction in which the pointer is moving along each axis.
   */
  _arrangeItem(item: DragRef, pointerX: number, pointerY: number,
               elementPointX: number, elementPointY: number,
               pointerDelta: { x: number, y: number }): void {

    // this.positionStrategy._sortItem(item, pointerX, pointerY, pointerDelta);
  }

  /** Stops any currently-running auto-scroll sequences. */
  _stopScrolling() {
    this._stopScrollTimers.next();
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

  /** Resets the container to its initial state. */
  protected _reset() {
    this._isDragging = false;

    const styles          = coerceElement(this.element).style as DragCSSStyleDeclaration;
    styles.scrollSnapType = styles.msScrollSnapType = this._initialScrollSnap;

    // TODO(crisbeto): may have to wait for the animations to finish.
    this._activeDraggables.forEach(item => {
      const rootElement = item.getRootElement();

      if (rootElement) {
        const initialTransform      = this._itemPositions
          .find(current => current.drag === item)?.initialTransform;
        rootElement.style.transform = initialTransform || '';
      }
    });


    this._siblings.forEach(sibling => sibling._stopReceiving(this));

    this.positionStrategy.reset();

    this._activeDraggables = [];
    this._itemPositions    = [];

    this._stopScrolling();
    this._viewportScrollSubscription.unsubscribe();
    this.scrollingStrategy.reset();
  }

  /**
   * Gets the offset in pixels by which the items that aren't being dragged should be moved.
   * @param currentIndex Index of the item currently being dragged.
   * @param siblings All of the items in the list.
   * @param delta Direction in which the user is moving.
   */
  protected _getSiblingOffsetPx(currentIndex: number,
                                siblings: CachedItemPosition[],
                                delta: 1 | -1) {

    const isHorizontal     = this._orientation === 'horizontal';
    const currentPosition  = siblings[currentIndex].clientRect;
    const immediateSibling = siblings[currentIndex + delta * -1];
    let siblingOffset      = currentPosition[isHorizontal ? 'width' : 'height'] * delta;

    if (immediateSibling) {
      const start = isHorizontal ? 'left' : 'top';
      const end   = isHorizontal ? 'right' : 'bottom';

      // Get the spacing between the start of the current item and the end of the one immediately
      // after it in the direction in which the user is dragging, or vice versa. We add it to the
      // offset in order to push the element to where it will be when it's inline and is influenced
      // by the `margin` of its siblings.
      if (delta === -1) {
        siblingOffset -= immediateSibling.clientRect[start] - currentPosition[end];
      } else {
        siblingOffset += currentPosition[start] - immediateSibling.clientRect[end];
      }
    }

    return siblingOffset;
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

    const itemPositions = this._itemPositions;
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
    const matchingTargets = targets.filter(ref => {
      return ref._clientRect && isInsideClientRect(ref._clientRect, x, y);
    });

    // Stop if no targets match the coordinates
    if (matchingTargets.length == 0) {
      return undefined;
    }

    // Order candidates by DOM hierarchy and z-index
    const orderedMatchingTargets = orderByHierarchy(matchingTargets);

    // The drop target is the last matching target in the list
    const matchingTarget = orderedMatchingTargets[orderedMatchingTargets.length - 1];

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
          // Since we know the amount that the user has scrolled we can shift all of the
          // client rectangles ourselves. This is cheaper than re-measuring everything and
          // we can avoid inconsistent behavior where we might be measuring the element before
          // its position has changed.
          this._itemPositions.forEach(({clientRect}) => {
            adjustClientRect(clientRect, scrollDifference.top, scrollDifference.left);
          });

          // We need two loops for this, because we want all of the cached
          // positions to be up-to-date before we re-sort the item.
          this._itemPositions.forEach(({drag}) => {
            if (this._dragDropRegistry.isDragging(drag)) {
              // We need to re-sort the item manually, because the pointer move
              // events won't be dispatched while the user is scrolling.
              drag._sortFromLastPointerPosition();
            }
          });
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
      const shadowRoot = _getShadowRoot(coerceElement(this.element));
      this._cachedShadowRoot = (shadowRoot || this._document) as RootNode;
    }

    return this._cachedShadowRoot;
  }

  /** Notifies any siblings that may potentially receive the item. */
  protected _notifyReceivingSiblings() {
    const draggedItems = this._activeDraggables.filter(item => item.isDragging());
    this._siblings.forEach(sibling => sibling._startReceiving(this, draggedItems));
  }

  getItemPosition() {
    return '';
  }
}
