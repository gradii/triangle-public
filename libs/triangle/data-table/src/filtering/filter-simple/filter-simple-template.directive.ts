/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Directive, Optional, TemplateRef } from '@angular/core';

@Directive({
  selector: '[triDataTableFilterSimpleTemplate], ng-template[triDataTableFilterSimpleTemplate]'
})
export class FilterSimpleTemplateDirective {
  constructor(@Optional() public templateRef: TemplateRef<any>) {
  }
}
