/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Directive, Optional, TemplateRef } from '@angular/core';

@Directive({
  selector: '[triDataTableFilterMenuTemplate], ng-template[triDataTableFilterMenuTemplate]'
})
export class FilterMenuTemplateDirective {
  constructor(@Optional() public templateRef: TemplateRef<any>) {
  }
}
