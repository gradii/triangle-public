/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { ViewportRuler } from '@angular/cdk/scrolling';
import { ElementRef, NgZone } from '@angular/core';
import { DragDropRegistry } from '../drag-drop-registry';
import { PositionStrategy } from '../position-strategy/position-strategy';
import { DndContainerRef } from './dnd-container-ref';
import { DragRefInternal as DragRef } from './drag-ref';

/**
 * Reference to a drop list. Used to manipulate or dispose of the container.
 */
export class DropFreeContainerRef<T = any> extends DndContainerRef<T> {

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
    this._draggingStarted();

    // Note that the positions were already cached when we called `start` above,
    // but we need to refresh them since the amount of items has changed and also parent rects.
    this.positionStrategy._cacheItemPositions();
    // this.positionStrategy.trackActivePositions(this._activeDraggables);
    this._cacheParentPositions();

    // Notify siblings at the end so that the item has been inserted into the `activeDraggables`.
    this._notifyReceivingSiblings();
    this.entered.next({item, container: this});
  }

  dispose() {
    super.dispose();
  }
}
