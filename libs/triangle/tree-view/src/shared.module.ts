/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TriCheckboxModule } from '@gradii/triangle/checkbox';
import { TriIconModule } from '@gradii/triangle/icon';
import { TriInputModule } from '@gradii/triangle/input';
import { TreeViewCheckableDirective } from './tree-view-checkable.directive';
import { TreeViewDisableDirective } from './tree-view-disable.directive';
import { DragAndDropEditingDirective } from './drag-and-drop/drag-and-drop-editing.directive';
import { DragAndDropDirective } from './drag-and-drop/drag-and-drop.directive';
import { DragClueTemplateDirective } from './drag-and-drop/drag-clue/drag-clue-template.directive';
import { DragClueComponent } from './drag-and-drop/drag-clue/drag-clue.component';
import { DropHintTemplateDirective } from './drag-and-drop/drop-hint/drop-hint-template.directive';
import { DropHintComponent } from './drag-and-drop/drop-hint/drop-hint.component';
import { TreeViewExpandableDirective } from './tree-view-expandable.directive';
import { FlatDataBindingDirective } from './flat-binding.directive';
import { HierarchyBindingDirective } from './hierarchy-binding.directive';
import { LoadMoreButtonTemplateDirective } from './load-more/load-more-button-template.directive';
import { LoadMoreDirective } from './load-more/load-more.directive';
import { LoadingIndicatorDirective } from './loading-indicator.directive';
import { NodeTemplateDirective } from './node-template.directive';
import { SelectDirective } from './selection/select.directive';
import { TreeViewGroupComponent } from './tree-view-group.component';
import { TreeViewItemContentDirective } from './tree-view-item-content.directive';
import { TreeViewItemDirective } from './tree-view-item.directive';
import { TreeViewComponent } from './tree-view.component';

const COMPONENT_DIRECTIVES = [
    TreeViewComponent,
    TreeViewGroupComponent,
    TreeViewItemDirective,
    TreeViewItemContentDirective,
    NodeTemplateDirective,
    TreeViewCheckableDirective,
    TreeViewDisableDirective,
    TreeViewExpandableDirective,
    SelectDirective,
    HierarchyBindingDirective,
    LoadingIndicatorDirective,
    FlatDataBindingDirective,
    DragAndDropDirective,
    DragClueTemplateDirective,
    DragClueComponent,
    DropHintTemplateDirective,
    DropHintComponent,
    DragAndDropEditingDirective,
    LoadMoreDirective,
    LoadMoreButtonTemplateDirective,
];

@NgModule({
  declarations: [COMPONENT_DIRECTIVES],
  exports     : [COMPONENT_DIRECTIVES],
  imports     : [
    CommonModule,
    FormsModule,
    TriInputModule,
    TriCheckboxModule,
    TriIconModule,
  ],
})
export class SharedModule {
}
