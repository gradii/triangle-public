/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Directive, ElementRef, Inject, InjectionToken, NgZone, Optional } from '@angular/core';
import { ANIMATION_MODULE_TYPE } from '@angular/platform-browser/animations';


/**
 * Interface for a a TriInkBar positioner method, defining the positioning and width of the ink
 * bar in a set of tabs.
 */
// tslint:disable-next-line class-name Using leading underscore to denote internal interface.
export interface _TriInkBarPositioner {
  (element: HTMLElement): { left: string, width: string };
}

/** Injection token for the TriInkBar's Positioner. */
export const _TRI_INK_BAR_POSITIONER =
  new InjectionToken<_TriInkBarPositioner>('TriInkBarPositioner', {
    providedIn: 'root',
    factory   : _TRI_INK_BAR_POSITIONER_FACTORY
  });

/**
 * The default positioner function for the TriInkBar.
 * @docs-private
 */
export function _TRI_INK_BAR_POSITIONER_FACTORY(): _TriInkBarPositioner {
  const method = (element: HTMLElement) => ({
    left : element ? (element.offsetLeft || 0) + 'px' : '0',
    width: element ? (element.offsetWidth || 0) + 'px' : '0',
  });

  return method;
}

/**
 * The ink-bar is used to display and animate the line underneath the current active tab label.
 * @docs-private
 */
@Directive({
  selector: 'tri-ink-bar',
  host    : {
    'class'                          : 'tri-ink-bar',
    '[class._tri-animation-noopable]': `_animationMode === 'NoopAnimations'`,
  },
})
export class TriInkBar {
  constructor(
    private _elementRef: ElementRef<HTMLElement>,
    private _ngZone: NgZone,
    @Inject(_TRI_INK_BAR_POSITIONER) private _inkBarPositioner: _TriInkBarPositioner,
    @Optional() @Inject(ANIMATION_MODULE_TYPE) public _animationMode?: string) {
  }

  /**
   * Calculates the styles from the provided element in order to align the ink-bar to that element.
   * Shows the ink bar if previously set as hidden.
   * @param element
   */
  alignToElement(element: HTMLElement) {
    this.show();

    if (typeof requestAnimationFrame !== 'undefined') {
      this._ngZone.runOutsideAngular(() => {
        requestAnimationFrame(() => this._setStyles(element));
      });
    } else {
      this._setStyles(element);
    }
  }

  /** Shows the ink bar. */
  show(): void {
    this._elementRef.nativeElement.style.visibility = 'visible';
  }

  /** Hides the ink bar. */
  hide(): void {
    this._elementRef.nativeElement.style.visibility = 'hidden';
  }

  /**
   * Sets the proper styles to the ink bar element.
   * @param element
   */
  private _setStyles(element: HTMLElement) {
    const positions = this._inkBarPositioner(element);
    const inkBar: HTMLElement = this._elementRef.nativeElement;

    inkBar.style.left = positions.left;
    inkBar.style.width = positions.width;
  }
}
