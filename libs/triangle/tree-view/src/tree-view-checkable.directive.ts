/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Directive, EventEmitter, Input, NgZone, OnChanges, OnDestroy, Output } from '@angular/core';
import { isPresent } from '@gradii/nanofn';
import { CheckboxState } from '@gradii/triangle/checkbox';
import { filter, Subscription, switchMap, take, tap } from 'rxjs';
import { CheckableSettings } from './checkable-settings';
import { DataBoundComponent } from './data-bound-component';
import { isChanged } from './helper/changes';
import { TreeItemLookup } from './tree-item-lookup.interface';
import { TreeItem } from './tree-item.interface';
import { TreeViewComponent } from './tree-view.component';
import { isBoolean, noop } from './utils';

export const indexChecked = (keys, index) => keys.filter(k => k === index).length > 0;
export const matchKey     = index => k => {
  if (index === k) {
    return true;
  }
  if (!k.split) {
    return false;
  }
  return k.split('_').reduce(({key, result}, part) => {
    key += part;
    if (index === key || result) {
      return {result: true};
    }
    key += '_';
    return {key, result: false};
  }, {key: '', result: false}).result;
};

@Directive({selector: '[triTreeViewCheckable]'})
export class TreeViewCheckableDirective implements OnChanges, OnDestroy {
  treeView: TreeViewComponent;
  zone: any;

  @Input('checkBy')
  checkKey: string | ((context: TreeItem) => any);

  @Input()
  checkedKeys: any[];

  @Input('triTreeViewCheckable')
  checkable: string | boolean | CheckableSettings;

  /**
   * Fires when the `checkedKeys` collection was updated.
   */
  @Output()
  checkedKeysChange: EventEmitter<any[]> = new EventEmitter();

  subscriptions: Subscription;
  checkActions: any;
  state: Set<any>;
  clickSubscription: any;
  lastChange: any;

  constructor(treeView: DataBoundComponent, zone: NgZone) {
    this.treeView = treeView as TreeViewComponent;
    this.zone     = zone;

    this.subscriptions = new Subscription();
    this.checkActions  = {
      'multiple': (e) => this.checkMultiple(e),
      'single'  : (e) => this.checkSingle(e)
    };
    /**
     * Reflectes the internal `checkedKeys` state.
     */
    this.state = new Set();
    this.subscriptions.add(this.treeView.checkedChange
      .subscribe((e) => this.check(e)));
    const expandedItems = [];
    this.subscriptions.add(this.treeView.childrenLoaded
      .pipe(filter(() => this.options.checkChildren && this.treeView.loadOnDemand),
        tap(item => expandedItems.push(item)), switchMap(() => this.zone.onStable.pipe(take(1))))
      .subscribe(() => this.addCheckedItemsChildren(expandedItems)));
    // this.treeView.isChecked = this.isItemChecked.bind(this);
  }

  /**
   * @hidden
   */
  @Input()
  set isChecked(value: (item: object, index: string) => CheckboxState) {
    // this.treeView.isChecked = value;
  }

  get options(): any {
    const defaultOptions = {
      checkChildren: true,
      checkParents : true,
      enabled      : true,
      mode         : 'multiple'
    };
    if (!isPresent(this.checkable) || typeof this.checkable === 'string') {
      return defaultOptions;
    }
    const checkSettings = isBoolean(this.checkable)
      ? {enabled: this.checkable}
      : this.checkable;
    return Object.assign(defaultOptions, checkSettings);
  }

  ngOnChanges(changes: any) {
    if (changes.checkable) {
      this.treeView.checkable = this.options.enabled;
      this.toggleCheckOnClick();
    }
    if (
      isChanged('checkedKeys', changes, false) &&
      changes.checkedKeys.currentValue !== this.lastChange
    ) {
      this.state = new Set(changes.checkedKeys.currentValue);
    }
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    this.unsubscribeClick();
  }

  isItemChecked(dataItem: any, uid: string): CheckboxState {
    if (!this.checkKey) {
      return this.isIndexChecked(uid);
    }
    const hasKey = this.state.has(this.itemKey({node: dataItem, uid}));
    return hasKey ? 'checked' : 'unchecked';
  }

  isIndexChecked(index: string): CheckboxState {
    const checkedKeys = Array.from(this.state).filter(matchKey(index));
    if (indexChecked(checkedKeys, index)) {
      return 'checked';
    }
    const {mode, checkParents} = this.options;
    if (mode === 'multiple' && checkParents && checkedKeys.length) {
      return 'indeterminate';
    }
    return 'unchecked';
  }

  itemKey(item: TreeItem) {
    if (!isPresent(this.checkKey)) {
      return item.uid;
    }
    if (typeof this.checkKey === 'string' && isPresent(item.node)) {
      return item.node[this.checkKey];
    }
    if (typeof this.checkKey === 'function') {
      return this.checkKey(item);
    }
  }

  check(e: TreeItemLookup) {
    const {enabled, mode}  = this.options;
    const performSelection = this.checkActions[mode] || noop;
    if (!enabled) {
      return;
    }
    performSelection(e);
  }

  checkSingle(node: any) {
    const key    = this.itemKey(node.item);
    const hasKey = this.state.has(key);
    this.state.clear();
    if (!hasKey) {
      this.state.add(key);
    }
    this.notify();
  }

  checkMultiple(node: TreeItemLookup) {
    // this.checkNode(node);
    if (this.options.checkParents) {
      this.checkParents(node.parent);
    }
    this.notify();
  }

  toggleCheckOnClick() {
    this.unsubscribeClick();
    if (this.options.checkOnClick) {
      this.clickSubscription = this.treeView.nodeClick.subscribe(args => {
        if (args.type === 'click') {
          const lookup = this.treeView.itemLookup(args.item.uid);
          this.check(lookup);
        }
      });
    }
  }

  unsubscribeClick(): any {
    if (this.clickSubscription) {
      this.clickSubscription.unsubscribe();
      this.clickSubscription = null;
    }
  }
/*
  checkNode(node: TreeItemLookup): any {
    if (!isPresent(node.item.dataItem) || this.treeView.isDisabled(node.item.dataItem, node.item.index)) {
      return;
    }
    const currentKey = this.itemKey(node.item);
    if (!isPresent(currentKey)) {
      return;
    }
    const pendingCheck = [currentKey];
    if (this.options.checkChildren) {
      const descendants = fetchLoadedDescendants(
        node, ({item}) => this.treeView.isVisible(item.dataItem, item.index) &&
          !this.treeView.isDisabled(item.dataItem, item.index)
      ).map(({item}) => this.itemKey(item));
      pendingCheck.push(...descendants);
    }
    const shouldCheck = !this.state.has(currentKey);
    pendingCheck.forEach(key => {
      if (shouldCheck) {
        this.state.add(key);
      } else {
        this.state.delete(key);
      }
    });
  }*/

  checkParents(parent): any {
    if (!isPresent(parent)) {
      return;
    }
    let currentParent = parent;
    while (currentParent) {
      const parentKey           = this.itemKey(currentParent.item);
      const allChildrenSelected = currentParent.children.every(
        item => this.state.has(this.itemKey(item)));
      if (allChildrenSelected) {
        this.state.add(parentKey);
      } else {
        this.state.delete(parentKey);
      }
      currentParent = currentParent.parent;
    }
  }

  notify(): any {
    this.lastChange = Array.from(this.state);
    this.checkedKeysChange.emit(this.lastChange);
  }

  addCheckedItemsChildren(lookups): any {
   /* if (!isPresent(lookups) || lookups.length === 0) {
      return;
    }
    const initiallyCheckedItemsCount = this.state.size;
    lookups.forEach(lookup => {
      const itemKey = this.itemKey(lookup.item);
      if (!this.state.has(itemKey)) {
        return;
      }
      lookup.children.forEach(item => {
        // ensure both the parent item and each child node is enabled
        if (!this.treeView.isDisabled(lookup.item.dataItem, lookup.item.index) &&
          !this.treeView.isDisabled(item.dataItem, item.index)) {
          this.state.add(this.itemKey(item));
        }
      });
    });
    const hasNewlyCheckedItems = initiallyCheckedItemsCount !== this.state.size;
    if (hasNewlyCheckedItems) {
      this.zone.run(() => this.notify());
    }*/
  }
}
