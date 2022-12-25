/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { BooleanInput } from '@angular/cdk/coercion';
import { Directive, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { isPresent } from '@gradii/nanofn';
import { Subscription } from 'rxjs';
import { isChanged } from '../helper/changes';
import { TreeItemLookup } from '../tree-item-lookup.interface';
import { TreeItem } from '../tree-item.interface';
import { TreeViewComponent } from '../tree-view.component';
import { isBoolean, noop } from '../utils';
import { SelectableSettings } from './selectable-settings';

@Directive({
  selector: '[triTreeViewSelectable]',
  host    : {
    '[attr.aria-multiselectable]': 'getAriaMultiselectable'
  }
})
export class SelectDirective implements OnDestroy, OnChanges {
  @Input('selectBy')
  selectKey: string | ((context: TreeItem) => any);

  @Input('triTreeViewSelectable')
  selection: boolean | SelectableSettings;

  @Input()
  selectedKeys: never[];

  /**
   * Fires when the `selectedKeys` collection was updated.
   */
  @Output()
  selectedKeysChange: EventEmitter<any[]> = new EventEmitter();

  subscriptions: Subscription = new Subscription();
  selectActions: any          = {
    'multiple': (e) => this.selectMultiple(e),
    'single'  : (e) => this.selectSingle(e)
  };

  /**
   * Reflectes the internal `selectedKeys` state.
   */
  state                       = new Set();
  lastChange: any;

  constructor(protected treeView: TreeViewComponent) {
    this.subscriptions.add(this.treeView.selectionChange.subscribe(this.select.bind(this)));
    // this.treeView.isSelected = (dataItem, index) => (this.state.has(
    //   this.itemKey({dataItem, index})));
  }

  /**
   * @hidden
   */
  @Input()
  set isSelected(value: (item: object, index: string) => boolean) {
    // this.treeView.isSelected = value;
  }

  get getAriaMultiselectable(): boolean {
    return this.options.mode === 'multiple';
  }

  get options(): {
    enabled: boolean,
    mode: 'single' | 'multiple' | string
  } {
    const defaultOptions = {
      enabled: true,
      mode   : 'single'
    };
    if (!isPresent(this.selection) || typeof this.selection === 'string') {
      return defaultOptions;
    }
    const selectionSettings = isBoolean(
      this.selection) ? {enabled: this.selection} : this.selection;
    return Object.assign(defaultOptions, selectionSettings);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (isChanged('selectedKeys', changes,
      false) && changes.selectedKeys.currentValue !== this.lastChange) {
      this.state = new Set(changes.selectedKeys.currentValue);
    }
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  itemKey(e: any) {
    if (!this.selectKey) {
      return e.index;
    }
    if (typeof this.selectKey === 'string') {
      return e.dataItem[this.selectKey];
    }
    if (typeof this.selectKey === 'function') {
      return this.selectKey(e);
    }
  }

  select(e: TreeItemLookup) {
    const {enabled, mode}  = this.options;
    const performSelection = this.selectActions[mode] || noop;
    if (!enabled) {
      return;
    }
    performSelection(e);
  }

  selectSingle(node: any) {
    const key = this.itemKey(node);
    if (!this.state.has(key)) {
      this.state.clear();
      this.state.add(key);
      this.notify();
    }
  }

  selectMultiple(node: any) {
    const key        = this.itemKey(node);
    const isSelected = this.state.has(key);
    if (!isPresent(key)) {
      return;
    }
    if (isSelected) {
      this.state.delete(key);
    } else {
      this.state.add(key);
    }
    this.notify();
  }

  notify(): any {
    this.lastChange = Array.from(this.state);
    this.selectedKeysChange.emit(this.lastChange);
  }

  static ngAcceptInputType_selection: BooleanInput | SelectableSettings;
}
