/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */


export class MapIterable {
  _source;
  _selector;
  constructor(source, selector) {
    this._source = source;
    this._selector = selector;
  }
  *[Symbol.iterator]() {
    let i = 0;
    for (const item of this._source) {
      yield this._selector(item, i++);
    }
  }
}
