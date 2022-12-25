/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Directive, Optional, TemplateRef } from '@angular/core';

@Directive({
  selector: '[triTreeViewDragClueTemplate]'
})
export class DragClueTemplateDirective {
  constructor(@Optional() public templateRef: TemplateRef<any>) {
  }
}
