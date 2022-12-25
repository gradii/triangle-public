/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { BooleanInput } from '@angular/cdk/coercion';
import { Directive, ElementRef } from '@angular/core';
import { CanDisable, CanDisableCtor, mixinDisabled } from '@gradii/triangle/core';


// Boilerplate for applying mixins to TriTabLabelWrapper.
/** @docs-private */
class TriTabLabelWrapperBase {
}

const _TriTabLabelWrapperMixinBase: CanDisableCtor & typeof TriTabLabelWrapperBase =
        mixinDisabled(TriTabLabelWrapperBase);

/**
 * Used in the `tri-tab-group` view to display tab labels.
 * @docs-private
 */
@Directive({
  selector: '[triTabLabelWrapper]',
  inputs  : ['disabled'],
  host    : {
    '[class.tri-tab-disabled]': 'disabled',
    '[attr.aria-disabled]'    : '!!disabled',
  }
})
export class TriTabLabelWrapper extends _TriTabLabelWrapperMixinBase implements CanDisable {
  static ngAcceptInputType_disabled: BooleanInput;

  constructor(public elementRef: ElementRef) {
    super();
  }

  /** Sets focus on the wrapper element */
  focus(): void {
    this.elementRef.nativeElement.focus();
  }

  getOffsetLeft(): number {
    return this.elementRef.nativeElement.offsetLeft;
  }

  getOffsetWidth(): number {
    return this.elementRef.nativeElement.offsetWidth;
  }
}
