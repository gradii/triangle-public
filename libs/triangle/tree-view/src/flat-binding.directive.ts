/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Directive, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { isPresent } from '@gradii/nanofn';
import { getter } from '@gradii/triangle/data-query';
import { of } from 'rxjs';
import { DataBoundComponent } from './data-bound-component';
import { FlatEditingService } from './drag-and-drop/editing-services/flat-editing.service';
import { TreeItemFilterState } from './drag-and-drop/models/tree-item-filter-state';
import { FilteringBase } from './filtering-base';
import { compose } from './funcs';
import { anyChanged, isChanged } from './helper/changes';
import { IndexBuilderService } from './index-builder.service';
import { isArrayWithAtLeastOneItem, isBlank, isNullOrEmptyString } from './utils';

export const findChildren = (prop, nodes, value) => nodes.filter((x) => prop(x) === value);
const indexBuilder        = new IndexBuilderService();

export const mapToTree = (currentLevelNodes, allNodes, parentIdField, idField, parent = null,
                          parentIndex                                                 = '') => {
  if (!isArrayWithAtLeastOneItem(currentLevelNodes)) {
    return [];
  }
  return currentLevelNodes.map((node, idx) => {
    const index = indexBuilder.nodeIndex(idx.toString(), parentIndex);

    const wrapper: TreeItemFilterState = {
      dataItem: node,
      index,
      parent,
      visible : true
    };

    wrapper.children = mapToTree(
      findChildren(getter(parentIdField), allNodes || [], getter(idField)(node)), allNodes,
      parentIdField, idField, wrapper, index);
    return wrapper;
  });
};

@Directive({selector: '[triTreeViewFlatDataBinding]'})
export class FlatDataBindingDirective extends FilteringBase implements OnInit, OnChanges {
  component: DataBoundComponent;

  @Input()
  parentIdField: string;

  @Input()
  idField: string;

  @Input()
  loadOnDemand: boolean;
  originalData: any[];

  constructor(component: DataBoundComponent) {
    super(component);
    this.component = component;
    /**
     * @hidden
     */
    this.loadOnDemand = true;
    /**
     * @hidden
     */
    this.originalData = [];
    // this.component.isVisible = (node) => this.visibleNodes.has(node);
  }

  /**
   * The nodes which will be displayed by the TreeView.
   */
  @Input()
  set nodes(values: any[]) {
    // this.originalData = values || [];
    // if (!isNullOrEmptyString(this.parentIdField)) {
    //   const prop           = getter(this.parentIdField);
    //   this.component.dataSource = this.originalData.filter(compose(isBlank, prop));
    //   this.filterData           = mapToTree(this.component.dataSource, this.originalData, this.parentIdField,
    //     this.idField);
    //   this.updateVisibleNodes(this.filterData);
    // } else {
    //   this.component.dataSource = this.originalData.slice(0);
    // }
  }

  /**
   * @hidden
   * A callback which determines whether a TreeView node should be rendered as hidden.
   */
  // @Input()
  set isVisible(fn: (item: object, index: string) => boolean) {
    // this.component.isVisible = fn;
  }

  /**
   * @hidden
   */
  ngOnInit() {
    if (isPresent(this.parentIdField) && isPresent(this.idField)) {
      const fetchChildren        = (node) => findChildren(getter(this.parentIdField),
        this.originalData || [], getter(this.idField)(node));
      // this.component.hasChildren = (node) => fetchChildren(node).length > 0;
      // this.component.children    = (node) => of(fetchChildren(node));
      this.component.editService = new FlatEditingService(this);
      this.component.filterChange.subscribe(this.handleFilterChange.bind(this));
      if (this.component.filter) {
        this.handleFilterChange(this.component.filter);
      }
      if (!this.loadOnDemand && isPresent(this.component.preloadChildNodes)) {
        this.component.preloadChildNodes();
      }
    }
  }

  /**
   * @hidden
   */
  ngOnChanges(changes: SimpleChanges) {
    if (isChanged('parentIdField', changes, false)) {
      this.nodes = this.originalData;
    }
    // should react to changes.loadOnDemand as well - should preload the data or clear the already cached items
    if (anyChanged(['nodes', 'loadOnDemand'], changes) && !this.loadOnDemand && isPresent(
      this.component.preloadChildNodes)) {
      this.component.preloadChildNodes();
    }
  }
}
