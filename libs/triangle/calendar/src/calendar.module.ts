/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TriI18nModule } from '@gradii/triangle/i18n';
import { TriRadioModule } from '@gradii/triangle/radio';
import { TriSelectModule } from '@gradii/triangle/select';
import {
  DateCellDirective,
  DateFullCellDirective,
  MonthCellDirective,
  MonthFullCellDirective
} from './calendar-cells';
import { CalendarHeaderComponent } from './calendar-header.component';
import { CalendarComponent } from './calendar.component';


/**
 * # Calendar
 *
 * ### When To Use
 *
 * ### Code Examples
 *
 * <!-- example(calendar:calendar-locale-example) -->
 * <!-- example(calendar:calendar-content-example) -->
 * <!-- example(calendar:calendar-card-example) -->
 * <!-- example(calendar:calendar-basic-example) -->
 */
@NgModule({
  declarations: [
    CalendarHeaderComponent,
    CalendarComponent,
    DateCellDirective,
    DateFullCellDirective,
    MonthCellDirective,
    MonthFullCellDirective
  ],
  exports     : [
    CalendarComponent,
  ],
  imports     : [CommonModule, FormsModule, TriI18nModule, TriRadioModule, TriSelectModule]
})
export class TriCalendarModule {
}
