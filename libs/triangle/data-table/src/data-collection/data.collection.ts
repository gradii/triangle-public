/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { DataResultIterator } from './data-result-iterator';

export class DataCollection<T> {

  renderData;

  constructor(protected accessor: DataResultIterator<T>) {
  }

  get total(): number {
    return this.accessor.total;
  }

  get length(): number {
    return this.accessor.data.length;
  }

  get first(): T {
    return this.accessor.data[0];
  }

  get last(): T {
    return this.accessor.data[this.length - 1];
  }

  getViewRange(start, end) {

  }

  at(index: number): T {
    // return itemAt(this.accessor.data, index);
    return this.accessor.data[index];
  }

  map(fn: (item: any, index: number, array: any[]) => any): any[] {
    return this.accessor.map(fn);
  }

  filter(fn: (item: any, index: number, array: any[]) => boolean): any[] {
    return this.accessor.filter(fn);
  }

  reduce(fn: (prevValue: any, curValue: any, curIndex: number, array: any[]) => any, init: any): any {
    return this.accessor.reduce(fn, init);
  }

  forEach(fn: (item: any, index: number, array: any[]) => void): void {
    this.accessor.forEach(fn);
  }

  some(fn: (value: any, index: number, array: any[]) => boolean): boolean {
    return this.accessor.some(fn);
  }

  toString(): string {
    return this.accessor.toString();
  }

  * [Symbol.iterator](): Iterator<T> {
    for (const item of this.accessor) {
      yield item;
    }

    // return this.accessor[Symbol.iterator]();
  }
}
