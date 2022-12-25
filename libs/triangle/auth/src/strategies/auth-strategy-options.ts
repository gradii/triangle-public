/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */


import { TriAuthTokenClass } from '../services/token/token';

export interface TriStrategyToken {
  class?: TriAuthTokenClass;
  [key: string]: any;
}

export class TriAuthStrategyOptions {
  name: string;
  token?: TriStrategyToken;
}
