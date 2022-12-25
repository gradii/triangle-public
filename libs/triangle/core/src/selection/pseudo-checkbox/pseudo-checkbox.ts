/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  Input,
  Optional,
  ViewEncapsulation,
} from '@angular/core';
import { ANIMATION_MODULE_TYPE } from '@angular/platform-browser/animations';

/**
 * Possible states for a pseudo checkbox.
 * @docs-private
 */
export type TriPseudoCheckboxState = 'unchecked' | 'checked' | 'indeterminate';

/**
 * Component that shows a simplified checkbox without including any kind of "real" checkbox.
 * Meant to be used when the checkbox is purely decorative and a large number of them will be
 * included, such as for the options in a multi-select. Uses no SVGs or complex animations.
 * Note that theming is meant to be handled by the parent element, e.g.
 * `tri-primary .tri-pseudo-checkbox`.
 *
 * Note that this component will be completely invisible to screen-reader users. This is *not*
 * interchangeable with `<tri-checkbox>` and should *not* be used if the user would directly
 * interact with the checkbox. The pseudo-checkbox should only be used as an implementation detail
 * of more complex components that appropriately handle selected / checked state.
 * @docs-private
 */
@Component({
  encapsulation  : ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector       : 'tri-pseudo-checkbox',
  template       : '',
  host           : {
    'class'                                    : 'tri-pseudo-checkbox',
    '[class.tri-pseudo-checkbox-indeterminate]': 'state === "indeterminate"',
    '[class.tri-pseudo-checkbox-checked]'      : 'state === "checked"',
    '[class.tri-pseudo-checkbox-disabled]'     : 'disabled',
    '[class._tri-animation-noopable]'          : '_animationMode === "NoopAnimations"',
  },
  styleUrls: ['./pseudo-checkbox.scss']
})
export class PseudoCheckbox {
  /** Display state of the checkbox. */
  @Input() state: TriPseudoCheckboxState = 'unchecked';

  /** Whether the checkbox is disabled. */
  @Input() disabled: boolean = false;

  constructor(@Optional() @Inject(ANIMATION_MODULE_TYPE) public _animationMode?: string) {
  }
}
