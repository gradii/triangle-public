/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { DataResult } from '@gradii/triangle/data-query';
import { isFunction, isIterable, isPresent, isString } from '@gradii/triangle/util';
import { GroupRow } from '../row-column/group-row';
import { Row } from '../row-column/row';
import { DeferIterable } from './iterator/defer-iterator';
import { MapIterable } from './iterator/map-iterator';
import { toArray } from './iterator/to-array-iterator';

const isGroupItem = function (source) {
  return source.items !== undefined && source.field !== undefined;
};

export interface GridDataResult extends DataResult {
}

export class DataResultIterator<T> implements Iterable<T> {
  private _cachedData: Array<T>;
  private iterator: any;

  constructor(private source: GridDataResult | any[]    = [],
              // private groups: GroupDescriptor[],
              // private skip: number = 0,
              // private groupFooters: boolean          = false,
              private childItemsPath: string | Function = null) {

    if (!isPresent(source)) {
      this.source = [];
    }
    if (this.isGridDataResult(this.source)) {
      this._data  = this.source.data;
      this._total = (this.source as GridDataResult).total;
    } else {
      this._data = this.source;
    }

    this.iterator = new MapIterable(new DeferIterable(() => this._bindRow()), (row, idx) => {
      row._idx = idx;
      return row;
    });
  }

  private _data: any[];

  get data(): any[] {
    if (!this._cachedData) {
      this._cachedData = toArray(this.iterator);
    }
    return this._cachedData;
  }

  private _total = Infinity;

  get total(): number {
    return this._total;
  }

  set total(value) {
    this._total = value;
  }

  isGridDataResult(source: GridDataResult | any): source is GridDataResult {
    return source.total !== undefined && source.data !== undefined;
  }

  map(fn: (item: any, index: number, array: any[]) => any): any[] {
    return this.data.map(fn);
  }

  filter(fn: (item: any, index: number, array: any[]) => boolean): any[] {
    return this.data.filter(fn);
  }

  reduce(fn: (prevValue: any, curValue: any, curIndex: number, array: any[]) => any, init: any): any {
    return this.data.reduce(fn, init);
  }

  forEach(fn: (item: any, index: number, array: any[]) => void): void {
    this.data.forEach(fn);
  }

  some(fn: (value: any, index: number, array: any[]) => boolean): boolean {
    return this.data.some(fn);
  }

  toString(): string {
    return this.data.toString();
  }

  [Symbol.iterator](): Iterator<T> {
    return this.data[Symbol.iterator]();
  }

  private* _bindRow() {
    if (this._data) {
      const list = this._data;
      // const groups = this.groups;

      // bind to hierarchical sources (childItemsPath)
      if (this.childItemsPath) {
        for (const item of list) {
          yield* this._addTreeNode(item, 0);
        }

        // bind to grouped sources
        // } else if (groups != null && groups.length > 0 /*&& this.showGroups*/) {
        //   for (let item of groups) {
        //     yield* this._addGroup(item);
        //   }
        //
        //   // bind to regular sources
      } else {
        if (isIterable(list)) {
          let f;
          for (const item of list) {
            f = item;
            break;
          }
          for (const item of list) {
            if (isGroupItem(f)) {
              yield* this._addGroup(item);
            } else {
              yield new Row(item);
            }
          }
        } else {
          throw new Error('the data from list is not iterable');
        }
      }
    }
  }

  private* _addGroup(g: any, level = 0, parent?: GroupRow) {
    // add child rows
    if (isGroupItem(g)) {
      // add group row
      const gr    = new GroupRow();
      gr.level    = level;
      gr.dataItem = g;
      gr.field    = g.field;
      gr.value    = g.value;
      yield gr;

      for (const _it of g.items) {
        yield* this._addGroup(_it, level + 1, gr);
      }

    } else {
      yield new Row(g);
    }
  }

  private* _addTreeNode(item: any, level: number, parent?: GroupRow | Row) {
    const gr       = new Row(parent),
          children = this.getChildren(item, this.childItemsPath);

    // add main node
    gr.dataItem = item;
    gr.level    = level;
    yield gr;

    // add child nodes
    if (children) {
      for (let i = 0; i < children.length; i++) {
        const child = yield* this._addTreeNode(children[i], level + 1, gr);
        gr.children.push(child);
      }
    }

    gr.isCollapsed = true;

    return gr;
  }

  private getChildren(item, childItemPath) {
    if (isString(childItemPath)) {
      return Reflect.get(item, childItemPath);
    } else if (isFunction(childItemPath)) {
      return childItemPath(item);
    }
  }
}
