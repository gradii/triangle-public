/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TriIconModule } from '@gradii/triangle/icon';
import { CheckableTagComponent } from './checkable-tag.component';
import { TagComponent } from './tag.component';

/**
 * tag
 *
 * <!-- example(tag:tag-basic-example) -->
 */
@NgModule({
  imports     : [CommonModule, FormsModule, TriIconModule],
  declarations: [TagComponent, CheckableTagComponent],
  exports     : [TagComponent, CheckableTagComponent]
})
export class TriTagModule {
}
