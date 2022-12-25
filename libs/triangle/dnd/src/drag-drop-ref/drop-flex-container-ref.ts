/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { coerceElement } from '@angular/cdk/coercion';
import { ViewportRuler } from '@angular/cdk/scrolling';
import { ElementRef, NgZone } from '@angular/core';
import { Subject } from 'rxjs';
import { DragDropRegistry } from '../drag-drop-registry';
import { dragDropPosition } from '../drag-styling';
import { DROP_PROXIMITY_THRESHOLD } from '../enum';
import { FlexSortPositionStrategy } from '../position-strategy/flex-sort-position-strategy';
import { PositionStrategy } from '../position-strategy/position-strategy';
import { findIndex } from '../utils';
import { isPointerNearClientRect } from '../utils/client-rect';
import { DndContainerRef } from './dnd-container-ref';
import { DragRefInternal as DragRef } from './drag-ref';

/**
 * Reference to a drop list. Used to manipulate or dispose of the container.
 */
export class DropFlexContainerRef<T = any> extends DndContainerRef<T> {

  /** Whether sorting items within the list is disabled. */
  sortingDisabled: boolean = false;

  /** Emits as the user is swapping items while actively dragging. */
  readonly sorted = new Subject<{
    previousIndex: number,
    currentIndex: number,
    container: DndContainerRef,
    item: DragRef
  }>();

  constructor(
    element: ElementRef<HTMLElement> | HTMLElement,
    protected _dragDropRegistry: DragDropRegistry<DragRef, DndContainerRef>,
    _document: any,
    protected _ngZone: NgZone,
    protected _viewportRuler: ViewportRuler,
    protected positionStrategy: PositionStrategy
  ) {
    super(element,
      _dragDropRegistry,
      _document,
      _ngZone,
      _viewportRuler,
      positionStrategy);
  }

  enter(item: DragRef, pointerX: number, pointerY: number): void {
    let index;
    if (item.isInInitialContainer()) {
      // If we're re-entering the initial container and sorting is disabled,
      // put item the into its starting index to begin with.
      index = this.sortingDisabled ? item._initialIndex : undefined;
    }


    this._draggingStarted();

    // If sorting is disabled, we want the item to return to its starting
    // position if the user is returning it to its initial container.
    let newIndex: number;

    if (index == null) {
      newIndex = this.sortingDisabled ? this._draggables.indexOf(item) : -1;

      if (newIndex === -1) {
        // We use the coordinates of where the item entered the drop
        // zone to figure out at which index it should be inserted.
        newIndex = this.positionStrategy._getItemIndexFromPointerPosition(item, pointerX, pointerY);
      }
    } else {
      newIndex = index;
    }

    const activeDraggables                        = this._activeDraggables;
    const currentIndex                            = activeDraggables.indexOf(item);
    const placeholder                             = item.getPlaceholderElement();
    let newPositionReference: DragRef | undefined = activeDraggables[newIndex];

    // If the item at the new position is the same as the item that is being dragged,
    // it means that we're trying to restore the item to its initial position. In this
    // case we should use the next item from the list as the reference.
    if (newPositionReference === item) {
      newPositionReference = activeDraggables[newIndex + 1];
    }

    // Since the item may be in the `activeDraggables` already (e.g. if the user dragged it
    // into another container and back again), we have to ensure that it isn't duplicated.
    if (currentIndex > -1) {
      activeDraggables.splice(currentIndex, 1);
    }

    // drop list container should use position relative
    dragDropPosition(placeholder, true);

    // Don't use items that are being dragged as a reference, because
    // their element has been moved down to the bottom of the body.
    if (newPositionReference && !this._dragDropRegistry.isDragging(newPositionReference)) {
      const element = newPositionReference.getRootElement();
      element.parentElement!.insertBefore(placeholder, element);
      activeDraggables.splice(newIndex, 0, item);
    } else if (this._shouldEnterAsFirstChild(pointerX, pointerY)) {
      const reference = activeDraggables[0].getRootElement();
      reference.parentNode!.insertBefore(placeholder, reference);
      activeDraggables.unshift(item);
    } else {
      coerceElement(this.element).appendChild(placeholder);
      activeDraggables.push(item);
    }

    // The transform needs to be cleared so it doesn't throw off the measurements.
    placeholder.style.transform = '';

    // Note that the positions were already cached when we called `start` above,
    // but we need to refresh them since the amount of items has changed and also parent rects.
    this.positionStrategy._cacheItemPositions();
    // this.positionStrategy.trackActivePositions(this._activeDraggables);
    this._cacheParentPositions();

    // Notify siblings at the end so that the item has been inserted into the `activeDraggables`.
    this._notifyReceivingSiblings();
    this.entered.next({item, container: this, currentIndex: this.getItemIndex(item)});
  }

  protected _draggingStarted() {
    super._draggingStarted();
    const {rowGap, columnGap, paddingLeft, paddingTop, paddingRight, paddingBottom} = getComputedStyle(
      coerceElement(this.element));

    // need to check px, because rowGap columnGap can be 'normal'
    if (rowGap.endsWith('px')) {
      (this.positionStrategy as FlexSortPositionStrategy).rowGap = +rowGap.replace('px', '');
    }
    if (columnGap.endsWith('px')) {
      (this.positionStrategy as FlexSortPositionStrategy).columnGap = +columnGap.replace('px', '');
    }

    // use first item to calculate the container padding. because the border problem
    if (this.positionStrategy._itemPositions.length > 2) {
      const firstItem                                                 = this.positionStrategy._itemPositions[0];
      (this.positionStrategy as FlexSortPositionStrategy).paddingLeft = firstItem.clientRect.left - this._clientRect?.left;
      (this.positionStrategy as FlexSortPositionStrategy).paddingTop  = firstItem.clientRect.top - this._clientRect?.top;
    } else {
      (this.positionStrategy as FlexSortPositionStrategy).paddingLeft = +paddingLeft.replace('px', '');
      (this.positionStrategy as FlexSortPositionStrategy).paddingTop  = +paddingTop.replace('px', '');
    }

    (this.positionStrategy as FlexSortPositionStrategy).paddingRight  = +paddingRight.replace('px', '');
    (this.positionStrategy as FlexSortPositionStrategy).paddingBottom = +paddingBottom.replace('px', '');

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
    // Don't sort the item if sorting is disabled or it's out of range.
    if (this.sortingDisabled || !this._clientRect ||
      !isPointerNearClientRect(this._clientRect, DROP_PROXIMITY_THRESHOLD, pointerX, pointerY)) {
      return;
    }
    this.positionStrategy._sortItem(item, pointerX, pointerY, pointerDelta);
  }

  /**
   * Figures out the index of an item in the container.
   * @param item Item whose index should be determined.
   */
  getItemIndex(item: DragRef): number {
    if (!this._isDragging) {
      return this._draggables.indexOf(item);
    }

    // Items are sorted always by top/left in the cache, however they flow differently in RTL.
    // The rest of the logic still stands no matter what orientation we're in, however
    // we need to invert the array when determining the index.
    const items = this._orientation === 'horizontal' && this._direction === 'rtl' ?
      this.positionStrategy._itemPositions.slice().reverse() : this.positionStrategy._itemPositions;

    return findIndex(items, currentItem => currentItem.drag === item);
  }

  dispose() {
    this.sorted.complete();
    super.dispose();
  }
}
