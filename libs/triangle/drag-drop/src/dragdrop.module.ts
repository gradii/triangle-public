/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { Draggable } from './draggable.directive';
import { Droppable } from './droppable.directive';


@NgModule({
  imports     : [CommonModule],
  exports     : [Draggable, Droppable],
  declarations: [Draggable, Droppable]
})
export class TriDragDropModule {
}
