/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Directive } from '@angular/core';

/**
 * Scrollable content container of a dialog.
 */
@Directive({
  selector: `[tri-dialog-content], tri-dialog-content, [triDialogContent]`,
  host    : {'class': 'tri-dialog-content'}
})
export class TriDialogContent {
}
