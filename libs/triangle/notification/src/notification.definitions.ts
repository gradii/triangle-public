/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { MessageData, MessageDataOptions } from '@gradii/triangle/message';

export interface NotificationData extends MessageData {
  // Overrides for string content
  type?: 'success' | 'info' | 'warning' | 'error' | 'blank';
  title?: string;
}

// Filled version of NzMessageData (includes more private properties)
export interface NotificationDataFilled extends NotificationData {
  messageId: string; // Service-wide unique id, auto generated
  state?: 'enter' | 'leave';
  options?: MessageDataOptions;
  createdAt: Date; // Auto created
}
