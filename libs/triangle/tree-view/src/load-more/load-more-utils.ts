/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { isPresent } from '@gradii/nanofn';


/**
 * @hidden
 */
export const copyPageSize      = (treeview, source, target) => {
  if (!isPresent(treeview.loadMoreService)) {
    return;
  }
  const sourceGroupSize = treeview.getNodePageSize(source);
  treeview.setNodePageSize(target, sourceGroupSize);
};
/**
 * @hidden
 */
export const incrementPageSize = (treeview, dataItem) => {
  if (!isPresent(treeview.loadMoreService)) {
    return;
  }
  const currentPageSize = treeview.getNodePageSize(dataItem);
  treeview.setNodePageSize(dataItem, currentPageSize + 1);
};
/**
 * @hidden
 */
export const decrementPageSize = (treeview, dataItem) => {
  if (!isPresent(treeview.loadMoreService)) {
    return;
  }
  const currentPageSize = treeview.getNodePageSize(dataItem);
  treeview.setNodePageSize(dataItem, currentPageSize - 1);
};
