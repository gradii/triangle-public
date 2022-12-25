/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TriIconModule } from '@gradii/triangle/icon';
import { NotificationContainerComponent } from './notification-container.component';
import { NotificationComponent } from './notification.component';
import { TriNotificationService } from './notification.service';

/**
 *
 * # Notification
 * Display notification information globally.
 * ### When to use
 * Display notification information in the upper right corner of the system. Often used in the following situations:
 * More complex notification content.
 * Notifications with interactions that give the user a point of action for the next step.
 * The system actively pushes.
 * ### how to use
 * Similar to Message, if you want to modify the default configuration of message, you can set the value of provider `TRI_NOTIFICATION_CONFIG` to modify it.
 * (eg: add `{ provide: TRI_NOTIFICATION_CONFIG, useValue: { duration: 3000 } }` to your module's providers , `TRI_NOTIFICATION_CONFIG` can be imported from `@gradii/triangle/notification`)
 * The default configuration is
 * ```json
 * {
 *   top : '24px',
 *   right : '0px',
 *   duration : 4500,
 *   maxStack : 7,
 *   pauseOnHover : true,
 *   animate : true
 * }
 * ```
 * ### Code demo
 *
 * The simplest usage, it automatically shuts off after 4.5 seconds.
 * <!-- example(notification:notification-basic-example) -->
 *
 * There is an icon on the left side of the notification reminder box.
 * <!-- example(notification:notification-custom-icon-example) -->
 *
 * Customize the delay for the automatic closing of the notification box, the default is `4.5s` , to cancel the automatic closing, just set the value to `0`.
 * <!-- example(notification:notification-duration-example) -->
 *
 * A notification box with a icon at the left side.
 * <!-- example(notification:notification-with-icon-example) -->
 *
 * A notification box can pop up from topRight or bottomRight or bottomLeft or topLeft or top or bottom.
 * <!-- example(notification:notification-position-example) -->
 *
 * The style and class are available to customize Notification.
 * <!-- example(notification:notification-custom-style-example) -->
 */
@NgModule({
  imports: [CommonModule, OverlayModule, TriIconModule],
  declarations: [NotificationComponent, NotificationContainerComponent],
  providers   : [TriNotificationService],
})
export class TriNotificationModule {
}
