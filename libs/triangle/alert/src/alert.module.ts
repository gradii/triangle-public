/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TriCommonModule } from '@gradii/triangle/core';
import { TriIconModule } from '@gradii/triangle/icon';

import { AlertComponent } from './alert.component';
import { AlertDescriptionDirective, AlertIconDirective, AlertMessageDirective } from './alert.directive';

/**
 *
 * # Alert
 *
 * ### When To Use
 *
 * ### Code Examples
 * <!-- example(alert:alert-self-close-example) -->
 * <!-- example(alert:alert-long-description-example) -->
 * <!-- example(alert:alert-icon-close-example) -->
 * <!-- example(alert:alert-icon-example) -->
 * <!-- example(alert:alert-description-ul-example) -->
 * <!-- example(alert:alert-closeable-example) -->
 * <!-- example(alert:alert-basic-example) -->
 * <!-- example(alert:alert-4-type-message-example) -->
 */
@NgModule({
  imports     : [
    CommonModule,
    TriCommonModule,
    TriIconModule
  ],
  declarations: [
    AlertComponent,
    AlertMessageDirective,
    AlertDescriptionDirective,
    AlertIconDirective
  ],
  exports     : [
    AlertComponent,
    AlertMessageDirective,
    AlertDescriptionDirective,
    AlertIconDirective
  ],
})
export class TriAlertModule {
}
