/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Directive, HostBinding, HostListener, Inject } from '@angular/core';
import { CELL_CONTEXT, CellContext } from '../cell-context';
import { EditService } from '../service/edit.service';

@Directive({
  selector: '[triGridSaveCommand], [tri-grid-save-command], ng-template[triDataTableSaveCommand]'
})
export class SaveCommandDirective {
  rowIndex: number;

  constructor(private editService: EditService, @Inject(CELL_CONTEXT) cellContext: CellContext) {
    this.rowIndex = cellContext.rowIndex;
  }

  @HostBinding('style.display')
  get visible() {
    return !this.editService.isEdited(this.rowIndex) ? 'none' : '';
  }

  @HostBinding('class.tri-data-table-save-command')
  get commandClass() {
    return true;
  }

  @HostListener('click')
  click(): void {
    this.editService.save(this.rowIndex);
  }
}
