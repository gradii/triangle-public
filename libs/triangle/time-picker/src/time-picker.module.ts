/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TriI18nModule } from '@gradii/triangle/i18n';
import { TimePickerPanelComponent } from './time-picker-panel.component';
import { TimePickerComponent } from './time-picker.component';
import { TimeValueAccessorDirective } from './time-value-accessor.directive';

/**
 * <!-- example(time-picker:time-picker-basic-example) -->
 */
@NgModule({
  declarations: [
    TimePickerComponent,
    TimePickerPanelComponent,
    TimeValueAccessorDirective
  ],
  exports     : [
    TimePickerPanelComponent,
    TimePickerComponent
  ],
  imports     : [CommonModule, FormsModule, TriI18nModule, OverlayModule],
})
export class TriTimePickerModule {
}
