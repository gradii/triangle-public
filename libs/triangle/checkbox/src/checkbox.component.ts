/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Component, EventEmitter, forwardRef, Input, Output, ViewEncapsulation } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { isFunction } from '@gradii/triangle/util';

export type CheckboxState = 'unchecked' | 'checked' | 'indeterminate';

/**
 * form value bind with checked
 */
@Component({
  selector     : 'tri-checkbox',
  encapsulation: ViewEncapsulation.None,
  template     : `
    <span [class.tri-checkbox]="true"
          [class.tri-checkbox-checked]="_checked"
          [class.tri-checkbox-focused]="_focused"
          [class.tri-checkbox-disabled]="disabled"
          [class.tri-checkbox-indeterminate]="!_checked && indeterminate">
        <span class="tri-checkbox-inner">
          <tri-icon *ngIf="checked" svgIcon="outline:check"></tri-icon>
          <tri-icon *ngIf="!checked && indeterminate" svgIcon="outline:line"></tri-icon>
        </span>
        <input type="checkbox"
               class="tri-checkbox-input"
               [attr.value]="value"
               [ngModel]="checked"
               (focus)="focus()"
               (blur)="blur()"
               (change)="$event.stopPropagation()">
      </span>
    <ng-template [ngIf]="label"><span>{{label}}</span></ng-template>
    <ng-template [ngIf]="!label">
      <ng-content></ng-content>
    </ng-template>
  `,
  providers    : [
    {
      provide    : NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckboxComponent),
      multi      : true
    }
  ],
  host         : {
    'class'  : 'tri-checkbox-wrapper',
    '(click)': 'onClick($event)'
  },
  styleUrls    : [
    '../style/checkbox.scss'
  ]
})
export class CheckboxComponent implements ControlValueAccessor {

  _el: HTMLElement;
  _focused = false;

  _state: CheckboxState;

  // ngModel Access
  onChange: Function;
  onTouched: Function;
  /**
   * Whether disable
   * 是否禁用
   */
  @Input() disabled             = false;
  /**
   * Set indeterminate sate, related to ant-checkbox-indeterminate style
   * 设置 indeterminate 状态，只负责样式控制
   */
  @Input() indeterminate        = false;
  @Input() label: string;
  @Input() value: any;
  @Input() initValue: boolean   = true;
  @Output() checkedChange       = new EventEmitter<boolean>();
  @Output() indeterminateChange = new EventEmitter<boolean>();
  @Output() checkStateChange    = new EventEmitter<CheckboxState>();

  constructor() {
  }

  _checked = false;

  /**
   * whether checked
   * 是否选中
   */
  @Input()
  get checked(): boolean {
    return this._checked;
  }

  set checked(value) {
    this._checked = value;
    if (value) {
      this.indeterminate = false;
    }
  }

  onClick(e: MouseEvent) {
    e.preventDefault();
    if (!this.disabled) {
      if (this.indeterminate && this._checked) {
        this.indeterminate = false;
        this.indeterminateChange.emit(this.indeterminate);
      }

      this.updateState();

      this.updateValue(!this._checked);
    }
  }

  updateState() {
    const state = this.indeterminate && this._checked ?
      'indeterminate' :
      this._checked ? 'checked' : 'unchecked';
    if (this._state !== state) {
      this.checkStateChange.emit(state);
      this._state = state;
    }
  }

  updateValue(value: boolean) {
    if (value === this._checked) {
      return;
    }
    if (isFunction(this.onChange)) {
      this.onChange(value);
    }
    this.checked = value;

    this.checkedChange.emit(value);

    this.updateState();
  }

  focus() {
    this._focused = true;
  }

  blur() {
    this._focused = false;
    if (isFunction(this.onTouched)) {
      this.onTouched();
    }
  }

  writeValue(value: any): void {
    this._checked = !!value;
  }

  registerOnChange(fn: (_: any) => {}): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => {}): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
