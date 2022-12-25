/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */


import { Directive, ElementRef, } from '@angular/core';
import { mixinColor } from '@gradii/triangle/core';


// Boilerplate for applying mixins to TriNavbar.
/** @docs-private */
export const _TriNavbarBase = mixinColor(class {
  constructor(public _elementRef: ElementRef) {
  }
});

@Directive({
  selector: 'tri-navbar-row',
  exportAs: 'triToolbarRow',
  host    : {'class': 'tri-navbar-row'},
})
export class TriNavbarRow {
}

export function throwToolbarMixedModesError() {
  throw Error('TriNavbar: Attempting to combine different navbar modes. ' +
    'Either specify multiple `<tri-navbar-row>` elements explicitly or just place content ' +
    'inside of a `<tri-navbar>` for a single row.');
}
