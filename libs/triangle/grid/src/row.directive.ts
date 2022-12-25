/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { NumberInput } from '@angular/cdk/coercion';
import { Directive, Input, OnInit } from '@angular/core';

export type TriJustify = 'start' | 'end' | 'center' | 'space-around' | 'space-between';
export type RowAlign = 'top' | 'middle' | 'bottom';

@Directive({
  selector: '[triRow], [tri-row], tri-row',
  host    : {
    'class'                             : 'tri-row-flex',
    '[class.tri-row-flex-top]'          : 'align=="top"',
    '[class.tri-row-flex-middle]'       : 'align=="middle"',
    '[class.tri-row-flex-bottom]'       : 'align=="bottom"',
    '[class.tri-row-flex-start]'        : 'justify=="start"',
    '[class.tri-row-flex-end]'          : 'justify=="end"',
    '[class.tri-row-flex-center]'       : 'justify=="center"',
    '[class.tri-row-flex-space-around]' : 'justify=="space-around"',
    '[class.tri-row-flex-space-between]': 'justify=="space-between"',
    '[style.margin-left.px]'            : '-_gutter/2',
    '[style.margin-right.px]'           : '-_gutter/2',
    '[style.gap.px]'                    : 'gap'
  }
})
export class RowDirective implements OnInit {
  _el: HTMLElement;

  constructor() {
  }

  @Input()
  gap: number;

  _gutter: number;

  /**
   * Get the size of the gutter.
   * 栅格间隔
   */
  @Input()
  get gutter(): number {
    return this._gutter;
  }

  /**
   * Set the size of the gutter
   * @param  value
   */
  set gutter(value: number) {
    this._gutter = +value;
  }

  _align: RowAlign = 'top';

  /**
   * Get the align in vertical layout
   * 获取 flex 布局下垂直对齐方式
   */
  get align(): RowAlign {
    return this._align;
  }

  /**
   * Set the align in vertical layout: `top`   `middle`   `bottom`
   * 设置 flex 布局下的垂直对齐方式： `top`   `middle`   `bottom`
   * @param  value
   */
  @Input()
  set align(value: RowAlign) {
    this._align = value;
  }

  _justify: TriJustify = 'start';

  /**
   * Get the align in horizontal layout
   * 获取 flex 布局下的水平排列方式
   */
  get justify(): TriJustify {
    return this._justify;
  }

  /**
   * Set the align in horizontal layout: `start`   `end`   `center`   `space-around`
   * 设置 flex 布局下的水平排列方式： `start`   `end`   `center`   `space-around`
   * @param  value
   */
  @Input()
  set justify(value: TriJustify) {
    this._justify = value;
  }

  ngOnInit() {
    // this.setClassMap();
  }

  static ngAcceptInputType_gutter: NumberInput;
  static ngAcceptInputType_gap: NumberInput;
}
