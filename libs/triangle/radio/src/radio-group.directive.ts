/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { AfterContentInit, AfterViewInit, Directive, EventEmitter, forwardRef, Input, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { isFunction, isPresent } from '@gradii/triangle/util';
import { RadioButtonComponent } from './radio-button.component';

import { RadioComponent, RadioOption } from './radio.component';

export type RadioGroupType = 'flex' | 'block';

@Directive({
  selector : 'tri-radio-group, [triRadioList], [tri-radio-list]',
  providers: [
    {
      provide    : NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RadioGroupDirective),
      multi      : true
    }
  ],
  host     : {
    '[class.tri-radio-group]'     : 'true',
    '[class.tri-radio-group-flex]': '_type==="flex"'
  }
})
export class RadioGroupDirective implements AfterContentInit, AfterViewInit, ControlValueAccessor {
  /** @docs-private */
  _value: string;

  /** @docs-private */
  _size: string;

  /** @docs-private */
  _type: RadioGroupType = 'flex';

  _disabled: boolean;

  // ngModel Access
  onChange: Function;
  onTouched: Function;

  radios: (RadioComponent | RadioButtonComponent | RadioOption)[] = [];

  @Input()
  type(value: RadioGroupType) {
    this._type = value;
  }

  @Input()
  get value() {
    return this._value;
  }

  set value(value: any) {
    this.updateValue(value);
  }

  @Output()
  valueChange = new EventEmitter();

  addRadio(radio: RadioComponent | RadioButtonComponent | RadioOption) {
    this.radios.push(radio);
    this.updateChecked();
    this.updateDisabled();
  }

  removeRadio(radio: RadioComponent | RadioButtonComponent | RadioOption) {
    this.radios.splice(this.radios.indexOf(radio), 1);
  }

  selectRadio(radio: RadioComponent | RadioButtonComponent | RadioOption | null) {
    let value = null;
    if (isPresent(radio)) {
      this.updateValue(radio.value);
      value = radio.value;
    } else {
      this.updateValue(null);
    }
    if (isFunction(this.onChange)) {
      this.onChange(value);
    }
    this.valueChange.emit(value);
  }

  updateValue(value: any) {
    if (this._value === value) {
      return;
    }
    this._value = value;
    this.radios.forEach(item => {
      item.checked = item.value === this._value;
    });
  }

  updateChecked() {
    this.radios.forEach(item => {
      item.checked = item.value === this._value;
    });
  }

  updateDisabled() {
    if (this._disabled) {
      this.radios.forEach(item => {
        item.disabled = true;
      });
    }
  }

  ngAfterContentInit() {
    this.updateChecked();
  }

  ngAfterViewInit() {
    this.radios.forEach(item => {
      item.checked = item.value === this._value;
    });
  }

  writeValue(value: any): void {
    this.updateValue(value);
  }

  registerOnChange(fn: (_: any) => {}): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => {}): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this._disabled = isDisabled;
    this.radios.forEach(radio => {
      radio.disabled = isDisabled;
    });
  }
}
