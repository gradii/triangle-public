/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { NgModule } from '@angular/core';

import { LOGGER_SERVICE_PROVIDER, TRI_LOGGER_STATE } from './logger.service';

@NgModule({
  providers: [{provide: TRI_LOGGER_STATE, useValue: false}, LOGGER_SERVICE_PROVIDER]
})
export class TriLoggerModule {
}
