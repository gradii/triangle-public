/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { CdkScrollableModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TriDrag } from './directives/drag';
import { TriDragContainer } from './directives/drag-container';
import { TriDropFreeContainer } from './directives/drop-free-container';
import { TriDragHandle } from './directives/drag-handle';
import { TriDragPlaceholder } from './directives/drag-placeholder';
import { TriDragPreview } from './directives/drag-preview';
import { TriDropContainerGroup } from './directives/drop-container-group';
import { TriDropFlexContainer } from './directives/drop-flex-container';
import { TriDropGridContainer } from './directives/drop-grid-container';
import { TriDropListContainer } from './directives/drop-list-container';
import { TriResize } from './directives/resize';
import { TriResizeHandle } from './directives/resize-handle';
import { TriResizePlaceholder } from './directives/resize-placeholder';
import { TriResizePreview } from './directives/resize-preview';
import { DragDrop } from './drag-drop';
import { TriDragGridItemComponent } from './drag-grid/drag-grid-item.component';
import { GridResizeDirective } from './drag-grid/grid-resize.directive';

/**
 * ## dnd
 *
 * #### examples
 *
 * <!-- example(dnd:dnd-child-example) -->
 * <!-- example(dnd:dnd-structure-example) -->
 * <!-- example(dnd:dnd-placeholder-example) -->
 * <!-- example(dnd:dnd-not-cdk-example) -->
 * <!-- example(dnd:dnd-nest-example) -->
 * <!-- example(dnd:dnd-grid-resize-example) -->
 * <!-- example(dnd:dnd-grid-example) -->
 * <!-- example(dnd:dnd-flex-row-example) -->
 * <!-- example(dnd:dnd-flex-column-example) -->
 * <!-- example(dnd:dnd-drag-container-example) -->
 */
@NgModule({
  imports     : [
    CommonModule,
  ],
  declarations: [
    TriDropListContainer,
    TriDropContainerGroup,
    TriDropFlexContainer,
    TriDropGridContainer,

    TriDragContainer,
    TriDropFreeContainer,
    TriDrag,
    TriDragHandle,
    TriDragPreview,
    TriDragPlaceholder,
    TriDragGridItemComponent,

    TriResize,
    TriResizeHandle,
    TriResizePreview,
    TriResizePlaceholder,

    GridResizeDirective
  ],
  exports     : [
    CdkScrollableModule,
    TriDropListContainer,
    TriDropContainerGroup,
    TriDrag,
    TriDragHandle,
    TriDragPreview,
    TriDragPlaceholder,
    TriDropGridContainer,
    TriDragContainer,
    TriDropFreeContainer,
    TriDragGridItemComponent,
    TriDropFlexContainer,

    TriResize,
    TriResizeHandle,
    TriResizePreview,
    TriResizePlaceholder,

    GridResizeDirective
  ],
  providers   : [
    DragDrop,
  ]
})
export class TriDndModule {
}
