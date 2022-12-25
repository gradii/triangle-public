/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TriRippleModule } from '../ripple/index';
import { TriPseudoCheckboxModule } from '../selection/index';
import { TriOptgroup } from './optgroup';
import { TriOption } from './option';


@NgModule({
  imports     : [TriRippleModule, CommonModule, TriPseudoCheckboxModule],
  exports     : [TriOption, TriOptgroup],
  declarations: [TriOption, TriOptgroup]
})
export class TriOptionModule {
}


export * from './option';
export * from './option-base';
export * from './optgroup';
export * from './optgroup-base';
export * from './option-parent';
export * from './helper';
