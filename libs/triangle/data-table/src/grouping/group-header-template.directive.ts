/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Directive, Optional, TemplateRef } from '@angular/core';

@Directive({
  selector: '[triGridGroupHeaderTemplate], ng-template[triDataTableGroupHeaderTemplate]'
})
export class GroupHeaderTemplateDirective {
  constructor(@Optional() public templateRef: TemplateRef<any>) {
  }
}
