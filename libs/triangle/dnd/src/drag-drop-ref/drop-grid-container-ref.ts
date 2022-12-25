/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { coerceElement } from '@angular/cdk/coercion';
import { ViewportRuler } from '@angular/cdk/scrolling';
import { ElementRef, NgZone } from '@angular/core';
import { Subject } from 'rxjs';
import type { TriDropGridContainer } from '../directives/drop-grid-container';
import { DragDropRegistry } from '../drag-drop-registry';
import { TriDragGridItemComponent } from '../drag-grid/drag-grid-item.component';
import { GridPushDirection, GridPushService } from '../drag-grid/grid-push.service';
import { GridSwapService } from '../drag-grid/grid-swap.service';
import { CompactType } from '../enum';
import { GridPositionStrategy } from '../position-strategy/grid-position-strategy';
import { DndContainerRef } from './dnd-container-ref';
import { DragRefInternal, DragRefInternal as DragRef, Point } from './drag-ref';

/**
 * Reference to a drop list. Used to manipulate or dispose of the container.
 */
export class DropGridContainerRef<T = any> extends DndContainerRef<T> {
  _hasPadding: boolean;

  _rowGap: number    = 0;
  _columnGap: number = 0;

  _currentContainerWidth: number;
  _currentContainerHeight: number;
  _currentTileWidth: number;
  _currentTileHeight: number;

  compactType: CompactType;

  private pushService: GridPushService;
  private swapService: GridSwapService;

  /** Emits as the user is swapping items while actively dragging. */
  readonly arranged = new Subject<{
    previousIndex: number,
    currentIndex: number,
    previousPosition: [number, number],
    currentPosition: [number, number],
    container: DndContainerRef,
    item: DragRef
  }>();

  constructor(
    element: ElementRef<HTMLElement> | HTMLElement,
    protected _dragDropRegistry: DragDropRegistry<DragRef, DndContainerRef>,
    _document: any,
    protected _ngZone: NgZone,
    protected _viewportRuler: ViewportRuler,
    protected positionStrategy: GridPositionStrategy
  ) {
    super(element,
      _dragDropRegistry,
      _document,
      _ngZone,
      _viewportRuler,
      positionStrategy);

    this.pushService = new GridPushService(this);
    this.swapService = new GridSwapService(this);
  }

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

    // const {x: positionX, y: positionY} = this.positionStrategy.pixelsToPosition(item, pointerX, pointerY);
    // console.log(positionX, positionY);

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

    coerceElement(this.element).appendChild(placeholder);

    // The transform needs to be cleared so it doesn't throw off the measurements.
    placeholder.style.transform = '';

    placeholder.style.width  = `${((this.data as unknown as TriDropGridContainer).config?.defaultItemCols || 1) * this._currentTileWidth - this._columnGap}px`;
    placeholder.style.height = `${((this.data as unknown as TriDropGridContainer).config?.defaultItemRows || 1) * this._currentTileHeight - this._rowGap}px`;

    // Note that the positions were already cached when we called `start` above,
    // but we need to refresh them since the amount of items has changed and also parent rects.
    this._cacheItemPositions();
    this._cacheParentPositions();

    // Notify siblings at the end so that the item has been inserted into the `activeDraggables`.
    this._notifyReceivingSiblings();
    this.entered.next({item, container: this, currentIndex: this.getItemIndex(item)});
  }

  lastDragCols = 1;
  lastDragRows = 1;

  // positionXBackup: number;
  // positionYBackup: number;

  collision: boolean;

  _arrangeItem(item: DragRef<TriDragGridItemComponent>, pointerX: number, pointerY: number,
               elementPointX: number, elementPointY: number,
               pointerDelta: { x: number; y: number }) {
    super._arrangeItem(item, pointerX, pointerY, elementPointX, elementPointY, pointerDelta);

    const latestPositionX = item.data.renderX;
    const latestPositionY = item.data.renderY;

    this.positionStrategy._sortItem(item, elementPointX, elementPointY, pointerDelta);

    const newPositionX = item.data.renderX;
    const newPositionY = item.data.renderY;

    const gridContainer = (this.data as unknown as TriDropGridContainer);

    const cancelledWhenCollisionContainer = gridContainer.checkGridCollision(item.data);
    if (cancelledWhenCollisionContainer) {
      this.positionStrategy._rollbackItem(item, item.data.x, item.data.y);
    }

    if (gridContainer.pushItems) {
      if (
        latestPositionX !== newPositionX ||
        latestPositionY !== newPositionY
      ) {
        let direction = '';
        if (latestPositionX < newPositionX) {
          direction = GridPushDirection.fromWest;
        } else if (latestPositionX > newPositionX) {
          direction = GridPushDirection.fromEast;
        } else if (latestPositionY < newPositionY) {
          direction = GridPushDirection.fromNorth;
        } else if (latestPositionY > newPositionY) {
          direction = GridPushDirection.fromSouth;
        }
        if (direction) {
          this.pushService.pushItems(item, direction, gridContainer.disablePushOnDrag);
          this.pushService.checkPushBack();
        }
      }
    }

    if (gridContainer.swapItem) {
      this.swapService.swapItem(item);
    }
  }

  drop(item: DragRefInternal, currentIndex: number,
       elementPositionX: number, elementPositionY: number,
       previousIndex: number, previousContainer: DndContainerRef,
       isPointerOverContainer: boolean, distance: Point,
       dropPoint: Point) {
    this._reset();

    this.pushService.setPushedItems();
    this.swapService.setSwapItem();

    const positionX = this.positionStrategy.latestPositionX;
    const positionY = this.positionStrategy.latestPositionY;

    this.dropped.next({
      item,
      currentIndex,
      positionX,
      positionY,
      previousIndex,
      container: this,
      previousContainer,
      isPointerOverContainer,
      distance,
      dropPoint
    });
  }

  /**
   * Figures out the index of an item in the container.
   * @param item Item whose index should be determined.
   */
  getItemIndex(item: DragRef): number {
    return -1;
  }

  checkCollision() {
  }

  exit(item: DragRefInternal) {
    if ((this.data as unknown as TriDropGridContainer).pushItems) {
      this.pushService.restoreItems();
    }
    if ((this.data as unknown as TriDropGridContainer).swapItem) {
      this.swapService.restoreSwapItem();
    }

    super.exit(item);
  }

  _reset() {
    (this.data as unknown as TriDropGridContainer).contentElement.nativeElement.style.width  = `0`;
    (this.data as unknown as TriDropGridContainer).contentElement.nativeElement.style.height = `0`;

    this._isDragging = false;

    this._siblings.forEach(sibling => sibling._stopReceiving(this));

    this.positionStrategy.reset();

    this._activeDraggables = [];

    this._stopScrolling();
    this._viewportScrollSubscription.unsubscribe();
    this.scrollingStrategy.reset();
  }

  getItemPosition(item: DragRef): string {
    return 'absolute';
  }

}
