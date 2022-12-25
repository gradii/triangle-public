/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import {
  Directive,
  ElementRef,
  Input,
  OnChanges,
  OnInit,
  Optional,
  SimpleChanges
} from '@angular/core';
import { TriDialogService } from '../dialog.service';
import { TriDialogRef } from '../dialog-ref';
import { getClosestDialog } from './helper';

/**
 * Button that will close the current dialog.
 */
@Directive({
  selector: `[tri-dialog-close], [triDialogClose]`,
  exportAs: 'triDialogClose',
  host    : {
    '(click)': 'dialogRef.close(dialogResult)',
    '[attr.aria-label]': 'ariaLabel',
    'class': 'tri-dialog-close'
  }
})
export class TriDialogClose implements OnInit, OnChanges {
  /** Screenreader label for the button. */
  @Input('aria-label') ariaLabel: string = 'Close dialog';

  /** Dialog close input. */
  @Input('tri-dialog-close') dialogResult: any;

  @Input('triDialogClose') _triDialogClose: any;

  constructor(
    @Optional() public dialogRef: TriDialogRef<any>,
    private _elementRef: ElementRef<HTMLElement>,
    private _dialog: TriDialogService) {
  }

  ngOnInit() {
    if (!this.dialogRef) {
      // When this directive is included in a dialog via TemplateRef (rather than being
      // in a Component), the DialogRef isn't available via injection because embedded
      // views cannot be given a custom injector. Instead, we look up the DialogRef by
      // ID. This must occur in `onInit`, as the ID binding for the dialog container won't
      // be resolved at constructor time.
      this.dialogRef = getClosestDialog(this._elementRef, this._dialog.openDialogs)!;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    const proxiedChange = changes['_triDialogClose'] || changes['_triDialogCloseResult'];

    if (proxiedChange) {
      this.dialogResult = proxiedChange.currentValue;
    }
  }
}
