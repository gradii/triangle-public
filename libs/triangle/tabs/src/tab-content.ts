/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Directive, TemplateRef } from '@angular/core';

/** Decorates the `ng-template` tags and reads out the template from it. */
@Directive({selector: '[triTabContent]'})
export class TriTabContent {
  constructor(public template: TemplateRef<any>) {
  }
}
