/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TriIconModule } from '@gradii/triangle/icon';
import { AccordionItemComponent } from './accordion-item.component';
import { AccordionComponent } from './accordion.component';

/**
 *
 * # Accordion accordion panel
 * A content area that can be collapsed/expanded.
 * ### When to use
 *
 * Group and hide complex areas to keep pages clean.
 * An `Accordion` is a special type of accordion panel that only allows a single content area to expand.
 *
 * ### Code demo
 *
 * Multiple panels can be expanded at the same time, this example expands the first one by default.
 * <!-- example(accordion:accordion-basic-example) -->
 * Accordion, open only one tab at a time. The first one is opened by default.
 * <!-- example(accordion:accordion-accordion-example) -->
 * Nested accordion panels.
 * <!-- example(accordion:accordion-nest-example) -->
 * A set of simple styles without borders.
 * <!-- example(accordion:accordion-border-example) -->
 * Customize the background color, border radius, and margins of each panel.
 * <!-- example(accordion:accordion-custom-example) -->
 * Accordion size
 * <!-- example(accordion:accordion-size-example) -->
 */
@NgModule({
  imports     : [CommonModule, TriIconModule],
  declarations: [AccordionComponent, AccordionItemComponent],
  exports     : [AccordionComponent, AccordionItemComponent],
})
export class TriAccordionModule {
}
