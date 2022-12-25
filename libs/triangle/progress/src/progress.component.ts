/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Component, forwardRef, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector     : 'tri-progress',
  encapsulation: ViewEncapsulation.None,
  template     : `
    <div [ngClass]="'tri-progress tri-progress-status-'+status"
         [class.tri-progress-line]="type=='line'"
         [class.tri-progress-inline]="type=='inline'"
         [class.tri-progress-show-info]="showInfo"
         [class.tri-progress-circle]="type=='circle'">
      <div *ngIf="type=='line'||type=='inline'">
        <div class="tri-progress-outer">
          <div class="tri-progress-inner">
            <div class="tri-progress-bg"
                 [style.width.%]="+_percent"
                 [style.height.px]="strokeWidth"></div>
          </div>
        </div>
        <span class="tri-progress-text" *ngIf="showInfo">
          <ng-template
            [ngIf]="(status=='active')||(status=='normal')||(_hasFormat)">{{_format(_percent)}}</ng-template>
          <ng-template [ngIf]="((status=='exception')||(status=='success'))&&(!_hasFormat)">
            <i class="anticon"
               [ngClass]="{'anticon-check-circle':status=='success','anticon-close-circle':status=='exception'}"></i>
          </ng-template>
        </span>
      </div>
      <div class="tri-progress-inner" *ngIf="type=='circle'" [ngStyle]="_circleStyle">
        <svg class="rc-progress-circle " viewBox="0 0 100 100" *ngIf="type=='circle'">
          <path class="rc-progress-circle-trail" [attr.d]="_pathString" stroke="#f3f3f3"
                [attr.stroke-width]="strokeWidth"
                fill-opacity="0"></path>
          <path class="rc-progress-circle-path" [attr.d]="_pathString" stroke-linecap="round"
                [attr.stroke]="_statusColorMap[status]"
                stroke-width="6" fill-opacity="0" [ngStyle]="_pathStyle"></path>
        </svg>
        <span class="tri-progress-text" *ngIf="showInfo"><ng-template
          [ngIf]="(status=='active')||(status=='normal')||(_hasFormat)">{{_format(_percent)}}</ng-template>
          <ng-template [ngIf]="(status=='exception')||(status=='success')&&!(_hasFormat)">
            <i class="anticon"
               [ngClass]="{'anticon-check':status=='success','anticon-cross':status=='exception'}"></i>
          </ng-template>
        </span>
      </div>
    </div>
  `,
  providers    : [
    {
      provide    : NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ProgressComponent),
      multi      : true
    }
  ]
})
export class ProgressComponent implements ControlValueAccessor, OnInit {
  _statusColorMap = {
    normal   : '#108ee9',
    exception: '#ff5500',
    success  : '#87d068'
  };

  _pathString = '';
  _pathStyle = {};
  _circleStyle = {};
  _percent = 0;
  _hasFormat = false;
  _rawStatus = 'normal';
  // ngModel Access
  onChange: any = Function.prototype;
  onTouched: any = Function.prototype;

  /**
   * 类型，可选  `line` `circle` `inline` `dashboard`
   */
  @Input() type = 'line';

  /**
   * stroke width
   * 进度条线的宽度, 单位 px
   */
  @Input() strokeWidth: number = this.type === 'line' ? 10 : 6;

  /**
   * width
   * 圆形进度条画布宽度，单位 px
   */
  @Input() width = 132;

  /**
   * whether show progress value or status icon
   * 是否显示进度数值或状态图标
   */
  @Input() showInfo = true;

  /**
   * Status, optional: `success` `exception` `active`
   * 状态，可选： `success` `exception` `active`
   */
  @Input() status = 'normal';

  constructor() {
  }

  /**
   * Set the format function for content
   * 设置内容的模板函数
   * @param value
   */
  @Input('format')
  set _setFormat(value: Function) {
    this._format = value;
    this._hasFormat = true;
  }

  _format: Function = (percent: any) => percent ? percent + '%' : '暂无';

  updateCircleStatus() {
    const circleSize = this.width || 132;
    this._circleStyle = {
      'width.px'    : circleSize,
      'height.px'   : circleSize,
      'font-size.px': circleSize * 0.16 + 6
    };
    const radius = 50 - this.strokeWidth / 2;
    const len = Math.PI * 2 * radius;
    this._pathString = `M 50,50 m 0,-${radius}
     a ${radius},${radius} 0 1 1 0,${2 * radius}
     a ${radius},${radius} 0 1 1 0,-${2 * radius}`;
    this._pathStyle = {
      'stroke-dasharray' : len + 'px ' + len + 'px',
      'stroke-dashoffset': (100 - this._percent) / 100 * len + 'px',
      transition         : 'stroke-dashoffset 0.3s ease 0s, stroke 0.3s ease'
    };
  }

  writeValue(value: number): void {
    this._percent = value;
    // if (this._percent === 100) {
    //   this.status = 'success';
    // } else {
    //   this.status = this._rawStatus;
    // }
    if (this.type === 'circle') {
      this.updateCircleStatus();
    }
  }

  registerOnChange(fn: (_: any) => {}): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => {}): void {
    this.onTouched = fn;
  }

  ngOnInit() {
    this._rawStatus = this.status;
  }
}
