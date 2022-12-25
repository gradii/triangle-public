/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { DragRefInternal as DragRef } from '../drag-drop-ref/drag-ref';
import { CachedItemPosition } from '../drop-container.interface';

export interface PositionStrategy {

  _itemPositions: CachedItemPosition[];

  _cacheItemPositions(): void;

  _sortItem(item: DragRef, pointerX: number, pointerY: number,
            pointerDelta: { x: number, y: number }): void;

  _findItemIndex(item: DragRef): number;

  _getItemIndexFromPointerPosition(item: DragRef, pointerX: number, pointerY: number,
                                   delta?: { x: number, y: number }): number;

  adjustItemPositions(cb: (clientRect: ClientRect) => void): void;

  repositionDraggingItem(): void;

  reset(): void;

  dispose(): void;
}


// export class PositionStrategy {
//
// /** Node that is being auto-scrolled. */
// private _scrollNode: HTMLElement | Window;
//
// /** Number of pixels to scroll for each frame when auto-scrolling an element. */
// autoScrollStep: number = 2;
//
// /** Vertical direction in which the list is currently scrolling. */
// private _verticalScrollDirection = AutoScrollVerticalDirection.NONE;
//
// /** Horizontal direction in which the list is currently scrolling. */
// private _horizontalScrollDirection = AutoScrollHorizontalDirection.NONE;
//
// /** Used to signal to the current auto-scroll sequence when to stop. */
// readonly _stopScrollTimers = new Subject<void>();
//
// /** Subscription to the window being scrolled. */
// _viewportScrollSubscription = Subscription.EMPTY;
//
// constructor() {
// }
//
// _startScrollInterval = () => {
//   this._stopScrolling();
//
//   interval(0, animationFrameScheduler)
//     .pipe(takeUntil(this._stopScrollTimers))
//     .subscribe(() => {
//       const node       = this._scrollNode;
//       const scrollStep = this.autoScrollStep;
//
//       if (this._verticalScrollDirection === AutoScrollVerticalDirection.UP) {
//         incrementVerticalScroll(node, -scrollStep);
//       } else if (this._verticalScrollDirection === AutoScrollVerticalDirection.DOWN) {
//         incrementVerticalScroll(node, scrollStep);
//       }
//
//       if (this._horizontalScrollDirection === AutoScrollHorizontalDirection.LEFT) {
//         incrementHorizontalScroll(node, -scrollStep);
//       } else if (this._horizontalScrollDirection === AutoScrollHorizontalDirection.RIGHT) {
//         incrementHorizontalScroll(node, scrollStep);
//       }
//     });
// };
//
// _stopScrolling() {
//
// }
//
// dispose() {
//   // this._stopScrolling();
//   // this._stopScrollTimers.complete();
//   // this._viewportScrollSubscription.unsubscribe();
//   // this.beforeStarted.complete();
//   // this.entered.complete();
//   // this.exited.complete();
//   // this.dropped.complete();
//   // this.sorted.complete();
//   // this._activeSiblings.clear();
//   // this._scrollNode = null!;
//   // this._parentPositions.clear();
//   // this._dragDropRegistry.removeDropContainer(this);
// }
//
// scrolling() {
//
// }
//

// }
