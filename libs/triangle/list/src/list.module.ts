/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TriAvatarModule } from '@gradii/triangle/avatar';
import { TriCommonModule } from '@gradii/triangle/core';
import { TriEmptyModule } from '@gradii/triangle/empty';
import { TriGridModule } from '@gradii/triangle/grid';
import { TriSpinModule } from '@gradii/triangle/spin';

import { ListEmptyComponent } from './list-empty.component';
import { ListItemMetaTitleComponent } from './list-item-meta-title.component';
import { ListItemMetaComponent } from './list-item-meta.component';
import { ListItemComponent } from './list-item.component';
import { ListComponent } from './list.component';

/**
 * <!-- example(list:list-basic-example) -->
 */
@NgModule({
  imports     : [
    CommonModule, TriSpinModule, TriGridModule, TriAvatarModule, TriCommonModule, TriEmptyModule
  ],
  declarations: [
    ListComponent, ListItemComponent, ListItemMetaComponent, ListEmptyComponent,
    ListItemMetaTitleComponent
  ],
  exports     : [
    ListComponent, ListItemComponent, ListItemMetaComponent, ListEmptyComponent,
    ListItemMetaTitleComponent
  ]
})
export class TriListModule {
}
