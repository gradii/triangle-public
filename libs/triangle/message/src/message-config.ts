/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { InjectionToken } from '@angular/core';

export class MessageConfig {
  // For all messages as default config (can override when dynamically created)
  duration?: number;
  pauseOnHover?: boolean;
  animate?: boolean;
  // For message container only
  maxStack?: number;
}

export const MESSAGE_CONFIG = new InjectionToken<MessageConfig>('MESSAGE_CONFIG');
