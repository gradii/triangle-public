/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { FocusOrigin } from '@angular/cdk/a11y';
import { Injectable } from '@angular/core';
import { TriDrawerToggleResult } from '@gradii/triangle/drawer';
import { SidenavComponent } from './sidenav.component';


@Injectable({
  providedIn: 'root'
})
export class SidenavService {

  private sidenavContents: Set<SidenavComponent> = new Set<SidenavComponent>();

  constructor() {
  }

  _registrySidenavComponent(sidenav: SidenavComponent) {
    this.sidenavContents.add(sidenav);
  }

  _unRegistrySidenavComponent(sidenav: SidenavComponent) {
    this.sidenavContents.delete(sidenav);
  }

  _findSidenav(selector: string) {
    for (const sidenav of this.sidenavContents.values()) {
      if (selector === 'start' || selector === 'end') {
        if (sidenav.position === selector) {
          return sidenav;
        }
      } else if (sidenav.elementRef.nativeElement.matches(selector)) {
        return sidenav;
      }
    }
    return null;
  }

  toggle(selector: string, openedVia?: FocusOrigin): Promise<TriDrawerToggleResult | false> {
    const sidenav = this._findSidenav(selector);
    if (sidenav) {
      return sidenav.toggle(!sidenav.opened, openedVia);
    }
    return Promise.resolve(false);
  }

  open(selector: string, openedVia?: FocusOrigin): Promise<TriDrawerToggleResult | false> {
    const sidenav = this._findSidenav(selector);
    if (sidenav) {
      return sidenav.open(openedVia);
    }
    return Promise.resolve(false);
  }

  close(selector: string): Promise<TriDrawerToggleResult | false> {
    const sidenav = this._findSidenav(selector);
    if (sidenav) {
      return sidenav.close();
    }
    return Promise.resolve(false);
  }

}
