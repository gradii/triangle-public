/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Component, forwardRef, Inject, Optional, ViewEncapsulation } from '@angular/core';
import {
  MessageContainerComponent, MessageDataFilled, ɵTRI_INTERNAL_MESSAGE_CONTAINER as TRI_INTERNAL_MESSAGE_CONTAINER
} from '@gradii/triangle/message';
import { BehaviorSubject, map } from 'rxjs';
import { NOTIFICATION_CONFIG, NotificationConfig } from './notification-config';

const defaultNotificationConfig = {
  top         : '24px',
  bottom      : '24px',
  left        : '0px',
  right       : '0px',
  duration    : 4500,
  maxStack    : 7,
  pauseOnHover: true,
  animate     : true
};

@Component({
  selector     : 'tri-notification-container',
  encapsulation: ViewEncapsulation.None,
  providers    : [
    {provide: TRI_INTERNAL_MESSAGE_CONTAINER, useExisting: forwardRef(() => NotificationContainerComponent)}
  ],
  template     : `
    <div class="tri-notification tri-notification-top" [style.top]="config.top">
      <tri-notification *ngFor="let message of topMessages$|async; let i = index" 
                        [message]="message"
                        [placement]="message.options?.placement"
                        [index]="i"></tri-notification>
    </div>
    <div class="tri-notification tri-notification-bottom" [style.bottom]="config.bottom">
      <tri-notification *ngFor="let message of bottomMessages$|async; let i = index" 
                        [message]="message"
                        [placement]="message.options?.placement"
                        [index]="i"></tri-notification>
    </div>
    <div class="tri-notification tri-notification-topLeft" [style.top]="config.top" [style.left]="config.left">
      <tri-notification *ngFor="let message of topLeftMessages$|async; let i = index" 
                        [message]="message"
                        [placement]="message.options?.placement"
                        [index]="i"></tri-notification>
    </div>
    <div class="tri-notification tri-notification-bottomLeft" [style.bottom]="config.bottom" [style.left]="config.left">
      <tri-notification *ngFor="let message of bottomLeftMessages$|async; let i = index" 
                        [message]="message"
                        [placement]="message.options?.placement"
                        [index]="i"></tri-notification>
    </div>
    <div class="tri-notification tri-notification-topRight" [style.top]="config.top" [style.right]="config.right">
      <tri-notification *ngFor="let message of topRightMessages$|async; let i = index" 
                        [message]="message"
                        [placement]="message.options?.placement"
                        [index]="i"></tri-notification>
    </div>
    <div class="tri-notification tri-notification-bottomRight" [style.bottom]="config.bottom" [style.right]="config.right">
      <tri-notification *ngFor="let message of bottomRightMessages$|async; let i = index" 
                        [message]="message"
                        [placement]="message.options?.placement"
                        [index]="i"></tri-notification>
    </div>
  `
})
export class NotificationContainerComponent extends MessageContainerComponent<NotificationConfig> {
  public messages$ = new BehaviorSubject([]);

  public topLeftMessages$ = this.messages$.pipe(
    map(messages => messages.filter(message => message.options.placement === 'topLeft')),
    map(messages => this.handleMax(messages))
  );

  public bottomLeftMessages$ = this.messages$.pipe(
    map(messages => messages.filter(message => message.options.placement === 'bottomLeft')),
    map(messages => this.handleMax(messages))
  );

  public topRightMessages$ = this.messages$.pipe(
    map(messages => messages.filter(message => message.options.placement === 'topRight' ||
      !message.options.placement)),
    map(messages => this.handleMax(messages))
  );

  public bottomRightMessages$ = this.messages$.pipe(
    map(messages => messages.filter(message => message.options.placement === 'bottomRight')),
    map(messages => this.handleMax(messages))
  );

  public topMessages$ = this.messages$.pipe(
    map(messages => messages.filter(message => message.options.placement === 'top')),
    map(messages => this.handleMax(messages))
  );

  public bottomMessages$ = this.messages$.pipe(
    map(messages => messages.filter(message => message.options.placement === 'bottom')),
    map(messages => this.handleMax(messages))
  );

  constructor(@Optional() @Inject(NOTIFICATION_CONFIG) config: NotificationConfig) {
    super(Object.assign({}, defaultNotificationConfig, config));
  }

  handleMax(messages: MessageDataFilled[]): MessageDataFilled[] {
    if (messages.length > this.config.maxStack) {
      const list    = messages.splice(0, messages.length - this.config.maxStack);
      this.messages = this.messages.filter(m => list.indexOf(m) === -1);
    }
    return messages;
  }

  createMessage(message: MessageDataFilled): void {

    message.options = this._mergeMessageOptions(message.options);
    this.messages.push(message);
    this.messages$.next(this.messages);
  }

  removeMessage(messageId: string): void {
    super.removeMessage(messageId);
    this.messages$.next(this.messages);
  }
}
