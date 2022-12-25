/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Directive, Input, OnDestroy } from '@angular/core';
import { isPresent } from '@gradii/nanofn';
import { Subscription } from 'rxjs';
import { TreeViewComponent } from '../tree-view.component';
import { EditService } from './models';

@Directive({
  selector: '[triTreeViewDragAndDropEditing]'
})
export class DragAndDropEditingDirective implements OnDestroy {
  subscriptions = new Subscription();

  constructor(public treeview: TreeViewComponent) {
    this.subscriptions.add(this.treeview.addItem.subscribe(this.handleAdd.bind(this)));
    this.subscriptions.add(this.treeview.removeItem.subscribe(this.handleRemove.bind(this)));
  }

  /**
   * Specifies the handlers called on drag-and-drop [`addItem`]({% slug api_treeview_treeviewcomponent %}#toc-additem)
   * and [`removeItem`]({% slug api_treeview_treeviewcomponent %}#toc-removeitem) events.
   */
  @Input()
  set editService(service: EditService) {
    this.treeview.editService = service;
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  handleAdd(args): any {
    if (!isPresent(this.treeview.editService)) {
      throw new Error(
        'No `editService` provided. Either provide your own implementation or use this directive in combination with one of the data binding directives (`kendoTreeViewHierarchyBinding` or `kendoTreeViewFlatDataBinding`).');
    }
    this.treeview.editService.add(args);
  }

  handleRemove(args): any {
    if (!isPresent(this.treeview.editService)) {
      throw new Error(
        'No `editService` provided. Either provide your own implementation or use this directive in combination with one of the data binding directives (`kendoTreeViewHierarchyBinding` or `kendoTreeViewFlatDataBinding`).');
    }
    this.treeview.editService.remove(args);
  }
}
