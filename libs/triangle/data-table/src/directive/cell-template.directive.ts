/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Directive, Optional, TemplateRef } from '@angular/core';

@Directive({
  selector: '[triGridCellTemplate], [tri-grid-cell-template], ng-template[triDataTableCellTemplate]'
})
export class CellTemplateDirective {
  constructor(@Optional() public templateRef: TemplateRef<any>) {
  }
}
