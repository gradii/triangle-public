/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Directive, Optional, TemplateRef } from '@angular/core';

@Directive({
  selector: '[triGridNoRecordsTemplate], [tri-grid-no-records-template], ng-template[triDataTableNoRecordsTemplate]'
})
export class NoRecordsTemplateDirective {
  constructor(@Optional() public templateRef: TemplateRef<any>) {
  }
}
