/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { DOCUMENT } from '@angular/common';
import { Inject, Injectable, Optional, Provider, SkipSelf } from '@angular/core';

const availablePrefixs = ['moz', 'ms', 'webkit'];

function requestAnimationFramePolyfill() {
  let lastTime = 0;
  return function (callback: Function) {
    const currTime = new Date().getTime();
    const timeToCall = Math.max(0, 16 - (currTime - lastTime));
    const id = window.setTimeout(function () {
      callback(currTime + timeToCall);
    }, timeToCall);
    lastTime = currTime + timeToCall;
    return id;
  };
}

function getRequestAnimationFrame() {
  if (typeof window === 'undefined') {
    return () => {
    };
  }
  if (window.requestAnimationFrame) {
    // https://github.com/vuejs/vue/issues/4465
    return window.requestAnimationFrame.bind(window);
  }

  const prefix = availablePrefixs.find(key => `${key}RequestAnimationFrame` in window);

  // @ts-ignore
  return prefix ? window[`${prefix}RequestAnimationFrame`] : requestAnimationFramePolyfill();
}

export const reqAnimFrame = getRequestAnimationFrame();

function easeInOutCubic(t: number, b: number, c: number, d: number) {
  const cc = c - b;
  t /= d / 2;
  if (t < 1) {
    return cc / 2 * t * t * t + b;
  } else {
    return cc / 2 * ((t -= 2) * t * t + 2) + b;
  }
}

@Injectable({
  providedIn: 'root'
})
export class ScrollService {
  constructor(@Inject(DOCUMENT) private _doc: any) {
  }

  /** 设置 `el` 滚动条位置 */
  setScrollTop(el: Element | Window, topValue: number = 0) {
    if (el === window) {
      this._doc.body.scrollTop = topValue;
      this._doc.documentElement.scrollTop = topValue;
    } else {
      (el as Element).scrollTop = topValue;
    }
  }

  /** 获取 `el` 相对于视窗距离 */
  getOffset(el: Element): { top: number; left: number } {
    const ret = {
      top : 0,
      left: 0
    };
    if (!el || !el.getClientRects().length) {
      return ret;
    }

    const rect = el.getBoundingClientRect();
    if (rect.width || rect.height) {
      const doc = el.ownerDocument!.documentElement;
      ret.top = rect.top - doc.clientTop;
      ret.left = rect.left - doc.clientLeft;
    } else {
      ret.top = rect.top;
      ret.left = rect.left;
    }

    return ret;
  }

  /** 获取 `el` 滚动条位置 */
  getScroll(el?: Element | Window, top: boolean = true): number {
    if (!el) {
      el = window;
    }
    const prop = top ? 'pageYOffset' : 'pageXOffset';
    const method = top ? 'scrollTop' : 'scrollLeft';
    const isWindow = el === window;
    // @ts-ignore
    let ret = isWindow ? el[prop] : el[method];
    if (isWindow && typeof ret !== 'number') {
      ret = this._doc.documentElement[method];
    }

    return ret;
  }

  /**
   * 使用动画形式将 `el` 滚动至某位置
   *
   * @param  containerEl 容器，默认 `window`
   * @param  [targetTopValue=0] 滚动至目标 `top` 值，默认：0，相当于顶部
   * @param  [easing] 动作算法，默认：`easeInOutCubic`
   * @param  [callback] 动画结束后回调
   */
  scrollTo(
    containerEl: Element | Window,
    targetTopValue: number = 0,
    easing?: Function,
    callback?: Function) {
    if (!containerEl) {
      containerEl = window;
    }
    const scrollTop = this.getScroll(containerEl);
    const startTime = Date.now();
    const frameFunc = () => {
      const timestamp = Date.now();
      const time = timestamp - startTime;
      this.setScrollTop(
        containerEl,
        (easing || easeInOutCubic)(time, scrollTop, targetTopValue, 450)
      );
      if (time < 450) {
        reqAnimFrame(frameFunc);
      } else {
        if (callback) {
          callback();
        }
      }
    };
    reqAnimFrame(frameFunc);
  }
}

export function SCROLL_SERVICE_PROVIDER_FACTORY(doc: any, scrollService: any) {
  return scrollService || new ScrollService(doc);
}

export const SCROLL_SERVICE_PROVIDER: Provider = {
  provide   : ScrollService,
  useFactory: SCROLL_SERVICE_PROVIDER_FACTORY,
  deps      : [DOCUMENT, [new Optional(), new SkipSelf(), ScrollService]]
};
