/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import {
  Directive,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  TemplateRef
} from '@angular/core';
import { I18nService } from '@gradii/triangle/i18n';
import { isArray, LoggerService } from '@gradii/triangle/util';
import { CandyDate } from '../lib/candy-date/candy-date';
import { DisabledTimeFn, PanelMode, PresetRanges } from '../lib/standard-types';

import { AbstractPickerComponent, CompatibleDate } from './abstract-picker.component';

@Directive()
export class DateRangePickerComponent extends AbstractPickerComponent implements OnInit, OnChanges {
  showWeek: boolean = false; // Should show as week picker

  @Input() dateRender: TemplateRef<Date> | string;
  @Input() disabledTime: DisabledTimeFn;
  @Input() renderExtraFooter: TemplateRef<void> | string;
  @Input() showToday: boolean = true;
  @Input() mode: PanelMode | PanelMode[];
  @Input() ranges: PresetRanges;

  @Output() onPanelChange = new EventEmitter<PanelMode | PanelMode[]>();
  @Output() onCalendarChange = new EventEmitter<Date[]>();
  @Output() onOk = new EventEmitter<CompatibleDate>();
  extraFooter: TemplateRef<void> | string;

  constructor(i18n: I18nService, private logger: LoggerService) {
    super(i18n);
  }

  private _showTime: object | boolean;

  @Input()
  get showTime(): object | boolean {
    return this._showTime;
  }

  set showTime(value: object | boolean) {
    this._showTime = typeof value === 'object' ? value : value;
  }

  get realShowToday(): boolean { // Range not support showToday currently
    return !this.isRange && this.showToday;
  }

  override ngOnInit(): void {
    super.ngOnInit();

    // Default format when it's empty
    if (!this.format) {
      if (this.showWeek) {
        this.format = 'yyyy-ww'; // Format for week
      } else {
        this.format = this.showTime ? 'yyyy-MM-dd HH:mm:ss' : 'yyyy-MM-dd';
      }
    }
  }

  override ngOnChanges(changes: SimpleChanges): void {
    super.ngOnChanges(changes);

    if (changes.renderExtraFooter) {
      this.extraFooter = this.renderExtraFooter;
    }
  }

  // If has no timepicker and the user select a date by date panel, then close picker
  override onValueChange(value: CandyDate | CandyDate[]): void {
    super.onValueChange(value);

    if (!this.showTime) {
      this.closeOverlay();
    }
  }

  // Emit nzOnCalendarChange when select date by nz-range-picker
  _onCalendarChange(value: CandyDate | CandyDate[]): void {
    if (this.isRange && isArray(value)) {
      const rangeValue = value.map(x => x.nativeDate);
      this.onCalendarChange.emit(rangeValue);
    }
  }

  // Emitted when done with date selecting
  onResultOk(): void {
    if (this.isRange) {
      if ((this.value as CandyDate[]).length) {
        this.onOk.emit([this.value[0].nativeDate, this.value[1].nativeDate]);
      } else {
        this.onOk.emit([]);
      }
    } else {
      if (this.value) {
        this.onOk.emit((this.value as CandyDate).nativeDate);
      } else {
        this.onOk.emit(null);
      }
    }
    this.closeOverlay();
  }

  override onOpenChange(open: boolean): void {
    this.onOpen.emit(open);
  }
}
