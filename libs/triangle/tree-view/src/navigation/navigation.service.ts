/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Directionality } from '@angular/cdk/bidi';
import { Injectable } from '@angular/core';
import { isPresent } from '@gradii/nanofn';
import { Subject } from 'rxjs';
import { Keys } from '../helper/keys';
import { nodeIndex } from '../utils';
import { NavigationItem } from './navigation-item.interface';
import { NavigationModel } from './navigation-model';
import { NavigationState } from './navigation-state.interface';

@Injectable()
export class NavigationService {
  readonly expands: Subject<NavigationState> = new Subject();
  readonly moves: Subject<NavigationState>   = new Subject();
  readonly checks: Subject<string>           = new Subject();
  readonly selects: Subject<string>          = new Subject();
  readonly loadMore: Subject<string>         = new Subject();

  navigable: boolean = true;
  actions: { [x: string]: () => void; } = {
    [Keys.ArrowUp]   : () => this.activate(this.model.findVisiblePrev(this.focusableItem)),
    [Keys.ArrowDown] : () => this.activate(this.model.findVisibleNext(this.focusableItem)),
    [Keys.ArrowLeft] : () =>
      !this.isLoadMoreButton &&
      this.directionality.value === 'rtl' ? this._navigateToRight() : this._navigateToLeft(),
    [Keys.ArrowRight]: () =>
      !this.isLoadMoreButton &&
      this.directionality.value === 'rtl' ? this._navigateToLeft() : this._navigateToRight(),
    [Keys.Home]      : () => this.activate(this.model.firstVisibleNode()),
    [Keys.End]       : () => this.activate(this.model.lastVisibleNode()),
    [Keys.Enter]     : () => this.handleEnter(),
    [Keys.Space]     : () => this.handleSpace()
  };

  activeItem: NavigationItem;
  isFocused: boolean = false;

  constructor(protected directionality: Directionality) {
  }

  _model: NavigationModel = new NavigationModel();

  get model(): NavigationModel {
    return this._model;
  }

  set model(model: NavigationModel) {
    this._model = model;
  }

  /**
   * @deprecated
   */
  get activeIndex(): any {
    return nodeIndex(this.activeItem) || null;
  }

  get activeUid(): any {
    return this.activeItem.uid || null;
  }


  get isActiveExpanded(): any {
    return this.activeItem && this.activeItem.children.length > 0;
  }

  get isLoadMoreButton(): any {
    return this.activeItem && this.activeItem.loadMoreButton;
  }

  get focusableItem(): NavigationItem {
    return this.activeItem || this.model.firstFocusableNode();
  }

  _navigateToRight() {
    if (this.moveToFirstVisibleChild()) {
      return;
    }
    this.expand(true);
  }

  _navigateToLeft() {
    if (this.moveToParent()) {
      return;
    }
    this.expand(false);
  }

  activate(item: NavigationItem) {
    if (!this.navigable || !item || this.isActive(item.uid)) {
      return;
    }
    this.isFocused = true;
    this.activeItem = item || this.activeItem;
    this.notifyMove();
  }

  activateParent(uid: string) {
    this.activate(this.model.findParent(uid));
  }

  /**
   * @param uid
   */
  activateUid(uid: string) {
    if (!uid) {
      return;
    }
    this.activate(this.model.findNode(uid));
  }

  activateClosest(uid: string) {
    if (!uid || this.focusableItem.uid !== uid) {
      return;
    }
    this.activeItem = this.model.closestNode(uid);
    this.notifyMove();
  }

  activateFocusable() {
    if (this.activeItem) {
      return;
    }
    this.activeItem = this.model.firstVisibleNode();
    this.notifyMove();
  }

  deactivate() {
    if (!this.navigable || !this.isFocused) {
      return;
    }
    this.isFocused = false;
    this.notifyMove();
  }

  checkUid(uid: string) {
    if (!this.isDisabled(uid)) {
      this.checks.next(uid);
    }
  }

  /**
   * @param uid
   */
  selectUid(uid: string) {
    if (!this.isDisabled(uid)) {
      this.selects.next(uid);
    }
  }

  notifyLoadMore(uid: string) {
    if (!isPresent(uid)) {
      return;
    }
    this.loadMore.next(uid);
  }

  isActive(uid: string) {
    if (!uid) {
      return false;
    }
    return this.isFocused && this.activeUid === uid;
  }

  isFocusable(uid: string) {
    return this.focusableItem.uid === uid;
  }

  isDisabled(uid: string) {
    return this.model.findNode(uid).disabled;
  }

  registerItem(id: number, uid: string,
               parentUid: string, disabled: boolean,
               loadMoreButton: boolean = false,
               visible: boolean        = true) {
    const itemByUid = this.model.findNode(uid);
    if (isPresent(itemByUid)) {
      this.model.unregisterItem(itemByUid.id, itemByUid.uid);
      if (this.isActive(uid)) {
        this.deactivate();
      }
    }
    this.model.registerItem(id, uid, parentUid, disabled, loadMoreButton, visible);
  }

  unregisterItem(id: number, uid: string) {
    if (this.isActive(uid)) {
      this.activateParent(uid);
    }
    this.model.unregisterItem(id, uid);
  }

  move(e: KeyboardEvent) {
    if (!this.navigable) {
      return;
    }
    const moveAction = this.actions[e.keyCode];
    if (!moveAction) {
      return;
    }
    moveAction();
    e.preventDefault();
  }

  expand(expand: boolean): any {
    const uid = this.activeItem.uid;
    if (!uid) {
      return;
    }
    this.notifyExpand(expand);
  }

  moveToParent(): boolean {
    if (this.isActiveExpanded) {
      return false;
    }
    this.activate(this.model.findParent(this.activeItem.uid));
    return true;
  };

  moveToFirstVisibleChild(): boolean {
    if (!this.isActiveExpanded) {
      return false;
    }
    this.activate(this.model.findVisibleChild(this.activeItem.uid));
    return true;
  };

  notifyExpand(expand): void {
    this.expands.next(this.navigationState(expand));
  }

  notifyMove(): void {
    this.moves.next(this.navigationState());
  }

  navigationState(expand = false): NavigationState {
    return ({expand, uid: this.activeUid, isFocused: this.isFocused});
  }

  handleEnter(): void {
    if (!this.navigable) {
      return;
    }
    if (this.isLoadMoreButton) {
      this.notifyLoadMore(this.activeUid);
    } else {
      this.selectUid(this.activeUid);
    }
  }

  handleSpace(): void {
    if (!this.navigable) {
      return;
    }
    if (this.isLoadMoreButton) {
      this.notifyLoadMore(this.activeUid);
    } else {
      this.checkUid(this.activeUid);
    }
  }
}
