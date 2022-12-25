/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Injectable } from '@angular/core';

@Injectable()
export class IndexBuilderService {
  INDEX_SEPARATOR: any;

  /**
   * @hidden
   */
  constructor() {
    this.INDEX_SEPARATOR = '_';
  }

  nodeIndex(index: string = '', parentIndex: string = ''): string {
    return `${parentIndex}${parentIndex ? this.INDEX_SEPARATOR : ''}${index}`;
  }

  indexForLevel(index: string, level: number) {
    return index.split(this.INDEX_SEPARATOR).slice(0, level).join(this.INDEX_SEPARATOR);
  }

  lastLevelIndex(index: string = '') {
    const parts = index.split(this.INDEX_SEPARATOR);
    if (!parts.length) {
      return NaN;
    }
    return parseInt(parts[parts.length - 1], 10);
  }

  level(index: string) {
    return index.split(this.INDEX_SEPARATOR).length;
  }
}
