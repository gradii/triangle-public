/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

const update = function (arr, idx, value) {
  return arr.slice(0, idx + 1).concat(
    arr.slice(idx + 1).map(function (x) {
      return x + value;
    })
  );
};

export class RowHeightService {
  private total;
  private rowHeight;
  private detailRowHeight;
  private offsets;
  private heights;

  constructor(total: number = 0, rowHeight: number, detailRowHeight: number) {
    this.total = total;
    this.rowHeight = rowHeight;
    this.detailRowHeight = detailRowHeight;
    this.offsets = [];
    this.heights = [];
    let agg = 0;
    for (let idx = 0; idx < total; idx++) {
      this.offsets.push(agg);
      agg += rowHeight;
      this.heights.push(rowHeight);
    }
  }

  height(rowIndex: number): number {
    return this.heights[rowIndex];
  }

  expandDetail(rowIndex: number): void {
    if (this.height(rowIndex) === this.rowHeight) {
      this.updateRowHeight(rowIndex, this.detailRowHeight);
    }
  }

  collapseDetail(rowIndex: number): void {
    if (this.height(rowIndex) > this.rowHeight) {
      this.updateRowHeight(rowIndex, this.detailRowHeight * -1);
    }
  }

  index(position: number): number {
    if (position < 0) {
      return undefined;
    }
    const result = this.offsets.reduce((prev, current, idx) => {
      if (prev !== undefined) {
        return prev;
      } else if (current === position) {
        return idx;
      } else if (current > position) {
        return idx - 1;
      }
      return undefined;
    }, undefined); // tslint:disable-line:align
    return result === undefined ? this.total - 1 : result;
  }

  offset(rowIndex: number): number {
    return this.offsets[rowIndex];
  }

  totalHeight(): number {
    return this.heights.reduce((prev, curr) => prev + curr, 0);
  }

  private updateRowHeight(rowIndex, value) {
    this.heights[rowIndex] += value;
    this.offsets = update(this.offsets, rowIndex, value);
  }
}
