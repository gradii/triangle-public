/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Component, ContentChild, HostBinding, Input } from '@angular/core';
import { AbstractControl, NgControl } from '@angular/forms';

@Component({
  selector: 'tri-form-control',
  template: `
    <span class="tri-form-item-children">
      <ng-content></ng-content>
    </span>
    <span *ngIf="hasFeedback" class="tri-form-item-children-icon">
        <tri-icon *ngIf="!isValidating&&isSuccess" svgIcon="outline:check-circle"></tri-icon>
        <tri-icon *ngIf="!isValidating&&isError" svgIcon="outline:close-circle"></tri-icon>
        <tri-icon *ngIf="!isValidating&&isWarning" svgIcon="outline:exclamation-circle"></tri-icon>
        <tri-icon *ngIf="isValidating" svgIcon="outline:loading"></tri-icon>
    </span>
    <ng-content select="tri-form-explain"></ng-content>
    <ng-content select="tri-form-extra"></ng-content>
  `,
  host    : {
    '[class.tri-form.item-control-wrapper]': 'true',
    '[class.tri-form-item-control]'        : 'true',
    '[class.has-warning]'                  : 'isWarning',
    '[class.has-error]'                    : 'isError',
    '[class.has-success]'                  : 'isSuccess',
    '[class.has-feedback]'                 : 'hasFeedBack',
    '[class.is-validating]'                : 'isValidating',
  }
})
export class FormControlComponent {
  iconType: string;
  @ContentChild(NgControl, {static: false}) ngControl: NgControl;

  constructor() {
  }

  _hasFeedback = false;

  @Input()
  get hasFeedback() {
    return this._hasFeedback;
  }

  /**
   * When add the attribue, work with validateStatus property, show the validation icon, suggest for use `tri-input` component together.
   * 当添加该属性时，配合 validateStatus 属性使用，展示校验状态图标，建议只配合 tri-input 组件使用
   * @param  value
   */
  set hasFeedback(value: boolean) {
    this._hasFeedback = value;
  }

  @HostBinding(`class.tri-form-item-control-wrapper`)
  _validateStatus: string | AbstractControl;

  @Input()
  get validateStatus(): string | AbstractControl {
    return this._validateStatus || this.ngControl && this.ngControl.control;
  }

  /**
   * Validate status
   * 校验状态，属性定义为当前 `formControl` 名称可以根据异步返回数据自动显示，也可手动定义 可选：'success' 'warning' 'error' 'validating'
   */
  set validateStatus(value: string | AbstractControl) {
    this._validateStatus = value;
  }

  get isWarning(): boolean {
    return this._isDirtyAndError('warning');
  }

  get isValidating(): boolean {
    return Boolean(
      this._isDirtyAndError('validating') ||
      this.validateStatus === 'pending' ||
      (this.validateStatus && (this.validateStatus as AbstractControl).dirty && (this.validateStatus as AbstractControl).pending)
    );
  }

  get isError(): boolean {
    return Boolean(
      this.validateStatus === 'error' ||
      (this.validateStatus &&
        (this.validateStatus as AbstractControl).dirty &&
        (this.validateStatus as AbstractControl).errors &&
        (this.validateStatus as AbstractControl).hasError &&
        !(this.validateStatus as AbstractControl).hasError('warning'))
    );
  }

  get isSuccess(): boolean {
    return Boolean(
      this.validateStatus === 'success' ||
      (this.validateStatus && (this.validateStatus as AbstractControl).dirty && (this.validateStatus as AbstractControl).valid)
    );
  }

  get hasFeedBack(): boolean {
    return this.hasFeedback as boolean;
  }

  _isDirtyAndError(name: string): boolean {
    return Boolean(
      this.validateStatus === name ||
      (this.validateStatus &&
        (this.validateStatus as AbstractControl).dirty &&
        (this.validateStatus as AbstractControl).hasError &&
        (this.validateStatus as AbstractControl).hasError(name))
    );
  }
}
