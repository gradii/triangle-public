/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Directive, ElementRef, HostListener, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { I18nService } from '@gradii/triangle/i18n';

@Directive({
  selector : 'input[triTime], input[tri-time]',
  providers: [
    {provide: NG_VALUE_ACCESSOR, useExisting: TimeValueAccessorDirective, multi: true}
  ]
})
export class TimeValueAccessorDirective implements ControlValueAccessor {

  @Input('triTime') format: string;
  private _onChange: (value: Date) => void;
  private _onTouch: () => void;

  constructor(private i18n: I18nService, private elementRef: ElementRef) {
  }

  @HostListener('keyup')
  keyup(): void {
    this.changed();
  }

  @HostListener('blur')
  blur(): void {
    this.touched();
  }

  changed(): void {
    if (this._onChange) {
      const value = this.i18n.parseTime(this.elementRef.nativeElement.value);
      this._onChange(value);
    }
  }

  touched(): void {
    if (this._onTouch) {
      this._onTouch();
    }
  }

  setRange(): void {
    this.elementRef.nativeElement.focus();
    this.elementRef.nativeElement.setSelectionRange(0, this.elementRef.nativeElement.value.length);
  }

  writeValue(value: Date): void {
    this.elementRef.nativeElement.value = this.i18n.formatDate(value, this.format);
  }

  registerOnChange(fn: (value: Date) => void): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this._onTouch = fn;
  }

}
