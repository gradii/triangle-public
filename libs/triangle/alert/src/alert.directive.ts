/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Directive, TemplateRef } from '@angular/core';


@Directive({
  selector: '[triAlertMessage]',
  exportAs: 'triAlertMessage'
})
export class AlertMessageDirective {
}

@Directive({
  selector: '[triAlertDescription]',
  exportAs: 'triAlertDescription'
})
export class AlertDescriptionDirective {
}

@Directive({
  selector: '[triAlertIcon]',
  exportAs: 'triAlertIcon'
})
export class AlertIconDirective {
}


