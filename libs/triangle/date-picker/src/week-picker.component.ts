/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Component, forwardRef, ViewEncapsulation } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { I18nService } from '@gradii/triangle/i18n';
import { LoggerService } from '@gradii/triangle/util';

import { DateRangePickerComponent } from './date-range-picker.component';

@Component({
  selector     : 'tri-week-picker',
  encapsulation: ViewEncapsulation.None,
  templateUrl  : './date-range-picker.component.html',
  providers    : [{
    provide    : NG_VALUE_ACCESSOR,
    multi      : true,
    useExisting: forwardRef(() => WeekPickerComponent)
  }],
  host         : {
    '[class.tri-calendar-picker]': 'true'
  }
})

export class WeekPickerComponent extends DateRangePickerComponent {
  override showWeek: boolean = true;

  constructor(i18n: I18nService, logger: LoggerService) {
    super(i18n, logger);
  }
}
