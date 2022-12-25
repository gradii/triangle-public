/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Directive, TemplateRef } from '@angular/core';

@Directive({
  selector: '[triGridEditTemplate], [tri-grid-edit-template], ng-template[triDataTableEditTemplate]'
})
export class EditTemplateDirective {
  constructor(public templateRef: TemplateRef<any>) {
  }
}
