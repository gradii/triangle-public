/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { ElementRef } from '@angular/core';
import { Constructor } from './constructor';

/** @docs-private */
export interface CanColor {
  /** Theme color palette for the component. */
  color: ThemePalette;
}

/** @docs-private */
export type CanColorCtor = Constructor<CanColor>;

/** @docs-private */
export interface HasElementRef {
  _elementRef: ElementRef;
}

/** Possible color palette values. */
export type ThemePalette = 'primary' | 'accent' | 'warn' | undefined;

/** Mixin to augment a directive with a `color` property. */
export function mixinColor<T extends Constructor<HasElementRef>>(
  base: T, defaultColor?: ThemePalette): CanColorCtor & T {
  return class extends base {
    constructor(...args: any[]) {
      super(...args);

      // Set the default color that can be specified from the mixin.
      this.color = defaultColor;
    }

    private _color: ThemePalette;

    get color(): ThemePalette {
      return this._color;
    }

    set color(value: ThemePalette) {
      const colorPalette = value || defaultColor;

      if (colorPalette !== this._color) {
        if (this._color) {
          this._elementRef.nativeElement.classList.remove(`tri-${this._color}`);
        }
        if (colorPalette) {
          this._elementRef.nativeElement.classList.add(`tri-${colorPalette}`);
        }

        this._color = colorPalette;
      }
    }
  };
}

