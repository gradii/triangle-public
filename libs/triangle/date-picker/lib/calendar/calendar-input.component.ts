/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CalendarI18nInterface, I18nService } from '@gradii/triangle/i18n';
import { CandyDate } from '../candy-date/candy-date';

@Component({
  selector   : 'calendar-input',
  templateUrl: 'calendar-input.component.html'
})

export class CalendarInputComponent implements OnInit {
  @Input() locale: CalendarI18nInterface;
  @Input() format: string;
  @Input() placeholder: string;
  @Input() disabledDate: (d: Date) => boolean;

  @Input() value: CandyDate;
  @Output() valueChange = new EventEmitter<CandyDate>();

  prefixCls: string = 'tri-calendar';
  invalidInputClass: string = '';

  constructor(private i18n: I18nService) {
  }

  ngOnInit(): void {
  }

  onInputKeyup(event: Event): void {
    const date = this.checkValidInputDate(event);

    if (!date || (this.disabledDate && this.disabledDate(date.nativeDate))) {
      return;
    }

    if (!date.isSame(this.value, 'second')) { // Not same with original value
      this.value = date;
      this.valueChange.emit(this.value);
    }
  }

  toReadableInput(value: CandyDate): string {
    return value ? this.i18n.formatDateCompatible(value.nativeDate, this.format) : '';
  }

  private checkValidInputDate(event: Event): CandyDate {
    const input = (event.target as HTMLInputElement).value;
    const date = new CandyDate(input);

    this.invalidInputClass = '';
    if (date.isInvalid() || input !== this.toReadableInput(date)) { // Should also match the input format exactly
      this.invalidInputClass = `${this.prefixCls}-input-invalid`;
      return null;
    }

    return date;
  }
}
