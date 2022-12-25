/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Component, EventEmitter, Input, Output } from '@angular/core';

import { CalendarI18nInterface } from '@gradii/triangle/i18n';

@Component({
  selector   : 'time-picker-button',
  templateUrl: './time-picker-button.component.html'
})

export class TimePickerButtonComponent {
  @Input() locale: CalendarI18nInterface;
  @Input() timePickerDisabled: boolean = false;

  @Input() showTimePicker: boolean = false;
  @Output() showTimePickerChange = new EventEmitter<boolean>();

  prefixCls: string = 'tri-calendar';

  onClick(): void {
    this.showTimePicker = !this.showTimePicker;
    this.showTimePickerChange.emit(this.showTimePicker);
  }
}
