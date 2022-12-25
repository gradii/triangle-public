/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Directive } from '@angular/core';

/**
 * Container for the bottom action buttons in a dialog.
 * Stays fixed to the bottom when scrolling.
 */
@Directive({
  selector: `[tri-dialog-actions], tri-dialog-actions, [triDialogActions]`,
  host    : {'class': 'tri-dialog-actions'}
})
export class TriDialogActions {
}
