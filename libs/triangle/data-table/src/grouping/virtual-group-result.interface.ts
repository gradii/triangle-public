/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { GroupResult } from '@gradii/triangle/data-query';

/**
 * Represents the group result which is used in virtual scrolling.
 */
export interface VirtualGroupResult extends GroupResult {

  /**
   * Determines if the group header will be rendered.
   */
  skipHeader: boolean;

  /**
   * Represents the absolute index of the current group.
   */
  offset: number;
}
