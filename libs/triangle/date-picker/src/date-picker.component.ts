/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Component, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { I18nService } from '@gradii/triangle/i18n';
import { LoggerService } from '@gradii/triangle/util';

import { DateRangePickerComponent } from './date-range-picker.component';

@Component({
  selector   : 'tri-date-picker',
  templateUrl: './date-range-picker.component.html',
  providers  : [{
    provide    : NG_VALUE_ACCESSOR,
    multi      : true,
    useExisting: forwardRef(() => DatePickerComponent)
  }],
  host       : {
    '[class.tri-calendar-picker]': 'true'
  },
  styleUrls: [`../style/date-picker.scss`]
})

export class DatePickerComponent extends DateRangePickerComponent {
  override isRange: boolean = false;

  constructor(i18n: I18nService, logger: LoggerService) {
    super(i18n, logger);
  }
}
