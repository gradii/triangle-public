/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Directive, Host, Input, OnChanges, OnInit, Optional, SimpleChanges } from '@angular/core';
import { isPresent } from '@gradii/nanofn';
import { getter } from '@gradii/nanofn';
import { of } from 'rxjs';
import { DataBoundComponent } from './data-bound-component';
import { DragAndDropDirective } from './drag-and-drop/drag-and-drop.directive';
import { HierarchyEditingService } from './drag-and-drop/editing-services/hierarchy-editing.service';
import { TreeItemFilterState } from './drag-and-drop/models/tree-item-filter-state';
import { FilteringBase } from './filtering-base';
import { anyChanged, isChanged } from './helper/changes';
import { IndexBuilderService } from './index-builder.service';
import { isArrayWithAtLeastOneItem } from './utils';

const indexBuilder = new IndexBuilderService();

export const mapToWrappers = (currentLevelNodes, childrenField, parent = null,
                              parentIndex                              = '') => {
  if (!isArrayWithAtLeastOneItem(currentLevelNodes)) {
    return [];
  }
  return currentLevelNodes.map((node, idx) => {
    const index                        = indexBuilder.nodeIndex(idx.toString(), parentIndex);
    const wrapper: TreeItemFilterState = {
      dataItem: node,
      index,
      parent,
      visible : true
    };
    wrapper.children                   = mapToWrappers(getter(node, childrenField), childrenField, wrapper, index);
    return wrapper;
  });
};

@Directive({selector: '[triTreeViewHierarchyBinding]'})
export class HierarchyBindingDirective extends FilteringBase implements OnInit, OnChanges {
  component: DataBoundComponent;
  dragAndDropDirective: any;

  @Input()
  loadOnDemand: boolean;
  originalData: any;

  constructor(component: DataBoundComponent,
              @Optional() @Host() dragAndDropDirective: DragAndDropDirective) {
    super(component);
    this.component            = component;
    this.dragAndDropDirective = dragAndDropDirective;
    /**
     * @hidden
     */
    this.loadOnDemand = true;
    this.originalData        = [];
    const shouldFilter       = !isPresent(this.dragAndDropDirective);
    // this.component.isVisible = shouldFilter ? (node) => this.visibleNodes.has(node) : isVisible;
  }

  _childrenField: any;

  /**
   * The field name which holds the data items of the child component.
   */
  // @Input()
  get childrenField(): string {
    return this._childrenField;
  }

  /**
   * The field name which holds the data items of the child component.
   */
  set childrenField(value: string) {
    if (!value) {
      throw new Error(`'childrenField' cannot be empty`);
    }
    this._childrenField = value;
  }

  /**
   * The nodes which will be displayed by the TreeView.
   */
  @Input()
  set nodes(values: any[]) {
    this.originalData = values || [];
    this.filterData   = mapToWrappers(values, this.childrenField) || [];
    this.updateVisibleNodes(this.filterData);
  }

  // /**
  //  * @hidden
  //  * A callback which determines whether a TreeView node should be rendered as hidden.
  //  */
  // @Input()
  // set isVisible(fn: (item: object, index: string) => boolean) {
  //   // this.component.isVisible = fn;
  // }

  ngOnInit() {
    if (isPresent(this.childrenField)) {
      // this.component.children    = item => of(getter(item, this.childrenField));
      // this.component.hasChildren = item => {
      //   const children = getter(item, this.childrenField);
      //   return Boolean(children && children.length);
      // };
      this.component.editService = new HierarchyEditingService(this);
      this.component.filterChange.subscribe(this.handleFilterChange.bind(this));
      if (this.component.filter) {
        this.handleFilterChange(this.component.filter);
      }
      if (!this.loadOnDemand && isPresent(this.component.preloadChildNodes)) {
        this.component.preloadChildNodes();
      }
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (isChanged('childrenField', changes, false)) {
      this.nodes = this.originalData;
    }
    // should react to changes.loadOnDemand as well - should preload the data or clear the already cached items
    if (anyChanged(['nodes', 'loadOnDemand'], changes) &&
      !this.loadOnDemand &&
      isPresent(this.component.preloadChildNodes)
    ) {
      this.component.preloadChildNodes();
    }
  }
}
