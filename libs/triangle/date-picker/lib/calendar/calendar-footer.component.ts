/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Component, EventEmitter, Input, Output, TemplateRef } from '@angular/core';
import { CalendarI18nInterface } from '@gradii/triangle/i18n';

import { isNotNullOrEmptyString, isTemplateRef } from '@gradii/triangle/util';
import { CandyDate } from '../candy-date/candy-date';

@Component({
  selector   : 'calendar-footer',
  templateUrl: 'calendar-footer.component.html'
})
export class CalendarFooterComponent {
  @Input() locale: CalendarI18nInterface;
  @Input() showToday: boolean = false;
  @Input() hasTimePicker: boolean = false;
  @Input() isRange: boolean = false;

  @Input() showTimePicker: boolean = false;
  @Output() showTimePickerChange = new EventEmitter<boolean>();

  // @Input() disabled: boolean = false;
  @Input() timePickerDisabled: boolean = false;
  @Input() okDisabled: boolean = false;
  @Input() disabledDate: (d: Date) => boolean;
  @Input() extraFooter: TemplateRef<void> | string;
  @Input() rangeQuickSelector: TemplateRef<void>;

  @Output() clickOk = new EventEmitter<void>();
  @Output() clickToday = new EventEmitter<CandyDate>();

  prefixCls: string = 'tri-calendar';
  isTemplateRef = isTemplateRef;
  isNonEmptyString = isNotNullOrEmptyString;
}
