/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TriButtonModule } from '@gradii/triangle/button';
import { TriMenuModule } from '@gradii/triangle/menu';
import { DropdownButtonComponent } from './dropdown-button.component';

import { DropdownComponent } from './dropdown.component';
import { DropdownDirective } from './dropdown.directive';


/**
 *
 * # Dropdown dropdown menu
 * A list that pops down.
 * ### When to use
 * When there are too many operation commands on the page, this component can be used to store operation elements. Click or move into the touch point and a drop-down menu will appear. You can select from the list and execute the corresponding command.
 * ### Code demo
 *
 * Simplest drop down menu.
 * <!-- deprecated-example(dropdown:drop-down-basic) -->
 * Dividing lines and unavailable menu items.
 * <!-- deprecated-example(dropdown:drop-down-other) -->
 * The event is fired when the menu item is clicked.
 * <!-- deprecated-example(dropdown:drop-down-trigger) -->
 * There are multiple levels in the incoming menu.
 * <!-- deprecated-example(dropdown:drop-down-cascading) -->
 * 6 pop-up positions are supported.
 * <!-- deprecated-example(dropdown:drop-down-position) -->
 * The default is to move into the trigger menu, you can click to trigger.
 * <!-- deprecated-example(dropdown:drop-down-click) -->
 * On the left are buttons, and on the right is a menu of additional related functions.
 * <!-- deprecated-example(dropdown:drop-down-button) -->
 * The default is to click the close menu to close this function.
 * <!-- deprecated-example(dropdown:drop-down-hide) -->
 * <!-- example(dropdown:dropdown-basic-example) -->
 * <!-- example(dropdown:dropdown-basic-example) -->
 */
@NgModule({
  imports     : [CommonModule, OverlayModule, FormsModule, TriButtonModule, TriMenuModule],
  declarations: [DropdownComponent, DropdownButtonComponent, DropdownDirective],
  exports     : [DropdownComponent, DropdownButtonComponent, DropdownDirective]
})
export class TriDropdownModule {
}
