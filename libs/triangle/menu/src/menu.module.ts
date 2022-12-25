/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */


import { OverlayModule } from '@angular/cdk/overlay';
import { NgModule } from '@angular/core';
import { TriContextMenuTrigger } from './context-menu';
import { TriMenu } from './menu';
import { TriTargetMenuAim } from './menu-aim';
import { TriMenuBar } from './menu-bar';
import { TriMenuGroup } from './menu-group';
import { TriMenuItem } from './menu-item';
import { TriMenuItemCheckbox } from './menu-item-checkbox';
import { TriMenuItemRadio } from './menu-item-radio';
import { TriMenuItemTrigger } from './menu-item-trigger';
import { TriMenuPanel } from './menu-panel';

const EXPORTED_DECLARATIONS = [
  TriMenuBar,
  TriMenu,
  TriMenuPanel,
  TriMenuItem,
  TriMenuItemRadio,
  TriMenuItemCheckbox,
  TriMenuItemTrigger,
  TriMenuGroup,
  TriContextMenuTrigger,
  TriTargetMenuAim,
];

/**
 * # Menu
 *
 * ### When To Use
 *
 * ### Code Examples
 *
 * <!-- example(menu:menu-standalone-stateful-menu-example) -->
 * <!-- example(menu:menu-standalone-menu-example) -->
 * <!-- example(menu:menu-menubar-example) -->
 * <!-- example(menu:menu-inline-example) -->
 * <!-- example(menu:menu-context-example) -->
 * <!-- example(menu:menu-basic-example) -->
 */
@NgModule({
  imports     : [OverlayModule],
  exports     : EXPORTED_DECLARATIONS,
  declarations: EXPORTED_DECLARATIONS,
})
export class TriMenuModule {
}
