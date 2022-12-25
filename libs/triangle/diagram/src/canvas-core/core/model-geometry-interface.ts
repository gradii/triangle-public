/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Rectangle } from '@gradii/vector-math';

export interface ModelGeometryInterface {
  getBoundingBox(): Rectangle;
}
