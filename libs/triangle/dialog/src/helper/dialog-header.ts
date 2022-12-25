/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Component, ElementRef, Input, OnInit, Optional } from '@angular/core';
import { TriDialogService } from '../dialog.service';
import { TriDialogRef } from '../dialog-ref';
import { getClosestDialog } from './helper';

/** Counter used to generate unique IDs for dialog elements. */
let dialogElementUid = 0;


/**
 * Title of a dialog element. Stays fixed to the top of the dialog when scrolling.
 */
@Component({
  selector: '[tri-dialog-header], [triDialogHeader]',
  template: `
    <div class="tri-modal-title">
      <ng-content></ng-content>
    </div>`,
  exportAs: 'triDialogHeader',
  host    : {
    'class': 'tri-dialog-header',
    '[id]' : 'id',
  },
})
export class TriDialogHeader implements OnInit {
  @Input() id = `tri-dialog-header-${dialogElementUid++}`;

  @Input() draggleAble = false;

  constructor(
    @Optional() private _dialogRef: TriDialogRef<any>,
    private _elementRef: ElementRef<HTMLElement>,
    private _dialog: TriDialogService) {
  }

  ngOnInit() {
    if (!this._dialogRef) {
      this._dialogRef = getClosestDialog(this._elementRef, this._dialog.openDialogs)!;
    }

    if (this._dialogRef) {
      Promise.resolve().then(() => {
        const container = this._dialogRef._containerInstance;

        if (container && !container._ariaLabelledBy) {
          container._ariaLabelledBy = this.id;
        }
      });
    }
  }
}
