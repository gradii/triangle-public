/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { NgModule } from '@angular/core';
import { TriCommonModule } from '@gradii/triangle/core';
import { TriNavbarRow } from './navbar';
import { TriNavbar } from './navbar.component';


/**
 * # Navbar
 *
 * #### Examples
 * <!-- example(navbar:navbar-overview-example) -->
 * <!-- example(navbar:navbar-multirow-example) -->
 * <!-- example(navbar:navbar-harness-example) -->
 * <!-- example(navbar:navbar-basic-example) -->
 */
@NgModule({
  imports     : [TriCommonModule],
  exports     : [TriNavbar, TriNavbarRow, TriCommonModule],
  declarations: [TriNavbar, TriNavbarRow],
})
export class TriNavbarModule {
}
