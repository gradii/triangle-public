/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TriI18nModule } from '@gradii/triangle/i18n';
import { TriLoggerModule } from '@gradii/triangle/util';

import { LibPackerModule } from '../lib/lib-packer.module';

import { DatePickerComponent } from './date-picker.component';
import { MonthPickerComponent } from './month-picker.component';
import { PickerComponent } from './picker.component';
import { RangePickerComponent } from './range-picker.component';
import { WeekPickerComponent } from './week-picker.component';

/**
 * <!-- example(date-picker:date-picker-basic-example) -->
 */
@NgModule({
  imports     : [
    CommonModule,
    OverlayModule,
    TriI18nModule,
    TriLoggerModule,
    LibPackerModule
  ],
  exports     : [
    DatePickerComponent,
    RangePickerComponent,
    MonthPickerComponent,
    WeekPickerComponent
  ],
  declarations: [
    // DateRangePickerComponent,
    DatePickerComponent,
    MonthPickerComponent,
    WeekPickerComponent,
    RangePickerComponent,
    PickerComponent
  ],
  providers   : []
})
export class TriDatePickerModule {
}
