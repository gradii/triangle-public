/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import {
  AfterViewInit,
  Component,
  ContentChild,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  Renderer2,
  TemplateRef,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { Subscription } from 'rxjs';
import { StepConnectService } from './step-connect.service';

@Component({
  selector     : 'tri-step',
  encapsulation: ViewEncapsulation.None,
  template     : `
    <div class="tri-steps-tail" #stepsTail *ngIf="_last !== true">
      <i></i>
      <span class="tri-steps-tail-tip" *ngIf="tailTip">{{tailTip}}</span>
    </div>
    <div class="tri-steps-step">
      <div class="tri-steps-head">
        <div class="tri-steps-head-inner">
          <ng-template [ngIf]="!_processDot">
                      <span class="tri-steps-icon anticon anticon-check"
                            *ngIf="_status === 'finish' && !iconTemplate"></span>
            <span class="tri-steps-icon anticon anticon-cross"
                  *ngIf="_status === 'error' && !iconTemplate"></span>
            <span class="tri-steps-icon"
                  *ngIf="(_status === 'process' || _status === 'wait') && !iconTemplate">{{index + 1}}</span>
            <span class="tri-steps-icon" *ngIf="iconTemplate">
              <ng-template [ngTemplateOutlet]="iconTemplate"></ng-template>
            </span>
          </ng-template>
          <ng-template [ngIf]="_processDot">
            <span class="tri-steps-icon">
              <span class="tri-steps-icon-dot"></span>
            </span>
          </ng-template>
        </div>
      </div>
      <div class="tri-steps-main">
        <div class="tri-steps-title">{{title}}</div>
        <div class="tri-steps-description">
          {{description}}
          <ng-template [ngTemplateOutlet]="descriptionTemplate"></ng-template>
        </div>
      </div>
    </div>
  `,
  styleUrls: [`../style/steps.scss`],
  styles: [`
             .tri-steps-horizontal tri-step:not(:first-child) .tri-steps-head {
               padding-left : 10px;
               margin-left  : -10px;
             }

             tri-step {
               display : block;
             }
           `]
})
export class StepComponent implements OnInit, AfterViewInit, OnDestroy {
  _ifCustomStatus = false;
  _currentIndex: number;
  _el: any;
  _last = false;
  _processDot = false;
  _direction = 'horizontal';
  _processDotEventSubscription: Subscription;
  _directionEventSubscription: Subscription;
  _currentEventSubscription: Subscription;
  _errorIndexObjectSubscription: Subscription;
  stepStatusClass: any;
  @ContentChild('iconTemplate', {static: false}) iconTemplate: TemplateRef<any>;
  @ViewChild('stepsTail', {static: false}) _stepsTail: ElementRef;
  @Input()
  index: number;
  /**
   * Title
   * 标题
   */
  @Input() title: string;
  /**
   * Description
   * 描述
   */
  @Input() description: string;
  @ContentChild('descriptionTemplate', {read: TemplateRef, static: false})
  descriptionTemplate: TemplateRef<void>;
  @Input() tailTip: string;

  constructor(private erf: ElementRef,
              private stepConnectService: StepConnectService,
              private _renderer: Renderer2) {
    this._el = erf.nativeElement;
  }

  _status = 'wait';

  /**
   * Get current step status
   * 获取当前步骤状态
   */
  get status() {
    return this._status;
  }

  /**
   * Specify current step status, optional: `wait`   `process`   `finish`   `error`
   * 设置当前步骤的状态，可选: `wait`   `process`   `finish`   `error`
   * @param status
   */
  @Input()
  set status(status) {
    this._status = status;
    this._ifCustomStatus = true;
  }

  get _current() {
    return this._currentIndex;
  }

  set _current(current) {
    this._currentIndex = current;
    if (!this._ifCustomStatus) {
      if (current > this.index) {
        this._status = 'finish';
      } else if (current === this.index) {
        if (this.stepConnectService.errorIndex) {
          this._status = 'error';
        } else {
          this._status = 'process';
        }
      } else {
        this._status = 'wait';
      }
    }
    this.initClassMap();
  }

  initClassMap() {
    this.stepStatusClass = {
      ['tri-steps-item']          : true,
      [`tri-steps-status-wait`]   : this._status === 'wait',
      [`tri-steps-status-process`]: this._status === 'process',
      [`tri-steps-status-finish`] : this._status === 'finish',
      [`tri-steps-status-error`]  : this._status === 'error',
      ['tri-steps-item-last']     : this._last,
      ['tri-steps-custom']        : !!this.iconTemplate,
      ['tri-steps-next-error']    : this.stepConnectService.errorIndex === 'error' && this._current === this.index - 1
    };
    for (const i in this.stepStatusClass) {
      if (this.stepStatusClass[i]) {
        this._renderer.addClass(this._el, i);
      } else {
        this._renderer.removeClass(this._el, i);
      }
    }
  }

  init() {
    // 记录个数
    // this.index = this.stepConnectService.itemIndex;
    this._processDot = this.stepConnectService.processDot;
    this._direction = this.stepConnectService.direction;
    this._current = this.stepConnectService.current;
    this._processDotEventSubscription = this.stepConnectService.processDotEvent.subscribe((data: any) => {
      this._processDot = data;
    });
    this._directionEventSubscription = this.stepConnectService.directionEvent.subscribe((data: any) => {
      this._direction = data;
    });
    this._currentEventSubscription = this.stepConnectService.currentEvent.subscribe((data: any) => {
      this._current = data;
    });
    this._errorIndexObjectSubscription = this.stepConnectService.errorIndexObject.subscribe((data: any) => {
      if (this._current === this.index) {
        this._status = data;
      }
    });
    this.initClassMap();
    // this.stepConnectService.itemIndex += 1;
    /** judge if last step */
    if (!this.erf.nativeElement.nextElementSibling) {
      this._last = true;
    } /*else {
      this.stepConnectService.lastElementSizeEvent.subscribe(data => {
        const {count, width} = data;
        this._renderer.setStyle(this.erf.nativeElement, 'width', 100 / (count - 1) + '%');
        this._renderer.setStyle(this.erf.nativeElement, 'margin-right', -(width / (count - 1) + 5) + 'px');
        if (this._direction === 'horizontal') {
          this._renderer.setStyle(this._stepsTail.nativeElement, 'padding-right', width / (count - 1) + 5 + 'px');
        }
      });
    }*/
  }

  ngOnInit() {
    this.init();
  }

  ngAfterViewInit() {
    if (this._last) {
      setTimeout(() => {
        this.stepConnectService.lastElementSizeEvent.next({
          count: this.erf.nativeElement.parentElement.childElementCount,
          width: this.erf.nativeElement.firstElementChild.offsetWidth
        });
      });
    }
  }

  ngOnDestroy() {
    if (this._processDotEventSubscription) {
      this._processDotEventSubscription.unsubscribe();
    }
    if (this._directionEventSubscription) {
      this._directionEventSubscription.unsubscribe();
    }
    if (this._currentEventSubscription) {
      this._currentEventSubscription.unsubscribe();
    }
    if (this._errorIndexObjectSubscription) {
      this._errorIndexObjectSubscription.unsubscribe();
    }
  }
}
