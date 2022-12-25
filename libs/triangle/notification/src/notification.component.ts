/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, Inject, Input, ViewEncapsulation } from '@angular/core';
import { MessageComponent, ɵTRI_INTERNAL_MESSAGE_CONTAINER as TRI_INTERNAL_MESSAGE_CONTAINER } from '@gradii/triangle/message';
import { NotificationPlacement } from './notification-config';
import type { NotificationContainerComponent } from './notification-container.component';

@Component({
  selector     : 'tri-notification',
  encapsulation: ViewEncapsulation.None,
  animations   : [
    trigger('notificationMotion', [
      state('enterRight', style({opacity: 1, transform: 'translateX(0)'})),
      transition('* => enterRight', [style({opacity: 0, transform: 'translateX(5%)'}), animate('100ms linear')]),
      state('enterLeft', style({opacity: 1, transform: 'translateX(0)'})),
      transition('* => enterLeft', [style({opacity: 0, transform: 'translateX(-5%)'}), animate('100ms linear')]),
      state('enterTop', style({opacity: 1, transform: 'translateY(0)'})),
      transition('* => enterTop', [style({opacity: 0, transform: 'translateY(-5%)'}), animate('100ms linear')]),
      state('enterBottom', style({opacity: 1, transform: 'translateY(0)'})),
      transition('* => enterBottom', [style({opacity: 0, transform: 'translateY(5%)'}), animate('100ms linear')]),
      state(
        'leave',
        style({
          opacity        : 0,
          transform      : 'scaleY(0.8)',
          transformOrigin: '0% 0%'
        })
      ),
      transition('* => leave', [
        style({
          opacity        : 1,
          transform      : 'scaleY(1)',
          transformOrigin: '0% 0%'
        }),
        animate('100ms linear')
      ])
    ])
  ],
  template     : `
    <div class="tri-notification-notice tri-notification-notice-closable"
         [ngStyle]="message.options?.style"
         [ngClass]="message.options?.class"
         [@notificationMotion]="state"
         (mouseenter)="onEnter()"
         (mouseleave)="onLeave()">
      <div *ngIf="!message.html" class="tri-notification-notice-content">
        <div class="tri-notification-notice-content"
             [ngClass]="{ 'tri-notification-notice-with-icon': message.type !== 'blank' }">
          <ng-container [ngSwitch]="message.type">
            <tri-icon *ngSwitchCase="'success'" svgIcon="outline:check-circle"
                      class="tri-notification-notice-icon tri-notification-notice-icon-success"></tri-icon>
            <tri-icon *ngSwitchCase="'info'" svgIcon="outline:info-circle"
                      class="tri-notification-notice-icon tri-notification-notice-icon-info"></tri-icon>
            <tri-icon *ngSwitchCase="'warning'" svgIcon="outline:exclamation-circle"
                      class="tri-notification-notice-icon tri-notification-notice-icon-warning"></tri-icon>
            <tri-icon *ngSwitchCase="'error'" svgIcon="outline:close-circle"
                      class="tri-notification-notice-icon tri-notification-notice-icon-error"></tri-icon>
          </ng-container>
          <div class="tri-notification-notice-message">{{message.title}}</div>
          <div class="tri-notification-notice-description">{{message.content}}</div>
        </div>
      </div>
      <div *ngIf="message.html" [innerHTML]="message.html"></div>
      <a tabindex="0" class="tri-notification-notice-close" (click)="onClickClose()">
        <span tri-icon svgIcon="outline:close" class="tri-notification-notice-close-x"></span>
      </a>
    </div>
  `,
  styleUrls    : [
    '../style/notification.scss'
  ]
})
export class NotificationComponent extends MessageComponent {
  @Input()
  placement: NotificationPlacement;

  constructor(@Inject(TRI_INTERNAL_MESSAGE_CONTAINER) container: NotificationContainerComponent) {
    super(container);
  }

  onClickClose() {
    this._destroy();
  }

  get state(): string | undefined {
    if (this.message.state === 'enter') {
      if (this.placement === 'topLeft' || this.placement === 'bottomLeft') {
        return 'enterLeft';
      } else if (this.placement === 'top') {
        return 'enterTop';
      } else if (this.placement === 'bottom') {
        return 'enterBottom';
      } else {
        return 'enterRight';
      }
    } else {
      return this.message.state;
    }
  }
}
