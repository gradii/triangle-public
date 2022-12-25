/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { TemplateRef } from '@angular/core';
import { CandyDate } from './candy-date/candy-date';

// The common result data format (the range-picker's props can be result as array)
export interface PickerResultSingle {
  date: CandyDate;
  dateString: string;
}

export interface PickerResultRange {
  date: CandyDate[];
  dateString: string[];
}

export type PickerResult = PickerResultSingle | PickerResultRange;

export type DisabledDateFn = (d: Date) => boolean;

export type DisabledTimePartial = 'start' | 'end';

export interface DisabledTimeConfig {
  disabledHours(): number[];

  disabledMinutes(hour: number): number[];

  disabledSeconds(hour: number, minute: number): number[];
}

export type DisabledTimeFn = (current: Date | Date[], partial?: DisabledTimePartial) => DisabledTimeConfig;

export interface SupportTimeOptions {
  format?: string;
  hourStep?: number;
  minuteStep?: number;
  secondStep?: number;
  hideDisabledOptions?: boolean;
  defaultOpenValue?: Date;
  addOn?: TemplateRef<void>;

  disabledHours?(): number[];

  disabledMinutes?(hour: number): number[];

  disabledSeconds?(hour: number, minute: number): number[];
}

export interface PresetRanges {
  [key: string]: Date[];
}

export type PanelMode = 'decade' | 'year' | 'month' | 'date' | 'time';
