/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SizeLDSType } from '@gradii/triangle/core';
import { I18nService as I18n } from '@gradii/triangle/i18n';
import { setMonth } from 'date-fns';

@Component({
  selector   : 'tri-calendar-header',
  templateUrl: './calendar-header.component.html',
  host       : {
    '[style.display]'                : `'block'`,
    '[class.tri-fullcalendar-header]': `true`
  }
})
export class CalendarHeaderComponent implements OnInit {
  @Input() mode: 'month' | 'year' = 'month';
  @Output() modeChange: EventEmitter<'month' | 'year'> = new EventEmitter();

  @Input() fullscreen: boolean = true;
  @Input() activeDate: Date = new Date();

  @Output() yearChange: EventEmitter<number> = new EventEmitter();
  @Output() monthChange: EventEmitter<number> = new EventEmitter();

  yearOffset: number = 10;
  yearTotal: number = 20;
  years: Array<{ label: string, value: number }>;
  months: Array<{ label: string, value: number }>;
  private prefixCls = 'tri-fullcalendar';

  constructor(private i18n: I18n) {
  }

  get activeYear(): number {
    return this.activeDate.getFullYear();
  }

  get activeMonth(): number {
    return this.activeDate.getMonth();
  }

  get size(): SizeLDSType {
    return this.fullscreen ? 'default' : 'small';
  }

  get yearTypeText(): string {
    return this.i18n.getLocale().Calendar.year;
  }

  get monthTypeText(): string {
    return this.i18n.getLocale().Calendar.month;
  }

  ngOnInit(): void {
    this.setUpYears();
    this.setUpMonths();
  }

  private setUpYears(): void {
    const start = this.activeYear - this.yearOffset;
    const end = start + this.yearTotal;

    this.years = [];
    for (let i = start; i < end; i++) {
      this.years.push({label: `${i}`, value: i});
    }
  }

  private setUpMonths(): void {
    this.months = [];

    for (let i = 0; i < 12; i++) {
      const dateInMonth = setMonth(this.activeDate, i);
      const monthText = this.i18n.formatDate(dateInMonth, 'MMM');
      this.months.push({label: monthText, value: i});
    }
  }
}
