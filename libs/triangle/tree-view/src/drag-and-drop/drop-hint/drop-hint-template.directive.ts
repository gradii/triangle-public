/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Directive, Optional, TemplateRef } from '@angular/core';

@Directive({
  selector: 'ng-template[triTreeViewDropHintTemplate]'
})
export class DropHintTemplateDirective {
  constructor(@Optional() public templateRef: TemplateRef<any>) {
  }
}
