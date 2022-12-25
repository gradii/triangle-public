/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { animate, style, transition, trigger } from '@angular/animations';
import {
  Component,
  ContentChild,
  EventEmitter,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  Output,
  TemplateRef,
  ViewEncapsulation
} from '@angular/core';
import { ScrollService } from '@gradii/triangle/core';

import { fromEvent, Subscription } from 'rxjs';
import { distinctUntilChanged, throttleTime } from 'rxjs/operators';

@Component({
  selector     : 'tri-back-top',
  encapsulation: ViewEncapsulation.None,
  animations   : [
    trigger('enterLeave', [
      transition(':enter', [style({opacity: 0}), animate(300, style({opacity: 1}))]),
      transition(':leave', [style({opacity: 1}), animate(300, style({opacity: 0}))])
    ])
  ],
  template     : `
    <div class="tri-back-top" (click)="clickBackTop()" [@enterLeave] *ngIf="_display">
      <ng-template #defaultContent>
        <div class="tri-back-top-content"><i class="anticon anticon-to-top tri-back-top-icon"></i></div>
      </ng-template>
      <ng-template [ngTemplateOutlet]="contentTemplate || defaultContent"></ng-template>
    </div>
  `
})
export class BackTopComponent implements OnInit, OnDestroy {
  _display: boolean = false;
  /**
   * Custom content, show example
   * 自定义内容，见示例
   */
  @ContentChild('contentTemplate', {static: false}) contentTemplate: TemplateRef<any>;
  /**
   * The scroll height arrive this then visible
   * 滚动高度达到此参数值才出现  `tri-back-top`
   */
  @Input() visibilityHeight: number = 400;
  @Output() clickEvent: EventEmitter<boolean> = new EventEmitter();
  private scroll$: Subscription = null;

  constructor(private scrollSrv: ScrollService, private _ngZone: NgZone) {
  }

  private _target: HTMLElement = null;

  /**
   * Set a target element for listening
   * 设置需要监听其滚动事件的元素，值为一个返回对应 DOM 元素的函数
   * @param  el
   */
  @Input()
  set target(el: HTMLElement) {
    this._target = el;
    this.registerScrollEvent();
  }

  ngOnInit(): void {
    if (!this.scroll$) {
      this.registerScrollEvent();
    }
  }

  clickBackTop() {
    this.scrollSrv.scrollTo(this.getTarget(), 0);
    this.clickEvent.emit(true);
  }

  ngOnDestroy(): void {
    if (this.scroll$) {
      this.scroll$.unsubscribe();
    }
  }

  private getTarget() {
    return this._target || window;
  }

  private handleScroll() {
    this._display = this.scrollSrv.getScroll(this.getTarget()) > this.visibilityHeight;
  }

  private registerScrollEvent() {
    this.handleScroll();
    this._ngZone.runOutsideAngular(() => {
      this.scroll$ = fromEvent(this.getTarget(), 'scroll')
        .pipe(throttleTime(50), distinctUntilChanged())
        .subscribe(e => {
          this._ngZone.run(() => {
            this.handleScroll();
          });
        });
    });
  }
}
