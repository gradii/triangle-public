/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { DataGridModel } from './data-grid-model';
import { RowColFlags } from './row-col-flags';


/**
 * Represents a row in the grid.
 */
export class Row extends DataGridModel {
  children = [];
  /*private*/
  _ubv: any; // unbound value storage
  protected _data: any;

  /**
   * Initializes a new instance of a @see:Row.
   *
   * @param dataItem The data item that this row is bound to.
   */
  constructor(dataItem?: any) {
    super();
    this._f = RowColFlags.ColumnDefault;
    this._data = dataItem;
  }

  protected _level = -1;

  get level() {
    return this._level;
  }

  set level(value) {
    this._level = value;
  }

  get hasChildren(): boolean {
    return this.children.length > 0;
  }

  /**
   * Gets or sets the item in the data collection that the item is bound to.
   */
  get dataItem(): any {
    return this._data;
  }

  set dataItem(value: any) {
    this._data = value;
  }

  /**
   * Gets or sets the height of the row.
   * Setting this property to null or negative values causes the element to use the
   * parent collection's default size.
   */
  get height(): number {
    return this.size;
  }

  set height(value: number) {
    this.size = value;
  }

  /**
   * Gets the render height of the row.
   *
   * The value returned takes into account the row's visibility, default size, and min and max sizes.
   */
  // get renderHeight(): number {
  //   return this.renderSize;
  // }

  get isCollapsed(): boolean {
    return this._getFlag(RowColFlags.Collapsed);
  }

  set isCollapsed(value: boolean) {
    if (value != this.isCollapsed /*&& this._list != null*/) {
      this._setCollapsed(value);
    }
  }

  private static _recursiveParentCollapsed(r, collapsed) {
    r._setFlag(RowColFlags.ParentCollapsed, collapsed);
    if (
      collapsed && r.hasChildren || // 折叠则折叠全部
      !collapsed && r.hasChildren && !r.isCollapsed // 展开则只展开未折叠的
    ) {
      for (const sr of r.children) {
        Row._recursiveParentCollapsed(sr, collapsed);
      }
    }
  }

  // // sets the collapsed/expanded state of a group row
  _setCollapsed(collapsed: boolean) {
    this._setFlag(RowColFlags.Collapsed, collapsed);
    for (const r of this.children) {
      Row._recursiveParentCollapsed(r, collapsed);
    }
  }

}
