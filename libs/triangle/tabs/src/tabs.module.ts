/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { A11yModule } from '@angular/cdk/a11y';
import { ObserversModule } from '@angular/cdk/observers';
import { PortalModule } from '@angular/cdk/portal';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TriCommonModule, TriRippleModule } from '@gradii/triangle/core';
import { TriInkBar } from './ink-bar';
import { TriTab } from './tab';
import { TriTabBody, TriTabBodyPortal } from './tab-body';
import { TriTabContent } from './tab-content';
import { TriTabGroup } from './tab-group';
import { TriTabHeader } from './tab-header';
import { TriTabLabel } from './tab-label';
import { TriTabLabelWrapper } from './tab-label-wrapper';


/**
 * # Tabs
 *
 * ### When To Use
 *
 * ### Code Examples
 *
 *
 * <!-- example(tabs:tabs-segment-example) -->
 * <!-- example(tabs:tabs-basic-example) -->
 *
 * <!-- example(tabs:tab-nav-bar-basic-example) -->
 * <!-- example(tabs:tab-group-theme-example) -->
 * <!-- example(tabs:tab-group-stretched-example) -->
 * <!-- example(tabs:tab-group-lazy-loaded-example) -->
 * <!-- example(tabs:tab-group-header-below-example) -->
 * <!-- example(tabs:tab-group-harness-example) -->
 * <!-- example(tabs:tab-group-dynamic-height-example) -->
 * <!-- example(tabs:tab-group-dynamic-example) -->
 * <!-- example(tabs:tab-group-custom-label-example) -->
 * <!-- example(tabs:tab-group-basic-example) -->
 * <!-- example(tabs:tab-group-async-example) -->
 * <!-- example(tabs:tab-group-animations-example) -->
 * <!-- example(tabs:tab-group-align-example) -->
 */
@NgModule({
  imports     : [
    CommonModule,
    TriCommonModule,
    PortalModule,
    TriRippleModule,
    ObserversModule,
    A11yModule,
  ],
  declarations: [
    TriTabGroup,
    TriTabLabel,
    TriTab,
    TriInkBar,
    TriTabLabelWrapper,
    TriTabBody,
    TriTabBodyPortal,
    TriTabHeader,
    TriTabContent,
  ],
  // Don't export all components because some are only to be used internally.
  exports: [
    TriCommonModule,
    TriTabGroup,
    TriTabLabel,
    TriTab,
    TriTabContent,
    TriInkBar,
    TriTabHeader,
    TriTabBody,
    // TriTabHeader,
  ],
})
export class TriTabsModule {
}
