/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Directive, HostBinding, HostListener, Inject } from '@angular/core';
import { CELL_CONTEXT } from './../cell-context';
import { EditService } from './../service/edit.service';

@Directive({
  selector: '[triGridCancelCommand], [tri-grid-cancel-command], ng-template[triDataTableCancelCommand]'
})
export class CancelCommandDirective {
  rowIndex: number;
  private editService;

  constructor(editService: EditService, @Inject(CELL_CONTEXT) cellContext) {
    this.editService = editService;
    this.rowIndex = cellContext.rowIndex;
  }

  @HostBinding('style.display')
  get visible() {
    return !this.editService.isEdited(this.rowIndex) ? 'none' : '';
  }

  @HostBinding('class.tri-data-table-cancel-command')
  get commandClass() {
    return true;
  }

  @HostListener('click')
  click() {
    this.editService.endEdit(this.rowIndex);
  }
}
