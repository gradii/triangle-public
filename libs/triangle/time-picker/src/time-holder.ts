/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { isPresent } from '@gradii/triangle/util';
import { Observable, Subject } from 'rxjs';

export class TimeHolder {
  constructor() {
  }

  private _seconds = undefined;

  get seconds(): number {
    return this._seconds;
  }

  set seconds(value: number) {
    if (value !== this._seconds) {
      this._seconds = value;
      this.update();
    }
  }

  private _hours = undefined;

  get hours(): number {
    return this._hours;
  }

  set hours(value: number) {
    if (value !== this._hours) {
      this._hours = value;
      this.update();
    }
  }

  private _minutes = undefined;

  get minutes(): number {
    return this._minutes;
  }

  set minutes(value: number) {
    if (value !== this._minutes) {
      this._minutes = value;
      this.update();
    }
  }

  private _defaultOpenValue: Date = new Date();

  get defaultOpenValue(): Date {
    return this._defaultOpenValue;
  }

  set defaultOpenValue(value: Date) {
    if (this._defaultOpenValue !== value) {
      this._defaultOpenValue = value;
      this.update();
    }
  }

  private _value: Date;

  get value(): Date {
    return this._value;
  }

  set value(value: Date) {
    if (value !== this._value) {
      this._value = value;
      if (isPresent(this._value)) {
        this._hours = this._value.getHours();
        this._minutes = this._value.getMinutes();
        this._seconds = this._value.getSeconds();
      } else {
        this._clear();
      }
    }
  }

  private _changes = new Subject<Date>();

  get changes(): Observable<Date> {
    return this._changes.asObservable();
  }

  get isEmpty(): boolean {
    return !(isPresent(this._hours) || isPresent(this._minutes) || isPresent(this._seconds));
  }

  get defaultHours(): number {
    return this._defaultOpenValue.getHours();
  }

  get defaultMinutes(): number {
    return this._defaultOpenValue.getMinutes();
  }

  get defaultSeconds(): number {
    return this._defaultOpenValue.getSeconds();
  }

  setDefaultValueIfNil(): void {
    if (!isPresent(this._value)) {
      this._value = new Date(this.defaultOpenValue);
    }
  }

  setMinutes(value: number, disabled: boolean): this {
    if (disabled) {
      return this;
    }
    this.setDefaultValueIfNil();
    this.minutes = value;
    return this;
  }

  setHours(value: number, disabled: boolean): this {
    if (disabled) {
      return this;
    }
    this.setDefaultValueIfNil();
    this.hours = value;
    return this;
  }

  setSeconds(value: number, disabled: boolean): this {
    if (disabled) {
      return this;
    }
    this.setDefaultValueIfNil();
    this.seconds = value;
    return this;
  }

  setValue(value: Date): this {
    this.value = value;
    return this;
  }

  clear(): void {
    this._clear();
    this.update();
  }

  changed(): void {
    this._changes.next(this._value);
  }

  setDefaultOpenValue(value: Date): this {
    this.defaultOpenValue = value;
    return this;
  }

  private _clear(): void {
    this._hours = undefined;
    this._minutes = undefined;
    this._seconds = undefined;
  }

  private update(): void {
    if (this.isEmpty) {
      this._value = undefined;
    } else {
      if (!isPresent(this._hours)) {
        this._hours = this.defaultHours;
      } else {
        this._value.setHours(this.hours);
      }

      if (!isPresent(this._minutes)) {
        this._minutes = this.defaultMinutes;
      } else {
        this._value.setMinutes(this.minutes);
      }

      if (!isPresent(this._seconds)) {
        this._seconds = this.defaultSeconds;
      } else {
        this._value.setSeconds(this.seconds);
      }

      this._value = new Date(this._value);
    }
    this.changed();
  }

}
