/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */


/** @hidden */
export interface NavigationItem {
  id: number;
  uid?: string;
  children: NavigationItem[];
  parent: NavigationItem;
  disabled: boolean;
  visible: boolean;
  loadMoreButton: boolean;
}

