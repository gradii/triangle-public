/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { ObserversModule } from '@angular/cdk/observers';
import { NgModule } from '@angular/core';
import { TriTabsModule } from '@gradii/triangle/tabs';
import { TriRippleModule } from '@gradii/triangle/core';
import { TriTabLink } from './tab-link';
import { TriTabNav } from './tab-nav-bar';


@NgModule({
  imports: [
    ObserversModule,
    TriTabsModule,
    TriRippleModule
  ],
  declarations: [
    TriTabNav,
    TriTabLink
  ],
  exports     : [
    TriTabNav,
    TriTabLink
  ]
})
export class TabNavBarModule {

}
