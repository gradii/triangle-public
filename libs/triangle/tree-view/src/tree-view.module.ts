/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { NgModule } from '@angular/core';
import { DragAndDropEditingDirective } from './drag-and-drop/drag-and-drop-editing.directive';
import { DragAndDropDirective } from './drag-and-drop/drag-and-drop.directive';
import { DragClueTemplateDirective } from './drag-and-drop/drag-clue/drag-clue-template.directive';
import { DropHintTemplateDirective } from './drag-and-drop/drop-hint/drop-hint-template.directive';
import { FlatDataBindingDirective } from './flat-binding.directive';
import { HierarchyBindingDirective } from './hierarchy-binding.directive';
import { LoadMoreButtonTemplateDirective } from './load-more/load-more-button-template.directive';
import { LoadMoreDirective } from './load-more/load-more.directive';
import { NodeTemplateDirective } from './node-template.directive';
import { SelectDirective } from './selection/select.directive';
import { SharedModule } from './shared.module';
import { TreeViewCheckableDirective } from './tree-view-checkable.directive';
import { TreeViewDisableDirective } from './tree-view-disable.directive';
import { TreeViewExpandableDirective } from './tree-view-expandable.directive';
import { TreeViewComponent } from './tree-view.component';

const EXPORTS = [
  TreeViewComponent,
  NodeTemplateDirective,
  TreeViewCheckableDirective,
  TreeViewDisableDirective,
  TreeViewExpandableDirective,
  SelectDirective,
  HierarchyBindingDirective,
  FlatDataBindingDirective,
  DragAndDropDirective,
  DragClueTemplateDirective,
  DropHintTemplateDirective,
  DragAndDropEditingDirective,
  LoadMoreDirective,
  LoadMoreButtonTemplateDirective
];




/**
 * # TreeView
 *
 * ### When To Use
 *
 * ### Doc Examples
 *
 * <!-- example(tree-view:tree-view-basic-example) -->
 * <!-- example(tree-view:tree-view-check-example) -->
 * <!-- example(tree-view:tree-view-check-on-click-example) -->
 * <!-- example(tree-view:tree-view-disable-example) -->
 * <!-- example(tree-view:tree-view-drag-drop-example) -->
 * <!-- example(tree-view:tree-view-filter-example) -->
 * <!-- example(tree-view:tree-view-flat-example) -->
 * <!-- example(tree-view:tree-view-lazy-load-example) -->
 * <!-- example(tree-view:tree-view-select-example) -->
 */
@NgModule({
  exports: [EXPORTS],
  imports: [SharedModule]
})
export class TriTreeViewModule {
}
