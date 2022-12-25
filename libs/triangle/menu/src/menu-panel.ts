/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */


import { Directive, TemplateRef } from '@angular/core';
import { Menu } from './menu-interface';
import { MenuStack } from './menu-stack';

/**
 * Directive applied to an ng-template which wraps a TriMenu and provides a reference to the
 * child element it wraps which allows for opening of the TriMenu in an overlay.
 */
@Directive({selector: 'ng-template[triMenuPanel]', exportAs: 'triMenuPanel'})
export class TriMenuPanel {
  /** Reference to the child menu component */
  _menu?: Menu;

  /** Keep track of open Menus. */
  _menuStack: MenuStack | null;

  constructor(readonly _templateRef: TemplateRef<unknown>) {
  }

  /**
   * Set the Menu component on the menu panel. Since we cannot use ContentChild to fetch the
   * child Menu component, the child Menu must register its self with the parent MenuPanel.
   */
  _registerMenu(child: Menu) {
    this._menu = child;

    // The ideal solution would be to affect the TriMenuPanel injector from the TriMenuTrigger and
    // inject the menu stack reference into the child menu and menu items, however this isn't
    // possible at this time.
    this._menu._menuStack = this._menuStack;
    this._menuStack?.push(child);
  }
}
