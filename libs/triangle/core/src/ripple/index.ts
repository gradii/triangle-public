/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { PlatformModule } from '@angular/cdk/platform';
import { NgModule } from '@angular/core';
import { TriCommonModule } from '../common-behaviors/common-module';
import { TriRipple } from './ripple';

export * from './ripple';
export * from './ripple-ref';
export * from './ripple-renderer';

@NgModule({
  imports     : [TriCommonModule, PlatformModule],
  exports     : [TriRipple, TriCommonModule],
  declarations: [TriRipple],
})
export class TriRippleModule {
}
