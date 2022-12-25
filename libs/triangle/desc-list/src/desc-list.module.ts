/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TriGridModule } from '@gradii/triangle/grid';
import { DescListItemComponent } from './desc-list-item.component';
import { DescListComponent } from './desc-list.component';


/**
 * <!-- example(desc-list:desc-list-basic-example) -->
 */
@NgModule({
  imports     : [CommonModule, TriGridModule],
  declarations: [DescListComponent, DescListItemComponent],
  exports     : [DescListComponent, DescListItemComponent]
})
export class TriDescListModule {

}
