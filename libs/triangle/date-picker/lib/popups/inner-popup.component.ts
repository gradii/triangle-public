/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  TemplateRef
} from '@angular/core';

import { CalendarI18nInterface } from '@gradii/triangle/i18n';
import { CandyDate } from '../candy-date/candy-date';
import { DisabledDateFn, PanelMode } from '../standard-types';

@Component({
  selector: 'inner-popup',
  templateUrl: 'inner-popup.component.html'
})

export class InnerPopupComponent implements OnInit, OnChanges {
  @Input() showWeek: boolean;

  @Input() locale: CalendarI18nInterface;
  @Input() showTimePicker: boolean;
  @Input() timeOptions: any;
  @Input() enablePrev: boolean;
  @Input() enableNext: boolean;
  @Input() disabledDate: DisabledDateFn;
  @Input() dateRender: TemplateRef<Date> | string;
  @Input() selectedValue: CandyDate[]; // Range ONLY
  @Input() hoverValue: CandyDate[]; // Range ONLY

  @Input() panelMode: PanelMode;
  @Output() panelModeChange = new EventEmitter<PanelMode>();

  @Input() value: CandyDate;

  @Output() headerChange = new EventEmitter<CandyDate>(); // Emitted when user changed the header's value
  @Output() selectDate = new EventEmitter<CandyDate>(); // Emitted when the date is selected by click the date panel
  @Output() selectTime = new EventEmitter<CandyDate>();
  @Output() dayHover = new EventEmitter<CandyDate>(); // Emitted when hover on a day by mouse enter

  prefixCls: string = 'tri-calendar';

  constructor() {
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.value && !this.value) {
      this.value = new CandyDate();
    }
  }

  onSelectTime(date: Date): void {
    this.selectTime.emit(new CandyDate(date));
  }

  // The value real changed to outside
  onSelectDate(date: CandyDate | Date): void {
    // this.value = date instanceof CandyDate ? date : new CandyDate(date);
    const value = date instanceof CandyDate ? date : new CandyDate(date);
    this.selectDate.emit(value);
  }
}
