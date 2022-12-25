/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */


import { OverlayModule } from '@angular/cdk/overlay';
import { CdkScrollableModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TriCommonModule, TriOptionModule } from '@gradii/triangle/core';
import { TriIconModule } from '@gradii/triangle/icon';
import { TRI_SELECT_SCROLL_STRATEGY_PROVIDER } from './select-config';
import { TriSelectTrigger } from './select-trigger';
import { TriSelect } from './select.component';


/**
 * # Select
 *
 * ### When To Use
 * You can use select to display a list of options to the user.
 * this component is designed to be used with the `<tri-option>` component.
 * differently from complex combobox components, select can't search or filter the options.
 *
 * ### Code Examples
 * <!-- example(select:select-size-example) -->
 * <!-- example(select:select-multiple-example) -->
 * <!-- example(select:select-custom-option-example) -->
 * <!-- example(select:select-basic-example) -->
 */
@NgModule({
  imports: [CommonModule, OverlayModule, TriOptionModule, TriCommonModule, TriIconModule],
  exports     : [
    CdkScrollableModule,
    TriSelect,
    TriSelectTrigger,
    TriOptionModule,
    TriCommonModule,
  ],
  declarations: [TriSelect, TriSelectTrigger],
  providers   : [TRI_SELECT_SCROLL_STRATEGY_PROVIDER],
})
export class TriSelectModule {
}
