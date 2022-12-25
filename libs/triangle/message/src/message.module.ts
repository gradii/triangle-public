/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TriIconModule } from '@gradii/triangle/icon';
import { MessageContainerComponent } from './message-container.component';
import { MessageComponent } from './message.component';
import { TriMessageService } from './message.service';

/**
 * # Message global prompt
 * Display operation feedback information globally.
 * ### When to use
 *
 * Feedback information such as successes, warnings, and errors can be provided.
 * The top is displayed in the center and disappears automatically. It is a lightweight prompt method that does not interrupt the user's operation.
 *
 *
 * how to use
 *
 *
 * If you want to modify the default configuration of the message, you can set the value of the provider `MESSAGE_CONFIG` to modify it.
 *
 * (eg: add `{ provide: MESSAGE_CONFIG, useValue: { duration: 3000 } }` to your module's providers)
 * The default configuration is
 * {
 *   duration : 1500,
 *   maxStack : 7,
 *   pauseOnHover : true,
 *   animate : true
 * }
 * ### how to use
 * If you want to modify the default configuration of the message, you can set the value of the provider `MESSAGE_CONFIG` to modify it.
 *
 * (eg: add `{ provide: MESSAGE_CONFIG, useValue: { duration: 3000 } }` to your module's providers)
 * The default configuration is
 * {
 *   duration : 1500,
 *   maxStack : 7,
 *   pauseOnHover : true,
 *   animate : true
 * }
 * ### Code demo
 *
 * Information reminder feedback.
 * <!-- example(message:message-basic-example) -->
 * The custom duration is `10s` , the default duration is `1.5s` .
 * <!-- example(message:message-duration-example) -->
 * Include success, failure, warning.
 * <!-- example(message:message-icon-example) -->
 * Perform global loading and remove itself asynchronously.
 * <!-- example(message:message-loading-example) -->
 */
@NgModule({
  imports     : [CommonModule, OverlayModule, TriIconModule],
  declarations: [MessageContainerComponent, MessageComponent],
  providers   : [TriMessageService],
})
export class TriMessageModule {
}
