/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewEncapsulation
} from '@angular/core';
import { clamp, coerceToBoolean, isInfinite } from '@gradii/triangle/util';
import { PageChangeEvent } from './event/page-change.event';

@Component({
  selector       : 'tri-pagination',
  encapsulation  : ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template       : `
    <ul class="tri-pagination tri-pagination-simple" *ngIf="simple">
      <li
        i18n-title="@@pagination.prev_page"
        [attr.title]="'Pagination.prev_page'|triI18n"
        class="tri-pagination-prev"
        (click)="_jumpRelative(-1)"
        [class.tri-pagination-disabled]="_isFirstIndex">
        <a>
          <tri-icon svgIcon="outline:left"></tri-icon>
        </a>
      </li>
      <li [attr.title]="pageIndex+'/'+_lastIndex" class="tri-pagination-simple-pager">
        <input [ngModel]="pageIndex" (ngModelChange)="_pageIndexChange($event)" size="3">
        <div style="display: inline-block" *ngIf="!isInfinite(_lastIndex)"><span
          class="tri-pagination-slash">／</span>{{_lastIndex}} </div>
      </li>
      <li
        [attr.title]="'Pagination.next_page'|triI18n"
        class="tri-pagination-next"
        (click)="_jumpRelative(+1)"
        [class.tri-pagination-disabled]="_isLastIndex">
        <a>
          <tri-icon svgIcon="outline:right"></tri-icon>
        </a>
      </li>
    </ul>
    <ul *ngIf="!simple" class="tri-pagination" [class.mini]="size=='small'">
      <span class="tri-pagination-total-text" *ngIf="showTotal">共 {{_total}} 条</span>
      <li
        [attr.title]="'Pagination.prev_page'|triI18n"
        class="tri-pagination-prev"
        (click)="_jumpRelative(-1)"
        [class.tri-pagination-disabled]="_isFirstIndex">
        <a>
          <tri-icon svgIcon="outline:left"></tri-icon>
        </a>
      </li>
      <li
        [attr.title]="_firstIndex"
        class="tri-pagination-item"
        (click)="_jumpPage(_firstIndex)"
        [class.tri-pagination-item-active]="_isFirstIndex">
        <a>{{_firstIndex}}</a>
      </li>
      <li
        [attr.title]="'Pagination.prev_5'|triI18n"
        (click)="_jumpRelative(-5)"
        class="tri-pagination-jump-prev"
        *ngIf="(_lastIndex >9)&&(pageIndex-3>_firstIndex)">
        <a></a>
      </li>
      <li
        *ngFor="let page of _buildIndexes()"
        [attr.title]="page.index"
        class="tri-pagination-item"
        (click)="_jumpPage(page.index)"
        [class.tri-pagination-item-active]="pageIndex==page.index">
        <a>{{page.index}}</a>
      </li>
      <li
        [attr.title]="'Pagination.next_5'|triI18n"
        (click)="_jumpRelative(+5)"
        class="tri-pagination-jump-next"
        *ngIf="(_lastIndex >9)&&(pageIndex+3<_lastIndex)">
        <a></a>
      </li>
      <li
        [attr.title]="_lastIndex"
        class="tri-pagination-item"
        (click)="_jumpPage(_lastIndex)"
        *ngIf="(_lastIndex>0)&&(_lastIndex!==_firstIndex)&&!isInfinite(_lastIndex)"
        [class.tri-pagination-item-active]="_isLastIndex">
        <a>{{_lastIndex}}</a>
      </li>
      <li
        [attr.title]="'Pagination.next_page'|triI18n"
        class="tri-pagination-next"
        (click)="_jumpPage(pageIndex+1)"
        [class.tri-pagination-disabled]="_isLastIndex">
        <a>
          <tri-icon svgIcon="outline:right"></tri-icon>
        </a>
      </li>
      <div class="tri-pagination-options">
        <tri-select
          *ngIf="_showSizeChanger"
          [size]="size=='small'?'small':'default'"
          class="tri-pagination-options-size-changer"
          [ngModel]="pageSize"
          (ngModelChange)="_pageSizeChange($event)">
          <tri-option
            *ngFor="let option of _options"
            [value]="option">
            {{option+ '条/页'}}
          </tri-option>
          <tri-option
            *ngIf="_options.indexOf(_pageSize)==-1"
            [value]="_pageSize">
            {{_pageSize + '条/页'}}
          </tri-option>
        </tri-select>
        <div class="tri-pagination-options-quick-jumper"
             *ngIf="showQuickJumper">
          {{'Pagination.jump_to'|triI18n}}
          <input [ngModel]="pageIndex"
                 (ngModelChange)="_pageIndexChange($event)">
          {{'Pagination.page'|triI18n}}
        </div>
      </div>
    </ul>`,
  styleUrls      : ['../style/pagination.scss']
})
export class PaginationComponent {
  _firstIndex = 1;
  _lastIndex = Infinity;
  _options = [10, 20, 30, 40, 50];
  _offset: number = 0;
  /**
   * When [small], show small size pagination
   * 当为「small」时，是小尺寸分页
   */
  @Input() size: string;
  @Output() pageChange: EventEmitter<PageChangeEvent> = new EventEmitter();

  constructor(private _cdr: ChangeDetectorRef) {
  }

  _total: number = Infinity;

  /**
   * Get total count
   * 获取总条数
   */
  @Input()
  get total(): number {
    return this._total;
  }

  /**
   * Set total count
   * 设置总条数
   * @param  value
   */
  set total(value: number) {
    if (value === this._total) {
      return;
    }
    this._total = value;
    this._cdr.markForCheck();
  }

  _showSizeChanger = false;

  /**
   * Get show size changer
   * 获取是否可以改变pageSize
   */
  get showSizeChanger() {
    return this._showSizeChanger;
  }

  /**
   * Whether can change pageSize, when add this property the page will change dropdown menu
   * 是否可以改变 pageSize，当添加该属性时显示页面改变下拉菜单
   * @param  value
   */
  @Input()
  set showSizeChanger(value: boolean) {
    this._showSizeChanger = coerceToBoolean(value);
  }

  _showQuickJumper = false;

  /**
   * Get whether can quick jump to some page
   * 获取是否可以快速跳转至某页
   */
  get showQuickJumper() {
    return this._showQuickJumper;
  }

  /**
   * Set whether can quick jump to some page, when add this property show quick jumper
   * 设置是否可以快速跳转至某页，当添加该属性时显示快速跳转
   * @param  value
   */
  @Input()
  set showQuickJumper(value: boolean) {
    this._showQuickJumper = coerceToBoolean(value);
  }

  _showTotal = false;

  /**
   * Get show total count data
   * 获取显示总共有多少条数据
   */
  get showTotal() {
    return this._showTotal && !isInfinite(this._total);
  }

  /**
   * Set this property then show total count data
   * 当添加该属性时，显示总共有多少条数据
   * @param  value
   */
  @Input()
  set showTotal(value: boolean) {
    this._showTotal = coerceToBoolean(value);
  }

  _simple = false;

  /**
   * Get whether simple pagination
   * 获取是否简单分页
   */
  get simple() {
    return this._simple;
  }

  /**
   * Set this property, show as simple pagination
   * 当添加该属性时，显示为简单分页
   * @param  value
   */
  @Input()
  set simple(value: boolean) {
    this._simple = coerceToBoolean(value);
  }

  _pageIndex = 1;

  /**
   * Get current page index
   * 获取当前页数
   */
  get pageIndex(): number {
    return this._pageIndex;
  }

  /**
   * Set current page index
   * 设置当前分页
   * @param  value
   */
  @Input()
  set pageIndex(value: number) {
    value = Math.round(clamp(value, this._firstIndex, this._lastIndex));
    if (this._pageIndex !== value) {
      // write into _current cache
      this._pageIndex = value;

      this._buildOffset();
      this._cdr.markForCheck();
    }
  }

  _pageSize: number = 10;

  /**
   * Get page size
   * 获取分页每页条数
   */
  @Input()
  get pageSize() {
    return this._pageSize;
  }

  /**
   * Set page size
   * 设置分页条数
   * @param  value
   */
  set pageSize(value: number) {
    value = Math.round(value);
    if (value > 0 && value !== this._pageSize) {
      this._pageSize = value;
      this._buildPageIndex(); // auto change page index
      // esle this._buildOffset();
      this._cdr.markForCheck();
    }
  }

  get _isLastIndex() {
    return this.pageIndex === this._lastIndex;
  }

  get _isFirstIndex() {
    return this.pageIndex === this._firstIndex;
  }

  isInfinite(n: number) {
    return isInfinite(n);
  }

  _jumpRelative(relative: number) {
    this._jumpPage(this.pageIndex + relative);
  }

  _pageSizeChange($event: number) {
    this.pageSize = $event;
    this.pageChange.emit(this.pageEventData());
  }

  _pageIndexChange($event: number) {
    this.pageIndex = $event;
    this.pageChange.emit(this.pageEventData());
  }

  _buildPageIndex() {
    this._pageIndex = clamp(Math.round(this._offset / this._pageSize) + 1, this._firstIndex, this._lastIndex);
  }

  _buildOffset() {
    if (isFinite(this.pageSize)) {
      this._offset = (this._pageIndex - 1) * this.pageSize;
    } else {
      this._offset = 0;
    }
  }

  /** generate indexes list */
  _buildIndexes() {
    this._lastIndex = Math.ceil(this._total / this._pageSize);

    const tmpPages = [];
    if (this._lastIndex <= 9) {
      for (let i = 2; i <= this._lastIndex - 1; i++) {
        tmpPages.push({index: i});
      }
    } else {
      const current = this._pageIndex;
      let left = Math.max(2, current - 2);
      let right = Math.min(current + 2, this._lastIndex - 1);
      if (current - 1 <= 2) {
        right = 5;
      }
      if (this._lastIndex - current <= 2) {
        left = this._lastIndex - 4;
      }
      for (let i = left; i <= right; i++) {
        tmpPages.push({index: i});
      }
    }

    return tmpPages;
  }

  _jumpPage(index: number) {
    const _prevIndex = this.pageIndex;
    this.pageIndex = clamp(index, this._firstIndex, this._lastIndex);

    if (_prevIndex === this.pageIndex) {
      return;
    }
    this.pageChange.emit(this.pageEventData());
  }

  pageEventData() {
    return {
      skip     : (this._pageIndex - 1) * this._pageSize,
      take     : this.pageSize,
      pageIndex: this.pageIndex,
      pageSize : this.pageSize,
      total    : this.total
    };
  }
}
