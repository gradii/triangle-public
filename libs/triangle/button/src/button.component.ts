/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';
import {
  AfterContentInit, ChangeDetectionStrategy, Component, ElementRef, Input, Renderer2,
  ViewEncapsulation, ╔ÁmarkDirty
} from '@angular/core';

export type ButtonVariant = 'raised' | 'outlined' | 'dashed' | 'default' | 'rounded' | 'text';

export type ButtonColor =
  'primary'
  | 'secondary'
  | 'success'
  | 'info'
  | 'warning'
  | 'danger'
  | 'default';
export type ButtonShape = 'square' | 'circle' | null;
export type ButtonSize = 'xlarge' | 'xl' |
  'large' | 'lg' |
  'default' |
  'small' | 'sm' |
  'xsmall' | 'xs';

@Component({
  selector       : '[triButton], [tri-button]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation  : ViewEncapsulation.None,
  template       : `
    <tri-icon class="tri-icon-spin" svgIcon="outline:loading" *ngIf="loading"></tri-icon>
    <ng-content *ngIf="!iconOnly || iconOnly&&!loading"></ng-content>
  `,
  styleUrls      : ['../style/button.scss'],
  host           : {
    'class'                           : 'tri-btn',
    '[class.tri-btn-raised]'          : '_variant==="raised"',
    '[class.tri-btn-rounded]'         : '_variant==="rounded"',
    '[class.tri-btn-text]'            : '_variant==="text"',
    '[class.tri-btn-outlined]'        : '_variant==="outlined" || _variant==="dashed"',
    '[class.tri-btn-dashed]'          : '_variant==="dashed"',
    '[class.tri-btn-icon-only]'       : '_iconOnly',
    '[class.tri-btn-primary]'         : '_color === "primary"',
    '[class.tri-btn-secondary]'       : '_color === "secondary"',
    '[class.tri-btn-success]'         : '_color === "success"',
    '[class.tri-btn-info]'            : '_color === "info"',
    '[class.tri-btn-warning]'         : '_color === "warning"',
    '[class.tri-btn-danger]'          : '_color === "danger"',
    '[class.tri-btn-circle]'          : '_shape === "circle"',
    '[class.tri-btn-square]'          : '_shape === "square"',
    '[class.tri-btn-xl]'              : '_size === "xlarge" || _size === "xl"',
    '[class.tri-btn-lg]'              : '_size === "large" || _size === "lg"',
    '[class.tri-btn-sm]'              : '_size === "small" || _size === "sm"',
    '[class.tri-btn-xs]'              : '_size === "xsmall" || _size === "xs"',
    '[class.tri-btn-loading]'         : '_loading',
    '[class.tri-btn-ghost]'           : '_ghost',
    '[class.tri-btn-background-ghost]': '_ghost'
  }
})
export class ButtonComponent implements AfterContentInit {

  _el: HTMLElement;
  nativeElement: HTMLElement;
  _iconElement: HTMLElement;

  _variant: ButtonVariant = 'default';

  @Input()
  get variant() {
    return this._variant;
  }

  set variant(value: ButtonVariant) {
    this._variant = value;
  }

  _iconOnly = false;

  @Input()
  get iconOnly(): boolean {
    return this._iconOnly;
  }

  set iconOnly(value: boolean) {
    this._iconOnly = coerceBooleanProperty(value);
  }

  _color: ButtonColor;

  @Input()
  get color(): ButtonColor {
    return this._color;
  }

  set color(value: ButtonColor) {
    this._color = value;
  }

  _shape: ButtonShape;

  /**
   * Get shape of button
   * ŠîëÚĺ«ňŻóšŐÂ
   */
  @Input()
  get shape(): ButtonShape {
    return this._shape;
  }

  /**
   * Set shape of button
   * Ŕ«żšŻ«ŠîëÚĺ«ňŻóšŐÂ´╝îňĆ»ÚÇëňÇ╝ńŞ║  `circle`  ŠłľŔÇůńŞŹŔ«ż
   * @param  value
   */
  set shape(value: ButtonShape) {
    this._shape = value;
  }

  _size: ButtonSize;

  /**
   * Get button size
   * ŠîëÚĺ«ňĄžň░Ć
   */
  @Input()
  get size(): ButtonSize {
    return this._size;
  }

  set size(value: ButtonSize) {
    this._size = value;
  }

  _loading = false;

  /**
   * Get whether loading
   * ŠîëÚĺ«ŔŻŻňůąšŐÂŠÇü
   */
  get loading(): boolean {
    return this._loading;
  }

  /**
   * Set button size, Optional: `small`, `large`, `null`
   * Ŕ«żšŻ«ŠîëÚĺ«ňĄžň░Ć´╝îňĆ»ÚÇëňÇ╝ńŞ║  `small`   `large`  ŠłľŔÇůńŞŹŔ«ż
   * @param  value
   */

  /**
   * Set whether loading
   * Ŕ«żšŻ«ŠîëÚĺ«ŔŻŻňůąšŐÂŠÇü
   * @param  value
   */
  @Input()
  set loading(value: boolean) {
    this._loading = coerceBooleanProperty(value);
  }

  _ghost = false;

  /**
   * Get ghost
   * ŔÄĚňĆľň╣ŻšüÁŠîëÚĺ«
   */
  @Input()
  get ghost(): boolean {
    return this._ghost;
  }

  /**
   * Set Ghost
   * Ŕ«żšŻ«ň╣ŻšüÁŠîëÚĺ«
   * @param  value
   */
  set ghost(value: boolean) {
    this._ghost = coerceBooleanProperty(value);
  }


  get _innerIconElement() {
    return this._el.querySelector(':scope > .tri-icon') as HTMLElement;
  }

  constructor(private _elementRef: ElementRef) {
    this._el = this._elementRef.nativeElement;
  }

  ngAfterContentInit() {
    this._iconElement = this._innerIconElement;
    /** check if host children only has i element */
    if (this._iconElement && this._el.children.length === 1) {
      this._iconOnly = true;
    }
  }

  static ngAcceptInputType_variant: ButtonVariant | keyof ButtonVariant | string;
  static ngAcceptInputType_color: ButtonColor | keyof ButtonColor | string;
  static ngAcceptInputType_size: ButtonSize | keyof ButtonSize | string;
  static ngAcceptInputType_ghost: BooleanInput;
  static ngAcceptInputType_loading: BooleanInput;
  static ngAcceptInputType_iconOnly: BooleanInput;
}
