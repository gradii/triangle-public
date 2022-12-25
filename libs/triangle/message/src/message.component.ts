/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, Inject, Input, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { MessageConfig } from './message-config';
import { TRI_INTERNAL_MESSAGE_CONTAINER } from './message.types';
import type { MessageContainerComponent } from './message-container.component';
import type { MessageDataFilled, MessageDataOptions } from './message.definitions';

@Component({
  selector     : 'tri-message',
  encapsulation: ViewEncapsulation.None,
  animations   : [
    trigger('enterLeave', [
      state('enter', style({opacity: 1, transform: 'translateY(0)'})),
      transition('* => enter', [
        style({
          opacity  : 0,
          transform: 'translateY(-50%)'
        }), animate('100ms linear')
      ]),
      state('leave', style({opacity: 0, transform: 'translateY(-50%)'})),
      transition('* => leave', [
        style({
          opacity  : 1,
          transform: 'translateY(0)'
        }), animate('100ms linear')
      ])
    ])
  ],
  template     : `
    <div class="tri-message-notice"
         [@enterLeave]="message.state"
         (mouseenter)="onEnter()"
         (mouseleave)="onLeave()">
      <div class="tri-message-notice-content"
           [ngClass]="'tri-message-' + message.type">
        <div *ngIf="!message.html"
             class="tri-message-content">
          <ng-container [ngSwitch]="message.type">
            <tri-icon *ngSwitchCase="'success'" svgIcon="fill:check-circle"></tri-icon>
            <tri-icon *ngSwitchCase="'info'" svgIcon="fill:info-circle"></tri-icon>
            <tri-icon *ngSwitchCase="'warning'" svgIcon="fill:exclamation-circle"></tri-icon>
            <tri-icon *ngSwitchCase="'error'" svgIcon="fill:close-circle"></tri-icon>
            <tri-icon *ngSwitchCase="'loading'" class="anticon anticon-spin"
                      svgIcon="outline:loading"></tri-icon>
          </ng-container>
          <span>{{message.content}}</span>
        </div>
        <div *ngIf="message.html"
             class="tri-message-custom-content"
             [innerHTML]="message.html"></div>
      </div>
    </div>
  `,
  styleUrls    : [
    '../style/message.scss'
  ]
})
export class MessageComponent implements OnInit, OnDestroy {
  @Input() message: MessageDataFilled;
  @Input() index: number;

  protected _options: MessageDataOptions; // Shortcut reference to Message.options

  // For auto erasing(destroy) self
  private _autoErase: boolean; // Whether record timeout to auto destroy self
  private _eraseTimer: number = null;
  private _eraseTimingStart: number;
  private _eraseTTL: number; // Time to live

  constructor(@Inject(TRI_INTERNAL_MESSAGE_CONTAINER)  private _messageContainer: MessageContainerComponent<MessageConfig>) {
  }

  ngOnInit() {
    this._options = this.message.options;

    if (this._options.animate) {
      this.message.state = 'enter';
    }

    this._autoErase = this._options.duration > 0;

    if (this._autoErase) {
      this._initErase();
      this._startEraseTimeout();
    }
  }

  ngOnDestroy() {
    if (this._autoErase) {
      this._clearEraseTimeout();
    }
  }

  onEnter() {
    if (this._autoErase && this._options.pauseOnHover) {
      this._clearEraseTimeout();
      this._updateTTL();
    }
  }

  onLeave() {
    if (this._autoErase && this._options.pauseOnHover) {
      this._startEraseTimeout();
    }
  }

  // Remove self
  protected _destroy() {
    if (this._options.animate) {
      this.message.state = 'leave';
      setTimeout(() => this._messageContainer.removeMessage(this.message.messageId), 200);
    } else {
      this._messageContainer.removeMessage(this.message.messageId);
    }
  }

  private _initErase() {
    this._eraseTTL         = this._options.duration;
    this._eraseTimingStart = Date.now();
  }

  private _updateTTL() {
    if (this._autoErase) {
      this._eraseTTL -= Date.now() - this._eraseTimingStart;
    }
  }

  private _startEraseTimeout() {
    if (this._eraseTTL > 0) {
      this._clearEraseTimeout(); // To prevent calling _startEraseTimeout() more times to create more timer
      this._eraseTimer       = window.setTimeout(() => this._destroy(), this._eraseTTL);
      this._eraseTimingStart = Date.now();
    } else {
      this._destroy();
    }
  }

  private _clearEraseTimeout() {
    if (this._eraseTimer !== null) {
      window.clearTimeout(this._eraseTimer);
      this._eraseTimer = null;
    }
  }
}
