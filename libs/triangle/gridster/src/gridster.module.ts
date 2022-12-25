/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { GridsterComponent } from './gridster.component';
import { GridsterItemComponent } from './gridster-item.component';
import { GridsterPreviewComponent } from './gridster-preview.component';

/**
 *
 * <!-- example(gridster:gridster-widget-c-example) -->
 * <!-- example(gridster:gridster-widget-b-example) -->
 * <!-- example(gridster:gridster-widget-a-example) -->
 * <!-- example(gridster:gridster-track-by-item-example) -->
 * <!-- example(gridster:gridster-track-by-example) -->
 * <!-- example(gridster:gridster-swap-example) -->
 * <!-- example(gridster:gridster-rtl-example) -->
 * <!-- example(gridster:gridster-resize-example) -->
 * <!-- example(gridster:gridster-push-example) -->
 * <!-- example(gridster:gridster-parent-dynamic-example) -->
 * <!-- example(gridster:gridster-multi-layer-example) -->
 * <!-- example(gridster:gridster-misc-example) -->
 * <!-- example(gridster:gridster-items-example) -->
 * <!-- example(gridster:gridster-home-example) -->
 * <!-- example(gridster:gridster-grid-types-example) -->
 * <!-- example(gridster:gridster-grid-sizes-example) -->
 * <!-- example(gridster:gridster-grid-margins-example) -->
 * <!-- example(gridster:gridster-grid-events-example) -->
 * <!-- example(gridster:gridster-empty-cell-example) -->
 * <!-- example(gridster:gridster-dynamic-widgets-example) -->
 * <!-- example(gridster:gridster-drag-example) -->
 * <!-- example(gridster:gridster-display-grid-example) -->
 * <!-- example(gridster:gridster-compact-example) -->
 * <!-- example(gridster:gridster-api-example) -->
 *
 */
@NgModule({
  imports     : [
    CommonModule
  ],
  declarations: [
    GridsterComponent,
    GridsterItemComponent,
    GridsterPreviewComponent
  ],
  exports     : [GridsterComponent, GridsterItemComponent]
})
export class TriGridsterModule {
}
