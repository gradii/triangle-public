/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { DatePipe } from '@angular/common';
import { NgModule } from '@angular/core';

import { TriLoggerModule } from '@gradii/triangle/util';

import zh_CN from '../languages/zh_CN';
import { I18nPipe } from './i18n.pipe';
import { I18N_SERVICE_PROVIDER } from './i18n.service';
import { I18N } from './i18n.token';

@NgModule({
  imports     : [TriLoggerModule],
  declarations: [I18nPipe],
  exports     : [I18nPipe],
  providers   : [
    {provide: I18N, useValue: zh_CN},
    DatePipe,
    I18N_SERVICE_PROVIDER
  ]
})
export class TriI18nModule {
}
