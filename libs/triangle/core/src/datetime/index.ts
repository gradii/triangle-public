/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */


import { PlatformModule } from '@angular/cdk/platform';
import { NgModule } from '@angular/core';
import { DateAdapter } from './date-adapter';
import { TRI_DATE_FORMATS } from './date-formats';
import { NativeDateAdapter } from './native-date-adapter';
import { TRI_NATIVE_DATE_FORMATS } from './native-date-formats';

export * from './date-adapter';
export * from './date-formats';
export * from './native-date-adapter';
export * from './native-date-formats';


@NgModule({
  imports  : [PlatformModule],
  providers: [
    {provide: DateAdapter, useClass: NativeDateAdapter},
  ],
})
export class NativeDateModule {
}


@NgModule({
  imports  : [NativeDateModule],
  providers: [{provide: TRI_DATE_FORMATS, useValue: TRI_NATIVE_DATE_FORMATS}],
})
export class TriNativeDateModule {
}
