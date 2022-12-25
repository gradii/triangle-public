/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { FragmentDataChunk } from './fragment-data-chunk';
import { RowColFlags } from './row-col-flags';


export class DataGridModel {
  _sz: number; // null or < 0 means use default
  _cssClass: string;
  _szMin: number;
  _szMax: number;
  _list = null;
  _f: RowColFlags;
  _idx = -1;
  _dataChunk: FragmentDataChunk;

  /**
   * Gets or sets a value indicating whether the row or column is visible.
   */
  get visible(): boolean {
    return this._getFlag(RowColFlags.Visible);
  }

  set visible(value: boolean) {
    this._setFlag(RowColFlags.Visible, value);
  }

  /**
   * Gets a value indicating whether the row or column is visible and not collapsed.
   *
   * This property is read-only. To change the visibility of a
   * row or column, use the @see:visible property instead.
   */
  get isVisible(): boolean {
    return this._getFlag(RowColFlags.Visible) && !this._getFlag(RowColFlags.ParentCollapsed);
  }

  /**
   * Gets the index of the row or column in the parent collection.
   */
  get index(): number {
    return this._idx;
  }

  /**
   * Gets or sets the size of the row or column.
   * Setting this property to null or negative values causes the element to use the
   * parent collection's default size.
   */
  get size(): number {
    return this._sz;
  }

  set size(value: number) {
    if (value != this._sz) {
      this._sz = value;
    }
  }

  /**
   * Gets the render size of the row or column.
   * This property accounts for visibility, default size, and min and max sizes.
   */
  get renderSize(): number {
    if (!this.isVisible) {
      return 0;
    }
    let sz   = this._sz,
        list = this._list;

    // default size
    if ((sz == null || sz < 0) && list != null) {
      return Math.round(this._dataChunk.defaultSize);
    }

    // min/max
    if (this._dataChunk.minSize != null && sz < this._dataChunk.minSize) {
      sz = this._dataChunk.minSize;
    }
    if (this._dataChunk.maxSize != null && sz > this._dataChunk.maxSize) {
      sz = this._dataChunk.maxSize;
    }
    if (this._szMin != null && sz < this._szMin) {
      sz = this._szMin;
    }
    if (this._szMax != null && sz > this._szMax) {
      sz = this._szMax;
    }

    // done
    return Math.round(sz);
  }

  /**
   * Gets or sets a value indicating whether the user can resize the row or column with the mouse.
   */
  get allowResizing(): boolean {
    return this._getFlag(RowColFlags.AllowResizing);
  }

  set allowResizing(value: boolean) {
    this._setFlag(RowColFlags.AllowResizing, value);
  }

  /**
   * Gets or sets a value indicating whether the user can move the row or column to a new position with the mouse.
   */
  get allowDragging(): boolean {
    return this._getFlag(RowColFlags.AllowDragging);
  }

  set allowDragging(value: boolean) {
    this._setFlag(RowColFlags.AllowDragging, value);
  }

  /**
   * Gets or sets a value indicating whether cells in the row or column can be merged.
   */
  get allowMerging(): boolean {
    return this._getFlag(RowColFlags.AllowMerging);
  }

  set allowMerging(value: boolean) {
    this._setFlag(RowColFlags.AllowMerging, value);
  }

  /**
   * Gets or sets a value indicating whether the row or column is selected.
   */
  get isSelected(): boolean {
    return this._getFlag(RowColFlags.Selected);
  }

  set isSelected(value: boolean) {
    this._setFlag(RowColFlags.Selected, value);
  }

  /**
   * Gets or sets a value indicating whether cells in the row or column can be edited.
   */
  get isReadOnly(): boolean {
    return this._getFlag(RowColFlags.ReadOnly);
  }

  set isReadOnly(value: boolean) {
    this._setFlag(RowColFlags.ReadOnly, value);
  }

  /**
   * Gets or sets a value indicating whether cells in the row or column wrap their content.
   */
  get wordWrap(): boolean {
    return this._getFlag(RowColFlags.WordWrap);
  }

  set wordWrap(value: boolean) {
    this._setFlag(RowColFlags.WordWrap, value);
  }

  // /**
  //  * Gets or sets a CSS class name to use when rendering
  //  * non-header cells in the row or column.
  //  */
  // get cssClass(): string {
  //   return this._cssClass;
  // }
  //
  // set cssClass(value: string) {
  //   if (value != this._cssClass) {
  //     this._cssClass = asString(value);
  //     if (this.grid) {
  //       this.grid.invalidate(false);
  //     }
  //   }
  // }

  // Gets the value of a flag.
  _getFlag(flag: RowColFlags): boolean {
    return (this._f & flag) != 0;
  }

  // Sets the value of a flag, with optional notification.
  _setFlag(flag: RowColFlags, value: boolean) {
    if (value != this._getFlag(flag)) {
      this._f = value ? (this._f | flag) : (this._f & ~flag);
    }
  }
}
