/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { coerceNumberProperty } from '@angular/cdk/coercion';
import {
  ChangeDetectorRef,
  Component,
  ContentChildren,
  Input,
  QueryList,
  TemplateRef
} from '@angular/core';
import { DescListItemComponent } from './desc-list-item.component';

@Component({
  selector: 'tri-desc-list',
  template: `
    <div *ngIf="_title || _titleTpl" class="tri-desc-list-title">
      <ng-container *ngIf="_title; else _titleTpl">{{_title}}</ng-container>
    </div>
    <div tri-row [gutter]="gutter">
      <div tri-col [xs]="_xs" [sm]="_sm" [md]="_md" *ngFor="let i of _items">
        <ng-template [ngTemplateOutlet]="i.tpl"></ng-template>
      </div>
    </div>
  `,
  host    : {
    '[class.tri-desc-list]': 'true',
    '[class.tri-desc-list-horizontal]': 'layout === "horizontal"',
    '[class.tri-desc-list-vertical]': 'layout === "vertical"',
    '[class.tri-desc-list-small]': 'size === "small"',
    '[class.tri-desc-list-large]': 'size === "large"',
  }
})
export class DescListComponent {

  // region fields
  _xs = 24;
  _sm = 12;
  _md = 8;
  _titleTpl: TemplateRef<any>;
  @Input() layout: 'horizontal' | 'vertical' = 'horizontal';
  @ContentChildren(DescListItemComponent) _items: QueryList<DescListItemComponent>;

  // endregion
  constructor(private cdRef: ChangeDetectorRef) {
  }

  private _col = 3;

  /** 指定信息最多分几列展示，最终一行几列由 col 配置结合响应式规则决定 */
  @Input()
  get col() {
    return this._col;
  }

  set col(value: any) {
    this._col = coerceNumberProperty(value);
    this.setResponsive(this._col);
    this.cdRef.markForCheck();
  }

  private _size: 'small' | 'large';

  @Input()
  get size() {
    return this._size;
  }

  set size(value) {
    this._size = value;
    this.cdRef.markForCheck();
  }

  _title = '';

  @Input()
  set title(value: string | TemplateRef<any>) {
    if (value instanceof TemplateRef) {
      this._titleTpl = value;
    } else {
      this._title = value;
    }
    this.cdRef.markForCheck();
  }

  private _gutter = 32;

  /** 列表项间距，单位为 `px` */
  @Input()
  get gutter() {
    return this._gutter;
  }

  set gutter(value: any) {
    this._gutter = coerceNumberProperty(value);
    this.cdRef.markForCheck();
  }

  setResponsive(col) {
    const responsive = ({
      1: {xs: 24},
      2: {xs: 24, sm: 12},
      3: {xs: 24, sm: 12, md: 8},
      4: {xs: 24, sm: 12, md: 6},
      6: {xs: 24, sm: 12, md: 4},
    })[col > 4 && col != 6 ? 4 : col];

    this._xs = responsive.xs;
    this._sm = responsive.sm;
    this._md = responsive.md;
  }
}
