/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { MessageConfig } from './message-config';

export type MessagePlacement = 'top' | 'bottom' | 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';

export interface MessageDataOptions extends MessageConfig {
  duration?: number;
  animate?: boolean;
  pauseOnHover?: boolean;
  placement?: MessagePlacement;
  style?: Record<string, any> | null,
  class?: string | string[] | Set<string> | Record<string, any>,
}

// Message data for terminal users
export interface MessageData {
  // For html
  html?: string;

  // For string content
  type?: 'success' | 'info' | 'warning' | 'error' | 'loading' | any;
  title?: string;
  content?: string;
}

// Filled version of NzMessageData (includes more private properties)
export interface MessageDataFilled extends MessageData {
  messageId: string; // Service-wide unique id, auto generated
  state?: 'enter' | 'leave';
  options?: MessageDataOptions;
  createdAt: Date; // Auto created
}
