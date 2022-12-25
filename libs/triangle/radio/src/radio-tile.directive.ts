/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Directive, HostBinding, HostListener, Input, OnChanges, OnDestroy } from '@angular/core';
import { RadioGroupDirective } from './radio-group.directive';
import { RadioOption } from './radio.component';

@Directive({
  selector: '[tri-radio-tile], [triRadioTile]'
})
export class RadioTileDirective implements RadioOption, OnChanges, OnDestroy {
  _focused                     = false;
  @Input() toggleable: boolean = true;

  constructor(protected radioGroup: RadioGroupDirective) {
    this.radioGroup.addRadio(this);
  }

  _label: string;

  @Input()
  get label(): string {
    return this._label;
  }

  set label(value: string) {
    this._label = value;
  }

  _value: string | number | any;

  /**
   * Get radio value
   * 获取当前Radio标示
   */
  @Input()
  get value(): string | number | any {
    return this._value;
  }

  /**
   * Set radio value
   * 设置当前Radio标示
   * @param  value
   */
  set value(value: string | number | any) {
    if (this._value === value) {
      return;
    }
    this._value = value;
  }

  _checked = false;

  get checked(): boolean {
    return this._checked;
  }

  @Input()
  @HostBinding('class.tri-radio-wrapper-checked')
  set checked(value: boolean) {
    this._checked = value;
  }

  _disabled = false;

  /**
   * Get whether disabled
   * 获取是否可禁用
   */
  @Input()
  @HostBinding('class.tri-radio-wrapper-disabled')
  get disabled(): boolean {
    return this._disabled || this.radioGroup._disabled;
  }

  /**
   * Set whether disabled
   * 设置是否可禁用
   * @param  value
   */
  set disabled(value: boolean) {
    this._disabled = value;
  }

  @HostListener('click', ['$event'])
  onClick(e: MouseEvent) {
    e.preventDefault();
    if (!this.disabled) {
      if (this.toggleable && this._checked) {
        this._checked = false;
        this.radioGroup.selectRadio(null);
      } else {
        this._checked = true;
        this.radioGroup.selectRadio(this);
      }
    }
  }

  ngOnChanges() {
    this.radioGroup.updateChecked();
  }

  ngOnDestroy() {
    this.radioGroup.removeRadio(this);
  }
}
