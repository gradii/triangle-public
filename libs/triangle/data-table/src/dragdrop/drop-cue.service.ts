/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Injectable } from '@angular/core';

import { append } from './common';

/**
 * @hidden
 */
@Injectable()
export class DropCueService {

  private dom: any;

  create(): void {
    this.dom = document.createElement('div');
    this.dom.className = 'k-grouping-dropclue';
    this.hide();
  }

  attach(): Function {
    return append(this.dom);
  }

  remove(): void {
    if (this.dom && this.dom.parentElement) {
      document.body.removeChild(this.dom);
      this.dom = null;
    }
  }

  hide(): void {
    this.dom.style.display = 'none';
  }

  position({left, top, height}: any): void {
    this.dom.style.display = 'block';
    this.dom.style.height = height + 'px';
    this.dom.style.top = top + 'px';

    const width = this.dom.offsetWidth / 2;
    this.dom.style.left = left - width + 'px';
  }
}
