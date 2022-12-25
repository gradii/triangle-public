/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Component, forwardRef, HostListener, Input, ViewEncapsulation } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * 带有文字
 * ```html
 * <tri-switch [ngModel]="false">
 *   <span checked>open</span>
 *   <span unchecked>closed</span>
 * </tri-switch>
 * ```
 */
@Component({
  selector     : 'tri-switch',
  encapsulation: ViewEncapsulation.None,
  exportAs     : 'triSwitch',
  template     : `
    <span [ngClass]="_classMap"
          class="tri-switch"
          [class.tri-switch-checked]="_checked"
          [class.tri-switch-disabled]="_disabled"
          [class.tri-switch-small]="_size === 'small'"
          tabindex="0">
      <span class="tri-switch-inner">
        <ng-template [ngIf]="_checked">
          <ng-content select="[checked], [aria-checked=true]"></ng-content>
        </ng-template>
        <ng-template [ngIf]="!_checked">
          <ng-content select="[unchecked], [aria-checked=false]"></ng-content>
        </ng-template>
      </span>
    </span>
  `,
  providers    : [
    {
      provide    : NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SwitchComponent),
      multi      : true
    }
  ],
  styleUrls    : ['../style/switch.scss']
})
export class SwitchComponent implements /* OnInit,*/ ControlValueAccessor {
  _classMap;
  _checked = false;
  // ngModel Access
  onChange: any = Function.prototype;
  onTouched: any = Function.prototype;
  @Input()
  dataConfigTrue = true;
  @Input()
  dataConfigFalse = false;

  _size: string;

  /**
   * Get size
   * 开关大小
   */
  @Input()
  get size(): string {
    return this._size;
  }

  /**
   * Set size
   * 设置大小
   * @param  value
   */
  set size(value: string) {
    this._size = value;
    // this.setClassMap();
  }

  _disabled = false;

  /**
   * Get disabled
   * 获取是否禁用
   */
  @Input()
  get disabled(): boolean {
    return this._disabled;
  }

  /**
   * Set disabled
   * 设置是否禁用
   * @param  value
   */
  set disabled(value: boolean) {
    this._disabled = value;
    // this.setClassMap();
  }

  @HostListener('click', ['$event'])
  onClick(e) {
    e.preventDefault();
    if (!this._disabled) {
      this.updateValue(!this._checked);
      this.onChange(this.mapCheckValue(this._checked));
    }
  }

  updateValue(value: any) {
    if (this._checked === value) {
      return;
    }

    if (value === this.dataConfigTrue) {
      this._checked = true;
    } else if (value === this.dataConfigFalse) {
      this._checked = false;
    }

    this._checked = !!value;
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
    this.disabled = isDisabled;
  }

  private mapCheckValue(checked) {
    if (checked) {
      return this.dataConfigTrue;
    } else {
      return this.dataConfigFalse;
    }
  }
}
