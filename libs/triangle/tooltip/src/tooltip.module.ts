/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { A11yModule } from '@angular/cdk/a11y';
import { OverlayModule } from '@angular/cdk/overlay';
import { CdkScrollableModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TriCommonModule } from '@gradii/triangle/core';
import { TooltipDirective } from './tooltip.directive';
import { TooltipComponent } from './tooltip.component';
import { TRI_TOOLTIP_SCROLL_STRATEGY_FACTORY_PROVIDER } from './tooltip.common';

/**
 * # Tooltip
 *
 * ### When To Use
 *
 * ### Code Examples
 *
 * <!-- example(tooltip:tooltip-trigger-example) -->
 * <!-- example(tooltip:tooltip-position-example) -->
 * <!-- example(tooltip:tooltip-placements-example) -->
 * <!-- example(tooltip:tooltip-overview-example) -->
 * <!-- example(tooltip:tooltip-modified-defaults-example) -->
 * <!-- example(tooltip:tooltip-message-example) -->
 * <!-- example(tooltip:tooltip-manual-example) -->
 * <!-- example(tooltip:tooltip-harness-example) -->
 * <!-- example(tooltip:tooltip-disabled-example) -->
 * <!-- example(tooltip:tooltip-delay-example) -->
 * <!-- example(tooltip:tooltip-custom-class-example) -->
 * <!-- example(tooltip:tooltip-auto-hide-example) -->
 */
@NgModule({
  imports        : [
    A11yModule,
    CommonModule,
    OverlayModule,
    TriCommonModule,
  ],
  exports        : [
    TooltipDirective,
    TooltipComponent,
    TriCommonModule,
    CdkScrollableModule
  ],
  declarations   : [TooltipDirective, TooltipComponent],
  providers      : [TRI_TOOLTIP_SCROLL_STRATEGY_FACTORY_PROVIDER]
})
export class TriTooltipModule {
}
