/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Directive, TemplateRef } from '@angular/core';


@Directive({
  selector: '[triAnchorLinkTemplate], [tri-anchor-link-template]'
})
export class AnchorLinkTemplateDirective {

  constructor(public templateRef: TemplateRef<any>) {
  }
}
