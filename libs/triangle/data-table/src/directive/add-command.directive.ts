/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Directive, HostBinding, HostListener } from '@angular/core';
import { EditService } from './../service/edit.service';

@Directive({
  selector: '[triGridAddCommand], [tri-grid-add-command], ng-tempalte[triDataTableAddCommand]'
})
export class AddCommandDirective {
  private editService;

  constructor(editService: EditService) {
    this.editService = editService;
  }

  @HostBinding('class.tri-data-table-add-command')
  get commandClass() {
    return true;
  }

  @HostListener('click')
  click() {
    this.editService.beginAdd();
  }
}
