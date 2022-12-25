/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Directive, Optional, TemplateRef } from '@angular/core';

@Directive({
  selector: '[triGridHeaderTemplate], ng-template[triDataTableHeaderTemplate]'
})
export class HeaderTemplateDirective {
  constructor(@Optional() public templateRef: TemplateRef<any>) {
  }
}
