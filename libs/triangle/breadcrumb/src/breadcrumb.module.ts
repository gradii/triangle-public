/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { BreadcrumbItemComponent } from './breadcrumb-item.component';

import { BreadcrumbComponent } from './breadcrumb.component';

/**
 *
 * #Breadcrumb
 * Displays the current page's position in the system hierarchy, and can go back up.
 * ### When to use
 *
 * - when the system has more than two levels of hierarchy;
 * - When it is necessary to tell the user "where are you";
 * - When the ability to navigate up is required.
 * - a tag in breadcrumb can be combined with <a href="[object Object]">RouterLinkActive</a>
 *
 * ### Code demo
 *
 * Simplest usage.
 * <!-- example(breadcrumb:breadcrumb-basic-example) -->
 * Use `separator="'>'"` to customize the separator.
 * <!-- example(breadcrumb:breadcrumb-separator-example) -->
 * Icons are placed in front of text.
 * <!-- example(breadcrumb:breadcrumb-icon-example) -->
 *
 *
 * <!-- example(breadcrumb:breadcrumb-loop-example) -->
 *
 */
@NgModule({
  imports     : [CommonModule],
  declarations: [BreadcrumbComponent, BreadcrumbItemComponent],
  exports     : [BreadcrumbComponent, BreadcrumbItemComponent]
})
export class TriBreadcrumbModule {
}
