/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { animate, style, transition, trigger } from '@angular/animations';
import {
  Component,
  ContentChild,
  ContentChildren,
  HostBinding,
  Input,
  OnInit,
  TemplateRef,
  ViewEncapsulation
} from '@angular/core';

@Component({
  selector: 'tri-badge',
  encapsulation: ViewEncapsulation.None,
  animations: [
    trigger('enterLeave', [
      transition('void => *', [style({ opacity: 0 }), animate('0.3s cubic-bezier(0.12, 0.4, 0.29, 1.46)')]),
      transition('* => void', [style({ opacity: 1 }), animate('0.3s cubic-bezier(0.12, 0.4, 0.29, 1.46)')])
    ])
  ],
  template: `
    <ng-content></ng-content>
    <span class="tri-badge-status-dot tri-badge-status-{{status}}" *ngIf="status"></span>
    <span class="tri-badge-status-text" *ngIf="badgeText">{{badgeText}}</span>
    <sup [@enterLeave]
         [ngStyle]="badgeStyle"
         *ngIf="(isDot)||(count>0)||((count==0)&&showZero)"
         data-show="true"
         class="tri-scroll-number"
         [class.tri-badge-count]="!isDot"
         [class.tri-badge-dot]="isDot">
      <ng-template ngFor
                   [ngForOf]="maxNumberArray"
                   let-number
                   let-i="index">
        <span *ngIf="count <= overflowCount"
              class="tri-scroll-number-only"
              [style.transform]="'translateY('+((-countArray[i]*100))+'%)'">
        <ng-template [ngIf]="(!isDot)&&(countArray[i]!=null)">
          <p *ngFor="let p of countSingleArray"
             [class.current]="p==countArray[i]">{{p}}</p>
        </ng-template>
        </span>
      </ng-template>
      <ng-template [ngIf]="count > overflowCount">{{overflowCount}}+</ng-template>
    </sup>
  `,
  host: {
    'class': 'tri-badge',
    '[class.tri-badge-status]': 'status',
  },
  styleUrls: ['../style/badge.scss']
})
export class BadgeComponent implements OnInit {
  maxNumberArray: any[];
  countArray: any[] = [];
  countSingleArray = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

  /**
   * Show the over flow count
   * 展示封顶的数字值
   */
  @Input() overflowCount = 99;
  /**
   * Don't show number, only there are red dot
   * 不展示数字，只有一个小红点
   */
  @Input() isDot = false;
  /**
   * 在设置了  `nzStatus` 的前提下有效，设置状态点的文本
   */
  @Input() badgeText: string;
  /**
   * Custom style
   * 自定义样式
   */
  @Input() badgeStyle: any;
  /**
   * Set badge status
   * 设置 Badge 为状态点
   */
  @Input()
  status: string;

  constructor() {
  }

  _showZero = false;

  get showZero() {
    return this._showZero;
  }

  /**
   * whether show badge, When value is zero, show badge
   * 当添加该属性时，当数值为 0 时，展示 Badge
   * @param  value
   */
  @Input()
  set showZero(value: boolean) {
    this._showZero = value as boolean;
  }

  _count: number;

  /**
   * Get the count
   * 获取展示的数字
   */
  get count() {
    return this._count;
  }

  /**
   * Set show count, over overflowCount then display as `overflowCount+`, if zero then hidden
   * 设置展示的数字，大于 overflowCount 时显示为  `overflowCount+` 为 0 时隐藏
   * @param  value
   */
  @Input()
  set count(value: number) {
    if (value < 0) {
      this._count = 0;
    } else {
      this._count = value;
    }
    this.countArray = this._count.toString().split('');
  }

  ngOnInit() {
    this.maxNumberArray = this.overflowCount.toString().split('');
  }
}
