/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { NgModule } from '@angular/core';
import { DragAndDropService } from './drag-and-drop.service';
import { DragHintService } from './drag-hint.service';

import { DraggableColumnDirective } from './draggable-column.directive';
import { DropCueService } from './drop-cue.service';
import { DropTargetDirective } from './drop-target.directive';

const exported = [
  DraggableColumnDirective,
  DropTargetDirective
];

/**
 * @hidden
 */
@NgModule({
  declarations: [exported],
  exports     : [exported],
  providers   : [DragAndDropService, DragHintService, DropCueService]
})
export class DragAndDropModule {
}
