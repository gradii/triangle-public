/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { Constructor } from './constructor';

/** @docs-private */
export interface CanDisableRipple {
  /** Whether ripples are disabled. */
  disableRipple: boolean;
}

/** @docs-private */
export type CanDisableRippleCtor = Constructor<CanDisableRipple>;

/** Mixin to augment a directive with a `disableRipple` property. */
export function mixinDisableRipple<T extends Constructor<{}>>(base: T): CanDisableRippleCtor & T {
  return class extends base {
    constructor(...args: any[]) {
      super(...args);
    }

    private _disableRipple: boolean = true;

    /** Whether the ripple effect is disabled or not. */
    get disableRipple() {
      return this._disableRipple;
    }

    set disableRipple(value: any) {
      this._disableRipple = coerceBooleanProperty(value);
    }
  };
}
