/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { Constructor } from './constructor';

/** @docs-private */
export interface CanDisable {
  /** Whether the component is disabled. */
  disabled: boolean;
}

/** @docs-private */
export type CanDisableCtor = Constructor<CanDisable>;

/** Mixin to augment a directive with a `disabled` property. */
export function mixinDisabled<T extends Constructor<{}>>(base: T): CanDisableCtor & T {
  return class extends base {
    constructor(...args: any[]) {
      super(...args);
    }

    private _disabled: boolean = false;

    get disabled() {
      return this._disabled;
    }

    set disabled(value: any) {
      this._disabled = coerceBooleanProperty(value);
    }
  };
}
