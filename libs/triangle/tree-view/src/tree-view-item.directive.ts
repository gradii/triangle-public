/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import {
  Directive, ElementRef, Input, OnChanges, OnDestroy, OnInit, Renderer2, SimpleChange, SimpleChanges
} from '@angular/core';
import { isPresent } from '@gradii/nanofn';
import { CheckboxState } from '@gradii/triangle/checkbox';
import { filter } from 'rxjs';
import { TreeViewNode } from './data-source/tree-view.data-source.node';
import { ExpandStateService } from './expand-state.service';
import { anyChanged } from './helper/changes';
import { IndexBuilderService } from './index-builder.service';
import { NavigationService } from './navigation/navigation.service';
import { SelectionService } from './selection/selection.service';
import { TreeItem } from './tree-item.interface';
import { TreeViewLookupService } from './tree-view-lookup.service';

export const buildItem: (uid: string, node: TreeViewNode) => TreeItem = (uid, node) => ({node, uid: uid});

let id               = 0;
const TREE_ITEM_ROLE = 'treeitem';
const BUTTON_ROLE    = 'button';

@Directive({selector: '[triTreeViewItem]'})
export class TreeViewItemDirective implements OnInit, OnChanges, OnDestroy {

  @Input()
  node: TreeViewNode;

  @Input()
  uid: string;

  /**
   * @deprecated
   */
  @Input()
  index: string;

  @Input()
  parentNode: TreeViewNode;

  @Input()
  parentUid: string;

  /**
   * @deprecated
   */
  @Input()
  parentIndex: string;

  @Input()
  role: string;

  @Input()
  loadOnDemand: boolean;

  @Input()
  checkable: boolean;

  @Input()
  selectable: boolean;

  @Input()
  expandable: boolean;

  @Input()
  isDisabled: boolean;

  @Input()
  isVisible: boolean;
  ariaChecked: string;
  readonly id: number;
  isInitialized: any;
  subscriptions: any;


  constructor(public element: ElementRef,
              public expandService: ExpandStateService,
              public navigationService: NavigationService,
              public selectionService: SelectionService,
              public lookupService: TreeViewLookupService,
              public renderer: Renderer2,
              public ib: IndexBuilderService
  ) {
    this.role          = TREE_ITEM_ROLE;
    this.loadOnDemand  = true;
    this.isDisabled    = false;
    this.isVisible     = true;
    this.ariaChecked   = 'false';
    this.id            = id++;
    this.isInitialized = false;
    this.subscriptions = [];
    this.subscribe();
  }

  _isExpanded: any;

  @Input()
  get isExpanded(): boolean {
    return this._isExpanded || false;
  }

  set isExpanded(isExpanded: boolean) {
    this._isExpanded = isExpanded;
  }

  _isSelected: any;

  @Input()
  get isSelected(): boolean {
    return this._isSelected || false;
  }

  set isSelected(isSelected: boolean) {
    this._isSelected = isSelected;
  }

  @Input()
  set isChecked(checked: CheckboxState) {
    if (checked === 'checked') {
      this.ariaChecked = 'true';
    } else if (checked === 'indeterminate') {
      this.ariaChecked = 'mixed';
    } else {
      this.ariaChecked = 'false';
    }
  }

  get isButton(): boolean {
    return this.role === BUTTON_ROLE;
  }

  get treeItem(): TreeItem {
    return buildItem(this.uid, this.node);
  }

  get parentTreeItem(): TreeItem {
    return this.parentNode ? buildItem(this.parentUid, this.parentNode) : null;
  }

  ngOnInit() {
    if (this.loadOnDemand && !this.isButton) {
      this.lookupService.registerItem(this.treeItem, this.parentTreeItem);
    }
    this.registerNavigationItem();
    this.isInitialized = true;
    this.setAttribute('role', this.role);
    this.setAriaAttributes();
    this.setDisabledClass();
    this.updateTabIndex();
  }

  ngOnChanges(changes: SimpleChanges) {
    const {uid, isDisabled} = changes;
    if (anyChanged(
      [
        'index', 'checkable', 'isChecked', 'expandable', 'isExpanded', 'selectable', 'isSelected'
      ],
      changes)) {
      this.setAriaAttributes();
    }
    if (isDisabled) {
      this.setDisabledClass();
    }
    if (this.loadOnDemand && !this.isButton) {
      this.moveLookupItem(changes);
    }
    this.moveNavigationItem(uid);
    if (anyChanged(['isDisabled', 'isVisible'], changes)) {
      this.updateNodeAvailability();
    }
  }

  ngOnDestroy() {
    this.navigationService.unregisterItem(this.id, this.uid);
    if (this.loadOnDemand && !this.isButton) {
      this.lookupService.unregisterItem(this.uid, this.node);
    }
    this.subscriptions = this.subscriptions.reduce(
      (list, callback) => (callback.unsubscribe(), list), []);
  }

  subscribe() {
    this.subscriptions = [
      this.navigationService.moves
        .subscribe(() => {
          this.updateTabIndex();
          this.focusItem();
        }),
      this.navigationService.expands
        .pipe(filter(({uid}) => uid === this.uid && !this.isDisabled))
        .subscribe(({expand}) => this.expand(expand))
    ];
  }

  registerNavigationItem(): any {
    this.navigationService.registerItem(
      this.id, this.uid, this.parentUid, this.isDisabled, this.isButton,
      this.isVisible
    );
    this.activateItem();
  }

  activateItem(): any {
    if (this.isDisabled) {
      return;
    }
    const navigationService = this.navigationService;
    const selectionService  = this.selectionService;
    const uid               = this.uid;
    selectionService.setFirstSelected(uid, this.isSelected);
    if (!navigationService.isActive(uid) && selectionService.isFirstSelected(uid)) {
      navigationService.activateUid(uid);
    }
  }

  expand(shouldExpand): any {
    this.node.expandNode(shouldExpand);
  }

  isFocusable(): any {
    return !this.isDisabled && this.navigationService.isFocusable(this.uid);
  }

  focusItem(): any {
    if (this.isInitialized && this.navigationService.isActive(this.uid)) {
      this.element.nativeElement.focus();
    }
  }

  moveLookupItem(changes: SimpleChanges = {}): any {
    const {dataItem, index, parentDataItem, parentIndex} = changes;
    if ((index && index.firstChange) || // skip first change
      (!dataItem && !index && !parentDataItem && !parentIndex)) {
      return;
    }
    const oldIndex = (index || {}).previousValue || this.index;
    this.lookupService.replaceItem(oldIndex, this.treeItem, this.parentTreeItem);
  }

  moveNavigationItem(uidChange: any = {}): any {
    const {currentValue, firstChange, previousValue} = uidChange as SimpleChange;
    if (!firstChange && isPresent(currentValue) && isPresent(previousValue)) {
      this.navigationService.unregisterItem(this.id, previousValue);
      this.navigationService.registerItem(this.id, currentValue, this.parentUid, this.isDisabled, this.isButton);
    }
  }

  updateNodeAvailability(): any {
    const service = this.navigationService;
    if (this.isDisabled || !this.isVisible) {
      service.activateClosest(this.uid); // activate before unregister the item
    } else {
      service.activateFocusable();
    }
    service.unregisterItem(this.id, this.uid);
    service.registerItem(this.id, this.uid, this.parentUid, this.isDisabled, this.isButton, this.isVisible);
  }

  setAriaAttributes(): any {
    // this.setAttribute('aria-level', this.ib.level(this.index).toString());
    // don't render attributes when the component configuration doesn't allow the specified state
    this.setAttribute('aria-expanded', this.expandable ? this.isExpanded.toString() : null);
    this.setAttribute('aria-selected', this.selectable ? this.isSelected.toString() : null);
    this.setAttribute('aria-checked', this.checkable ? this.ariaChecked : null);
  }

  setDisabledClass(): any {
    this.setClass('tri-disabled', this.isDisabled);
  }

  setClass(className, toggle): any {
    const action = toggle ? 'addClass' : 'removeClass';
    this.renderer[action](this.element.nativeElement, className);
  }

  updateTabIndex(): any {
    this.setAttribute('tabIndex', this.isFocusable() ? '0' : '-1');
  }

  setAttribute(attr, value): any {
    if (!isPresent(value)) {
      this.renderer.removeAttribute(this.element.nativeElement, attr);
      return;
    }
    this.renderer.setAttribute(this.element.nativeElement, attr, value);
  }
}
