/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { NumberInput } from '@angular/cdk/coercion';
import {
  Directive,
  ElementRef,
  Host,
  HostBinding,
  Input,
  OnChanges,
  OnInit,
  Optional,
  Renderer2,
  SimpleChange
} from '@angular/core';
import { RowDirective } from './row.directive';

export abstract class EmbeddedProperty {
  span: number;
  pull: number;
  push: number;
  offset: number;
  order: number;
}

@Directive({
  selector: '[triCol], [tri-col], tri-col'
})
export class ColDirective implements OnInit, OnChanges {
  _classList: Array<string> = [];
  _el: HTMLElement;

  // _prefixCls                = 'ant-col';
  /**
   * The span of the grid, when set to `0` it means that `display:none`
   * 栅格占位格数，为 0 时相当于  `display: none`
   */
  @Input() span: number;
  /**
   * The order of the grid, valid in flex layout
   * 栅格顺序， `flex`  布局模式下有效
   */
  @Input() order: number;
  /**
   * The offset of grid
   * 栅格左侧的间隔格数，间隔内不可以有栅格
   */
  @Input() offset: number;
  /**
   * Right offset of the grid number
   * 栅格向右移动格数
   */
  @Input() push: number;
  /**
   * Left offset of the grid number
   * 栅格向左移动格数
   */
  @Input() pull: number;
  /**
   * `<768px` the responsive grid, can set number or `EmbeddedProperty`
   * `<768px` 响应式栅格，可为栅格数或一个包含其他属性的对象
   */
  @Input() xs: number | EmbeddedProperty;
  /**
   * `>=768px` the responsive grid, can set number or `EmbeddedProperty`
   * `>=768px` 响应式栅格，可为栅格数或一个包含其他属性的对象
   */
  @Input() sm: number | EmbeddedProperty;
  /**
   * `>=992px` the responsive grid, can set number or `EmbeddedProperty`
   * `>=992px` 响应式栅格，可为栅格数或一个包含其他属性的对象
   */
  @Input() md: number | EmbeddedProperty;
  /**
   * `>=1200px` the responsive grid, can set number or `EmbeddedProperty`
   * `>=1200px` 响应式栅格，可为栅格数或一个包含其他属性的对象
   */
  @Input() lg: number | EmbeddedProperty;
  /**
   * `>=1600px` the responsive grid, can set number or `EmbeddedProperty`
   * `>=1600px` 响应式栅格，可为栅格数或一个包含其他属性的对象
   */
  @Input() xl: number | EmbeddedProperty;
  @Input() xXl: number | EmbeddedProperty;

  constructor(private _elementRef: ElementRef,
              @Optional()
              @Host()
              public _row: RowDirective,
              private _renderer: Renderer2) {
    this._el = this._elementRef.nativeElement;
  }

  @HostBinding('style.padding-left.px')
  get paddingLeft() {
    return this._row && this._row._gutter / 2;
  }

  @HostBinding('style.padding-right.px')
  get paddingRight() {
    return this._row && this._row._gutter / 2;
  }

  /**
   * temp solution since no method add classMap to host https://github.com/angular/angular/issues/7289
   */
  setClassMap(): void {
    this._classList.forEach(_className => {
      this._renderer.removeClass(this._el, _className);
    });
    this._classList = [
      this.span && `tri-col-${this.span}`,
      this.order && `tri-col-order-${this.order}`,
      this.offset && `tri-col-offset-${this.offset}`,
      this.pull && `tri-col-pull-${this.pull}`,
      this.push && `tri-col-push-${this.push}`,
      ...this.generateClass()
    ];
    this._classList = this._classList.filter(item => {
      return !!item;
    });
    this._classList.forEach(_className => {
      this._renderer.addClass(this._el, _className);
    });
  }

  generateClass() {
    const listOfSizeInputName = ['xs', 'sm', 'md', 'lg', 'xl'];
    const listOfClassName: string[] = [];
    listOfSizeInputName.forEach(name => {
      const sizeName = name.toLowerCase();
      const field = Reflect.get(this, name);

      if (typeof field === 'number' || typeof field === 'string') {
        listOfClassName.push(field && `tri-col-${sizeName}-${field}`);
      } else {
        listOfClassName.push(field && field['span'] && `tri-col-${sizeName}-${field['span']}`);
        listOfClassName.push(field && field['pull'] && `tri-col-${sizeName}-pull-${field['pull']}`);
        listOfClassName.push(field && field['push'] && `tri-col-${sizeName}-push-${field['push']}`);
        listOfClassName.push(
          field && field['offset'] && `tri-col-${sizeName}-offset-${field['offset']}`
        );
        listOfClassName.push(field && field['order'] && `tri-col-${sizeName}-order-${field['order']}`);
      }
    });
    return listOfClassName;
  }

  ngOnChanges(changes: { [propertyName: string]: SimpleChange }) {
    this.setClassMap();
  }

  ngOnInit(): any {
    this.setClassMap();
  }

  static ngAcceptInputType_span: NumberInput;
  static ngAcceptInputType_order: NumberInput;
  static ngAcceptInputType_offset: NumberInput;
  static ngAcceptInputType_push: NumberInput;
  static ngAcceptInputType_pull: NumberInput;
  static ngAcceptInputType_xs: NumberInput;
  static ngAcceptInputType_sm: NumberInput;
  static ngAcceptInputType_md: NumberInput;
  static ngAcceptInputType_lg: NumberInput;
  static ngAcceptInputType_xl: NumberInput;
  static ngAcceptInputType_xXl: NumberInput;

}
