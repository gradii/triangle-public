/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { NgModule } from '@angular/core';
import { TriCommonModule, TriRippleModule } from '@gradii/triangle/core';
import { TriButtonToggle } from './button-toggle';
import { TriButtonToggleGroup } from './button-toggle-group';

/**
 * # Button Toggle
 *
 * ### When To Use
 *
 * ### Code Examples
 *
 * <!-- example(button-toggle:button-toggle-overview-example) -->
 * <!-- example(button-toggle:button-toggle-mode-example) -->
 * <!-- example(button-toggle:button-toggle-harness-example) -->
 * <!-- example(button-toggle:button-toggle-forms-example) -->
 * <!-- example(button-toggle:button-toggle-exclusive-example) -->
 * <!-- example(button-toggle:button-toggle-appearance-example) -->
 *
 */
@NgModule({
  imports     : [TriCommonModule, TriRippleModule],
  exports     : [TriCommonModule, TriButtonToggleGroup, TriButtonToggle],
  declarations: [TriButtonToggleGroup, TriButtonToggle],
})
export class TriButtonToggleModule {
}
