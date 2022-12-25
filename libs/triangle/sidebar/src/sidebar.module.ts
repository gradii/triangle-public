/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { NgModule, ModuleWithProviders } from '@angular/core';

import {
  TriSidebarComponent,
  TriSidebarFooterComponent,
  TriSidebarHeaderComponent,
} from './sidebar.component';

import { TriSidebarService } from './sidebar.service';

const TRI_SIDEBAR_COMPONENTS = [
  TriSidebarComponent,
  TriSidebarFooterComponent,
  TriSidebarHeaderComponent,
];

const TRI_SIDEBAR_PROVIDERS = [
  TriSidebarService,
];


/**
 * <!-- example(sidebar:sidebar-basic-example) -->
 */
@NgModule({
  imports: [
  ],
  declarations: [
    ...TRI_SIDEBAR_COMPONENTS,
  ],
  exports: [
    ...TRI_SIDEBAR_COMPONENTS,
  ],
})
export class TriSidebarModule {
  static forRoot(): ModuleWithProviders<TriSidebarModule> {
    return {
      ngModule: TriSidebarModule,
      providers: [
        ...TRI_SIDEBAR_PROVIDERS,
      ],
    };
  }
}
