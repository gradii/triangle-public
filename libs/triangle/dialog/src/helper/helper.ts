/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { ElementRef } from '@angular/core';
import { TriDialogRef } from '../dialog-ref';

/**
 * Finds the closest MatDialogRef to an element by looking at the DOM.
 * @param element Element relative to which to look for a dialog.
 * @param openDialogs References to the currently-open dialogs.
 */

export function getClosestDialog(element: ElementRef<HTMLElement>, openDialogs: TriDialogRef<any>[]) {
  let parent: HTMLElement | null = element.nativeElement.parentElement;

  while (parent && !parent.classList.contains('tri-dialog-container')) {
    parent = parent.parentElement;
  }

  return parent ? openDialogs.find(dialog => dialog.id === parent!.id) : null;
}
