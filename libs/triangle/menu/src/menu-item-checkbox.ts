/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */


import { Directive } from '@angular/core';
import { TriMenuItem } from './menu-item';
import { TriMenuItemSelectable } from './menu-item-selectable';

/**
 * A directive providing behavior for the "menuitemcheckbox" ARIA role, which behaves similarly to a
 * conventional checkbox.
 */
@Directive({
  selector : '[triMenuItemCheckbox]',
  exportAs : 'triMenuItemCheckbox',
  host     : {
    '[tabindex]'          : '_tabindex',
    'type'                : 'button',
    'role'                : 'menuitemcheckbox',
    '[attr.aria-checked]' : 'checked || null',
    '[attr.aria-disabled]': 'disabled || null',
  },
  providers: [
    {provide: TriMenuItemSelectable, useExisting: TriMenuItemCheckbox},
    {provide: TriMenuItem, useExisting: TriMenuItemSelectable},
  ],
})
export class TriMenuItemCheckbox extends TriMenuItemSelectable {
  /** Toggle the checked state of the checkbox. */
  override trigger() {
    super.trigger();

    if (!this.disabled) {
      this.checked = !this.checked;
    }
  }
}
