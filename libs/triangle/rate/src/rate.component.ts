/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { ChangeDetectionStrategy, Component, Directive, ElementRef, EventEmitter, forwardRef, Input, NgZone, OnInit, Output, ViewEncapsulation, ɵmarkDirty } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { fromEvent, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { clamp } from '@gradii/triangle/util';
import { LEFT_ARROW, RIGHT_ARROW } from '@angular/cdk/keycodes';


@Component({
  selector: 'rate-star-item',
  template: `
     <div class="tri-rate-star-first" (mouseover)="_hoverRate($event)"
             (click)="_clickRate($event)">
          <tri-icon svgIcon="fill:star"></tri-icon>
        </div>
        <div class="tri-rate-star-second" (mouseover)="_hoverRate($event, true)"
             (click)="_clickRate($event, true)">
             <tri-icon svgIcon="fill:star"></tri-icon>
        </div>
  `,
  host: {
    '(mouseover)': '_hoverRate($event, true)',
    '(click)': '_clickRate($event, true)'
  }
})
export class _RateStarItemComponent {
  @Input('rateStarItemIndex')
  index = -1;

  @Output()
  onHoverRate = new EventEmitter();

  @Output()
  onClickRate = new EventEmitter();


  constructor(
  ) {
    // const element = this._elementRef.nativeElement;
    // _ngZone.runOutsideAngular(() => {
    //   fromEvent(element, 'mousemove').pipe(
    //     takeUntil(this.destroy$),

    //   ).subscribe()
    // })

  }

  _clickRate(e: any, isFull = false): void {
    e.stopPropagation();
    this.onClickRate.emit({ index: this.index, isFull });
  }

  _hoverRate(e: any, isFull = false) {
    e.stopPropagation();
    this.onHoverRate.emit({ index: this.index, isFull });
  }

}

@Component({
  selector: 'tri-rate',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
      <rate-star-item *ngFor="let star of _starArray; let i = index"
          class="tri-rate-star"
          [rateStarItemIndex]="i"
          (onHoverRate)="_onHoverRate($event)"
          (onClickRate)="_onClickRate($event)"
          [class.tri-rate-star-full]="i + 1 < _hoverValue || (!_hasHalf && i + 1 === _hoverValue)"
          [class.tri-rate-star-half]="_hasHalf && i + 1 === _hoverValue"
          [class.tri-rate-star-active]="_hasHalf && i + 1 === _hoverValue"
          [class.tri-rate-star-zero]=" i + 1 > _hoverValue"
        >
      </rate-star-item>
  `,
  styleUrls: ['../style/rate.scss'],
  host: {
    'class': 'tri-rate',
    '[class.tri-rate-disabled]': 'disabled',
    '[tabindex]': 'disabled ? -1 : 0',
    '(keydown)': 'onKeyDown($event)',
    '(mouseleave)': '_leaveRate($event)'
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RateComponent),
      multi: true
    }
  ]
})
export class RateComponent implements OnInit, ControlValueAccessor {
  _classMap: any;
  _starArray: Array<any> = new Array();
  _hoverValue = 0; // 鼠标悬浮时的星数，为正整数，和_hasHalf配合使用
  _hasHalf = false;

  _floatReg: any = /^\d+(\.\d+)$/;
  // ngModel Access
  onChange: any = Function.prototype;
  onTouched: any = Function.prototype;

  _count = 5;

  /**
   * Set the count of star
   * star 总数
   * @param  value
   */
  @Input()
  set count(value: number) {
    this._count = value;
  }

  _value = 0;


  @Input()
  /**
   * Get value
   * 获取值
   */
  get value(): number {
    return this._value;
  }

  /**
   * Set value
   * 设置值
   * @param  value
   */
  set value(value: number) {
    value = clamp(value, 0, this._count);
    if (this._value === value) {
      return;
    }
    this._value = value;
    if (this._floatReg.test(`${value}`)) {
      value += 0.5;
      this._hasHalf = true;
    } else {
      this._hasHalf = false;
    }
    this._hoverValue = value;
  }

  _allowHalf = false;

  /**
   * Set whether allow half select
   * 当添加该属性时允许半选
   * @param  value
   */
  @Input()
  set allowHalf(value: boolean) {
    this._allowHalf = value as boolean;
  }

  _disabled = false;

  /**
   * Set whether disabled
   * 设置是否禁用
   * @param  value
   */
  @Input()
  set disabled(value: boolean) {
    this._disabled = value;
    // this.setClassMap();
  }

  setChildrenClassMap(): void {
    let index = 0;
    while (index < this._count) {
      this._starArray.push(index++);
    }
  }


  onKeyDown(e: KeyboardEvent): void {
    const oldVal = this.value;

    if (e.keyCode === RIGHT_ARROW) {
      this.value += this._allowHalf ? 0.5 : 1;
    } else if (e.keyCode === LEFT_ARROW) {
      this.value -= this._allowHalf ? 0.5 : 1;
    }

    if (oldVal !== this.value) {
      this.onChange(this.value);

      ɵmarkDirty(this);
    }
  }

  _onClickRate({ index, isFull }: { index: number, isFull: boolean }): void {
    if (this._disabled) {
      return;
    }
    this._hoverValue = this._value = index + 1;
    this._hasHalf = !isFull && this._allowHalf;
    if (this._hasHalf) {
      this._value -= 0.5;
    }
    this.onChange(this._value);
  }

  _onHoverRate({ index, isFull }: { index: number, isFull: boolean }): void {
    if (this._disabled) {
      return;
    }
    const isHalf: boolean = !isFull && this._allowHalf;
    // 如果星数一致，则不作操作，用于提高性能
    if (this._hoverValue === index + 1 && isHalf === this._hasHalf) {
      return;
    }

    this._hoverValue = index + 1;
    this._hasHalf = isHalf;
  }

  _leaveRate(e: any): void {
    e.stopPropagation();
    let oldVal = this._value;
    if (this._floatReg.test(oldVal)) {
      oldVal += 0.5;
      this._hasHalf = true;
    } else {
      this._hasHalf = false;
    }
    this._hoverValue = oldVal;
  }

  writeValue(value: any): void {
    this.value = +value;
    ɵmarkDirty(this);
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

  ngOnInit() {
    this.setChildrenClassMap();
  }
}
