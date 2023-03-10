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
   * ????????????????????????
   */
  @Input() overflowCount = 99;
  /**
   * Don't show number, only there are red dot
   * ???????????????????????????????????????
   */
  @Input() isDot = false;
  /**
   * ????????????  `nzStatus` ?????????????????????????????????????????????
   */
  @Input() badgeText: string;
  /**
   * Custom style
   * ???????????????
   */
  @Input() badgeStyle: any;
  /**
   * Set badge status
   * ?????? Badge ????????????
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
   * ???????????????????????????????????? 0 ???????????? Badge
   * @param  value
   */
  @Input()
  set showZero(value: boolean) {
    this._showZero = value as boolean;
  }

  _count: number;

  /**
   * Get the count
   * ?????????????????????
   */
  get count() {
    return this._count;
  }

  /**
   * Set show count, over overflowCount then display as `overflowCount+`, if zero then hidden
   * ?????????????????????????????? overflowCount ????????????  `overflowCount+` ??? 0 ?????????
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
