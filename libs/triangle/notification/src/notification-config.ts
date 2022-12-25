/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { InjectionToken } from '@angular/core';
import { MessageConfig } from '@gradii/triangle/message';

export type NotificationPlacement = 'top' | 'bottom' | 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';

export class NotificationConfig extends MessageConfig {
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  placement?: NotificationPlacement;
}

export const NOTIFICATION_CONFIG = new InjectionToken<NotificationConfig>('NOTIFICATION_CONFIG');