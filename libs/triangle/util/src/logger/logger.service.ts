/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Inject, Injectable, InjectionToken, Optional, Provider, SkipSelf } from '@angular/core';

// Whether print the log
export const TRI_LOGGER_STATE = new InjectionToken<boolean>('tri-logger-state');

export function LOGGER_SERVICE_PROVIDER_FACTORY(exist: boolean, loggerState: any) {
  return exist || new LoggerService(loggerState);
}

@Injectable()
export class LoggerService {
  constructor(@Inject(TRI_LOGGER_STATE) private _loggerState: boolean) {
  }

  log(...args: any[]) {
    if (this._loggerState) {
      console.log(...args);
    }
  }

  warn(...args: any[]) {
    if (this._loggerState) {
      console.warn(...args);
    }
  }

  error(...args: any[]) {
    if (this._loggerState) {
      console.error(...args);
    }
  }

  info(...args: any[]) {
    if (this._loggerState) {
      console.log(...args);
    }
  }

  debug(...args: any[]) {
    if (this._loggerState) {
      console.log('[DEBUG]', ...args);
      const arrs = Array.prototype.slice.call(arguments);
    }
  }
}

export const LOGGER_SERVICE_PROVIDER: Provider = {
  provide   : LoggerService,
  useFactory: LOGGER_SERVICE_PROVIDER_FACTORY,
  deps      : [[new Optional(), new SkipSelf(), LoggerService], TRI_LOGGER_STATE]
};
