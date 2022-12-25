/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Directive, Optional, TemplateRef } from '@angular/core';

@Directive({
  selector: '[triGridGroupFooterTemplate], ng-template[triDataTableGroupFooterTemplate]'
})
export class GroupFooterTemplateDirective {
  constructor(@Optional() public templateRef: TemplateRef<any>) {
  }
}
