/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

// identical to checkCollision() except that here we add boundaries.
import { TriDragGridItemComponent } from './drag-grid-item.component';

export function checkCollisionTwoItemsForSwaping(
  item: TriDragGridItemComponent,
  item2: TriDragGridItemComponent
): boolean {
  // if the cols or rows of the items are 1 , doesnt make any sense to set a boundary. Only if the item is bigger we set a boundary
  const horizontalBoundaryItem1 = item.cols === 1 ? 0 : 1;
  const horizontalBoundaryItem2 = item2.cols === 1 ? 0 : 1;
  const verticalBoundaryItem1   = item.rows === 1 ? 0 : 1;
  const verticalBoundaryItem2   = item2.rows === 1 ? 0 : 1;
  return (
    item.x + horizontalBoundaryItem1 < item2.x + item2.cols &&
    item.x + item.cols > item2.x + horizontalBoundaryItem2 &&
    item.y + verticalBoundaryItem1 < item2.y + item2.rows &&
    item.y + item.rows > item2.y + verticalBoundaryItem2
  );
}
