/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Directive, Host, Input, OnDestroy, OnInit, Self } from '@angular/core';
import { StepConnectService } from './step-connect.service';

export type Direction = 'horizontal' | 'vertical';

@Directive({
  selector : 'tri-steps',
  providers: [StepConnectService],
  host     : {
    '[class.tri-steps]'                 : 'true',
    '[class.tri-steps-horizontal]'      : 'direction==="horizontal"',
    '[class.tri-steps-vertical]'        : 'direction==="vertical"',
    '[class.tri-steps-label-horizontal]': 'direction==="horizontal"',
    '[class.tri-steps-label-vertical]'  : 'direction==="vertical"',
    '[class.tri-steps-dot]'             : 'progressDot',
    '[class.tri-steps-small]'           : 'size === "small"'
  }
})
export class StepsComponent implements OnInit, OnDestroy {
  @Input() size: 'default' | 'small';

  constructor(@Host() @Self() private stepConnectService: StepConnectService) {
  }

  _status: string;

  @Input()
  set status(status: string) {
    this._status = status;
    this.stepConnectService.errorIndex = this._status;
    this.stepConnectService.errorIndexObject.next(this._status);
  }

  _current: number;

  get current(): number {
    return this._current;
  }

  @Input()
  set current(current: number) {
    this._current = current;
    this.stepConnectService.current = current;
    this.stepConnectService.currentEvent.next(current);
  }

  _progressDot = false;

  get progressDot() {
    return this._progressDot;
  }

  @Input()
  set progressDot(value: boolean | string) {
    if (value === '') {
      this._progressDot = true;
    } else {
      this._progressDot = value as boolean;
    }
    this.stepConnectService.processDot = true;
    this.stepConnectService.processDotEvent.next(true);
  }

  _direction: Direction = 'horizontal';

  get direction(): Direction {
    return this._direction;
  }

  @Input()
  set direction(value: Direction) {
    this._direction = value;
    this.stepConnectService.direction = value;
    this.stepConnectService.directionEvent.next(value);
  }

  ngOnInit() {
    if (this._status) {
      this.stepConnectService.errorIndex = this._status;
      this.stepConnectService.errorIndexObject.next(this._status);
    }
  }

  ngOnDestroy() {
    this.stepConnectService.itemIndex = 0;
  }
}
