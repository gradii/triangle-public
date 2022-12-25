/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Directive, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { map, merge, Subscription } from 'rxjs';
import { TreeViewNode } from './data-source/tree-view.data-source.node';
import { ExpandableComponent } from './expandable-component';
import { FilterExpandSettings } from './filter-expand-settings.interface';
import { FilterState } from './filter-state.interface';
import { isChanged } from './helper/changes';
import { TreeItem } from './tree-item.interface';
import { isArrayWithAtLeastOneItem, isBoolean, sameValues } from './utils';

/** @hidden */
interface ExpandTreeItem extends TreeItem {
  expand: boolean;
}

const DEFAULT_FILTER_EXPAND_SETTINGS: FilterExpandSettings = {
  maxAutoExpandResults: -1,
  expandMatches       : false,
  expandedOnClear     : 'none'
};

@Directive({selector: '[triTreeViewExpandable]'})
export class TreeViewExpandableDirective implements OnDestroy, OnChanges {
  @Input('expandBy')
  expandKey: string | ((context: TreeItem) => any);

  /**
   * Whether or not to auto-expand the nodes leading from the root node to each filter result.
   * To fine-tune this behavior, pass a [`FilterExpandSettings`]({% slug api_tree-view_filterexpandsettings %}) object to this input.
   */
  @Input()
  expandOnFilter: boolean | FilterExpandSettings = false;

  @Input()
  expandedKeys: any[];

  /**
   * Fires when the `expandedKeys` collection was updated.
   */
  @Output()
  expandedKeysChange: EventEmitter<any[]> = new EventEmitter();

  subscriptions: Subscription = new Subscription();

  /**
   * Reflectes the internal `expandedKeys` state.
   */
  state: Set<string>        = new Set();
  originalExpandedKeys: any = new Set();
  isFiltered: boolean       = false;
  lastChange: any;

  /**
   * Fills array with the correct expand keys according to wrapper metadata.
   */
  updateExpandedNodes = (collection, node, autoExpandMatches) => {
    if (
      node.containsMatches ||
      node.isMatch && autoExpandMatches && isArrayWithAtLeastOneItem(node.children)
    ) {
      collection.push(this.itemKey({node: node.dataItem, uid: node.uid}));
    }
    if (isArrayWithAtLeastOneItem(node.children)) {
      node.children.forEach(child => {
        this.updateExpandedNodes(collection, child, autoExpandMatches);
      });
    }
  };

  /**
   * Fills array with the expand key of every node.
   */
  getEveryExpandKey = (collection, node) => {
    if (isArrayWithAtLeastOneItem(node.children)) {
      collection.push(this.itemKey({node: node.dataItem, uid: node.uid}));
    }
    if (isArrayWithAtLeastOneItem(node.children)) {
      node.children.forEach(child => {
        this.getEveryExpandKey(collection, child);
      });
    }
  };

  constructor(public component: ExpandableComponent) {
    this.subscriptions.add(
      merge(
        this.component.expand.pipe(
          map(e => (Object.assign({expand: true}, e)))
        ),
        this.component.collapse.pipe(
          map(e => (Object.assign({expand: false}, e)))
        )
      ).subscribe(
        this.toggleExpand.bind(this)
      )
    );
    if (this.component.filterStateChange) {
      this.subscriptions.add(
        this.component.filterStateChange.subscribe(this.handleAutoExpand.bind(this))
      );
    }
    this.component.isExpanded = (node: TreeViewNode, uid: string) => this.state.has(
      this.itemKey({node, uid}));
  }

  /**
   * @hidden
   */
  @Input()
  set isExpanded(value: (item: object, index: string) => boolean) {
    this.component.isExpanded = value;
  }

  get filterExpandSettings(): FilterExpandSettings {
    const settings = isBoolean(this.expandOnFilter) ?
      {enabled: this.expandOnFilter} :
      Object.assign({}, this.expandOnFilter, {enabled: true});
    return Object.assign({}, DEFAULT_FILTER_EXPAND_SETTINGS, settings);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (isChanged('expandedKeys', changes, false) &&
      changes.expandedKeys.currentValue !== this.lastChange) {
      this.state = new Set(changes.expandedKeys.currentValue);
    }
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  /**
   * @hidden
   */
  itemKey(e: TreeItem) {
    if (this.expandKey) {
      if (typeof this.expandKey === 'string') {
        return e.node[this.expandKey];
      }
      if (typeof this.expandKey === 'function') {
        return this.expandKey(e);
      }
    }
    return e.uid;
  }

  toggleExpand({uid, node, expand}: TreeItem & { expand: boolean }) {
    const key        = this.itemKey({uid, node: node});
    const isExpanded = this.state.has(key);
    let notify       = false;
    if (isExpanded && !expand) {
      this.state.delete(key);
      notify = true;
    } else if (!isExpanded && expand) {
      this.state.add(key);
      notify = true;
    }
    if (notify) {
      this.notify();
    }
  }

  handleAutoExpand({nodes, matchCount, term}: FilterState): any {
    if (!this.filterExpandSettings.enabled) {
      return;
    }
    const {
            maxAutoExpandResults,
            expandMatches: autoExpandMatches,
            expandedOnClear
          } = this.filterExpandSettings;
    if (!this.isFiltered) {
      this.originalExpandedKeys = new Set(this.state);
    }
    const exitingFilteredState  = this.isFiltered && !term;
    const maxExceeded           = maxAutoExpandResults !== -1 && matchCount > maxAutoExpandResults;
    const exitAutoExpandedState = exitingFilteredState || maxExceeded;
    if (exitAutoExpandedState) {
      switch (expandedOnClear) {
        case 'initial': {
          if (!sameValues(this.state, this.originalExpandedKeys)) {
            this.state = this.originalExpandedKeys;
            this.notify();
          }
          break;
        }
        case 'all': {
          this.state = new Set(nodes.reduce((acc, rootNode) => {
            this.getEveryExpandKey(acc, rootNode);
            return acc;
          }, []));
          this.notify();
          break;
        }
        case 'unchanged': {
          break;
        }
        case 'none':
        default: {
          if (this.state.size !== 0) {
            this.state.clear();
            this.notify();
          }
          break;
        }
      }
      this.isFiltered = false;
      return;
    }
    const indicesToExpand = new Set<string>(nodes.reduce((acc, rootNode) => {
      this.updateExpandedNodes(acc, rootNode, autoExpandMatches);
      return acc;
    }, []));
    if (!sameValues(this.state, indicesToExpand)) {
      this.state = indicesToExpand;
      this.notify();
    }
    this.isFiltered = true;
  }

  notify(): any {
    this.lastChange = Array.from(this.state);
    this.expandedKeysChange.emit(this.lastChange);
  }
}
