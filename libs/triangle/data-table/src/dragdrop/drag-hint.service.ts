/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Injectable, Sanitizer, SecurityContext } from '@angular/core';

import { append, offset } from './common';

const updateClass = (element, valid) => {
  const icon = element.querySelector('.k-icon');

  icon.className = icon.className
    .replace(/(plus|cancel)/, valid ? 'plus' : 'cancel');
};

const updateLock = (element, locked = null) => {
  const icon = element.querySelectorAll('.k-icon')[1];
  const value = locked == null ? '' : (locked ? 'k-i-lock' : 'k-i-unlock');

  icon.className = icon.className
    .replace(/(k-i-unlock|k-i-lock)/, '') + ` ${value}`;
};

const decorate = (element, target) => {
  const targetStyles = getComputedStyle(target);

  element.className = 'k-header k-drag-clue';
  element.style.position = 'absolute';
  element.style.zIndex = '20000';
  element.style.paddingLeft = targetStyles.paddingLeft;
  element.style.paddingTop = targetStyles.paddingTop;
  element.style.paddingBottom = targetStyles.paddingBottom;
  element.style.paddingRight = targetStyles.paddingRight;
  element.style.width = targetStyles.width;
  element.style.height = targetStyles.height;
};

/**
 * @hidden
 */
@Injectable()
export class DragHintService {

  private dom: any;
  private initialTop: number;
  private initialLeft: number;

  constructor(private santizer: Sanitizer) {
  }

  create(down: any, target: Element, title: string): void {
    this.initCoords(down);

    this.dom = document.createElement('div');

    decorate(this.dom, target);

    const safeTitle = this.santizer.sanitize(SecurityContext.HTML, title);

    this.dom.innerHTML = `
            <span class="k-icon k-drag-status k-i-cancel k-icon-with-modifier">
                <span class="k-icon k-icon-modifier"></span>
            </span>
            ${safeTitle}
        `;
  }

  attach(): Function {
    return append(this.dom);
  }

  remove(): void {
    if (this.dom && this.dom.parentNode) {
      (function (el: any): any {
        setTimeout(() => document.body.removeChild(el));
      })(this.dom); // hack for IE + pointer events!

      this.dom = null;
    }
  }

  show(): void {
    this.dom.style.display = '';
  }

  hide(): void {
    this.dom.style.display = 'none';
  }

  enable(): void {
    updateClass(this.dom, true);
  }

  disable(): void {
    updateClass(this.dom, false);
  }

  removeLock(): void {
    updateLock(this.dom);
  }

  toggleLock(locked: boolean): void {
    updateLock(this.dom, locked);
  }

  move(move: any): void {
    this.dom.style.top = this.initialTop + move.pageY + 'px';
    this.dom.style.left = this.initialLeft + move.pageX + 'px';
  }

  private initCoords(down: any): void {
    const {top, left} = offset(down.originalEvent.target);

    this.initialTop = top - down.pageY;
    this.initialLeft = left - down.pageX;
  }
}
