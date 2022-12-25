/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */


import { FocusKeyManager, FocusOrigin } from '@angular/cdk/a11y';
import { Directionality } from '@angular/cdk/bidi';
import {
  DOWN_ARROW, ESCAPE, hasModifierKey, LEFT_ARROW, RIGHT_ARROW, TAB, UP_ARROW,
} from '@angular/cdk/keycodes';
import {
  AfterContentInit, ContentChildren, Directive, ElementRef, EventEmitter, HostListener, Inject,
  Input, NgZone, OnDestroy, OnInit, Optional, Output, QueryList, Self,
} from '@angular/core';
import { merge } from 'rxjs';
import { mapTo, mergeAll, mergeMap, startWith, switchMap, take, takeUntil } from 'rxjs/operators';
import { MENU_AIM, MenuAim } from './menu-aim';
import { TriMenuGroup } from './menu-group';
import { Menu, TRI_MENU } from './menu-interface';
import { TriMenuItem } from './menu-item';
import { TriMenuPanel } from './menu-panel';
import { FocusNext, MenuStack, MenuStackItem, NoopMenuStack } from './menu-stack';
import { PointerFocusTracker } from './pointer-focus-tracker';

/**
 * Directive which configures the element as a Menu which should contain child elements marked as
 * TriMenuItem or TriMenuGroup. Sets the appropriate role and aria-attributes for a menu and
 * contains accessible keyboard and mouse handling logic.
 *
 * It also acts as a RadioGroup for elements marked with role `menuitemradio`.
 */
@Directive({
  selector : '[triMenu]',
  exportAs : 'triMenu',
  host     : {
    '[tabindex]'             : '_isInline() ? 0 : null',
    'role'                   : 'menu',
    'class'                  : 'tri-menu',
    '[class.tri-menu-inline]': '_isInline()',
    '[attr.aria-orientation]': 'orientation',
  },
  providers: [
    {provide: TriMenuGroup, useExisting: TriMenu},
    {provide: TRI_MENU, useExisting: TriMenu},
  ],
})
export class TriMenu extends TriMenuGroup implements Menu, AfterContentInit, OnInit, OnDestroy {
  /**
   * Sets the aria-orientation attribute and determines where menus will be opened.
   * Does not affect styling/layout.
   */
  @Input('triMenuOrientation')
  orientation: 'horizontal' | 'vertical' = 'vertical';

  /** Event emitted when the menu is closed. */
  @Output()
  readonly closed: EventEmitter<void | 'click' | 'tab' | 'escape'> = new EventEmitter();

  // We provide a default MenuStack implementation in case the menu is an inline menu.
  // For Menus part of a MenuBar nested within a MenuPanel this will be overwritten
  // to the correct parent MenuStack.
  /** Track the Menus making up the open menu stack. */
  _menuStack: MenuStack = new NoopMenuStack();

  /** Handles keyboard events for the menu. */
  private _keyManager: FocusKeyManager<TriMenuItem>;

  /** Manages items under mouse focus. */
  private _pointerTracker?: PointerFocusTracker<TriMenuItem>;

  /** List of nested TriMenuGroup elements */
  @ContentChildren(TriMenuGroup, {descendants: true})
  private readonly _nestedGroups: QueryList<TriMenuGroup>;

  /** All child MenuItem elements nested in this Menu. */
  @ContentChildren(TriMenuItem, {descendants: true})
  private readonly _allItems: QueryList<TriMenuItem>;

  /** The Menu Item which triggered the open submenu. */
  private _openItem?: TriMenuItem;

  /**
   * A reference to the enclosing parent menu panel.
   *
   * Required to be set when using ViewEngine since ViewEngine does support injecting a reference to
   * the parent directive if the parent directive is placed on an `ng-template`. If using Ivy, the
   * injected value will be used over this one.
   */
  @Input('triMenuPanel')
  _explicitPanel?: TriMenuPanel;

  constructor(
    private readonly _ngZone: NgZone,
    readonly _elementRef: ElementRef<HTMLElement>,
    @Self() @Optional() @Inject(MENU_AIM) private readonly _menuAim?: MenuAim,
    @Optional() private readonly _dir?: Directionality,
    // `TriMenuPanel` is always used in combination with a `TriMenu`.
    // tslint:disable-next-line: lightweight-tokens
    @Optional() private readonly _menuPanel?: TriMenuPanel,
  ) {
    super();
  }

  ngOnInit() {
    this._registerWithParentPanel();
  }

  override ngAfterContentInit() {
    super.ngAfterContentInit();

    this._completeChangeEmitter();
    this._setKeyManager();
    this._subscribeToMenuOpen();
    this._subscribeToMenuStack();
    this._subscribeToMouseManager();

    this._menuAim?.initialize(this, this._pointerTracker!);
  }

  // In Ivy the `host` metadata will be merged, whereas in ViewEngine it is overridden. In order
  // to avoid double event listeners, we need to use `HostListener`. Once Ivy is the default, we
  // can move this back into `host`.
  // tslint:disable:no-host-decorator-in-concrete
  @HostListener('focus')
  /** Place focus on the first MenuItem in the menu and set the focus origin. */
  focusFirstItem(focusOrigin: FocusOrigin = 'program') {
    this._keyManager.setFocusOrigin(focusOrigin);
    this._keyManager.setFirstItemActive();
  }

  /** Place focus on the last MenuItem in the menu and set the focus origin. */
  focusLastItem(focusOrigin: FocusOrigin = 'program') {
    this._keyManager.setFocusOrigin(focusOrigin);
    this._keyManager.setLastItemActive();
  }

  // In Ivy the `host` metadata will be merged, whereas in ViewEngine it is overridden. In order
  // to avoid double event listeners, we need to use `HostListener`. Once Ivy is the default, we
  // can move this back into `host`.
  // tslint:disable:no-host-decorator-in-concrete
  @HostListener('keydown', ['$event'])
  /** Handle keyboard events for the Menu. */
  _handleKeyEvent(event: KeyboardEvent) {
    const keyManager = this._keyManager;
    switch (event.keyCode) {
      case LEFT_ARROW:
      case RIGHT_ARROW:
        if (this._isHorizontal()) {
          event.preventDefault();
          keyManager.setFocusOrigin('keyboard');
          keyManager.onKeydown(event);
        }
        break;

      case UP_ARROW:
      case DOWN_ARROW:
        if (!this._isHorizontal()) {
          event.preventDefault();
          keyManager.setFocusOrigin('keyboard');
          keyManager.onKeydown(event);
        }
        break;

      case ESCAPE:
        if (!hasModifierKey(event)) {
          event.preventDefault();
          this._menuStack.close(this, FocusNext.currentItem);
        }
        break;

      case TAB:
        this._menuStack.closeAll();
        break;

      default:
        keyManager.onKeydown(event);
    }
  }

  /**
   * Return true if this menu is an inline menu. That is, it does not exist in a pop-up and is
   * always visible in the dom.
   */
  _isInline() {
    // NoopMenuStack is the default. If this menu is not inline than the NoopMenuStack is replaced
    // automatically.
    return this._menuStack instanceof NoopMenuStack;
  }

  override ngOnDestroy() {
    this._emitClosedEvent();
    this._pointerTracker?.destroy();
  }

  /** Register this menu with its enclosing parent menu panel */
  private _registerWithParentPanel() {
    this._getMenuPanel()?._registerMenu(this);
  }

  /**
   * Get the enclosing TriMenuPanel defaulting to the injected reference over the developer
   * provided reference.
   */
  private _getMenuPanel() {
    return this._menuPanel || this._explicitPanel;
  }

  /**
   * Complete the change emitter if there are any nested MenuGroups or register to complete the
   * change emitter if a MenuGroup is rendered at some point
   */
  private _completeChangeEmitter() {
    if (this._hasNestedGroups()) {
      this.change.complete();
    } else {
      this._nestedGroups.changes.pipe(take(1)).subscribe(() => this.change.complete());
    }
  }

  /** Return true if there are nested TriMenuGroup elements within the Menu */
  private _hasNestedGroups() {
    // view engine has a bug where @ContentChildren will return the current element
    // along with children if the selectors match - not just the children.
    // Here, if there is at least one element, we check to see if the first element is a TriMenu in
    // order to ensure that we return true iff there are child TriMenuGroup elements.
    return this._nestedGroups.length > 0 && !(this._nestedGroups.first instanceof TriMenu);
  }

  /** Setup the FocusKeyManager with the correct orientation for the menu. */
  private _setKeyManager() {
    this._keyManager = new FocusKeyManager(this._allItems)
      .withWrap()
      .withTypeAhead()
      .withHomeAndEnd();

    if (this._isHorizontal()) {
      this._keyManager.withHorizontalOrientation(this._dir?.value || 'ltr');
    } else {
      this._keyManager.withVerticalOrientation();
    }
  }

  /**
   * Set the PointerFocusTracker and ensure that when mouse focus changes the key manager is updated
   * with the latest menu item under mouse focus.
   */
  private _subscribeToMouseManager() {
    this._ngZone.runOutsideAngular(() => {
      this._pointerTracker = new PointerFocusTracker(this._allItems);
      this._pointerTracker.entered
        .pipe(takeUntil(this.closed))
        .subscribe(item => this._keyManager.setActiveItem(item));
    });
  }

  /** Subscribe to the MenuStack close and empty observables. */
  private _subscribeToMenuStack() {
    this._menuStack.closed
      .pipe(takeUntil(this.closed))
      .subscribe(item => this._closeOpenMenu(item));

    this._menuStack.emptied
      .pipe(takeUntil(this.closed))
      .subscribe(event => this._toggleMenuFocus(event));
  }

  /**
   * Close the open menu if the current active item opened the requested MenuStackItem.
   * @param item the MenuStackItem requested to be closed.
   */
  private _closeOpenMenu(menu: MenuStackItem | undefined) {
    const keyManager = this._keyManager;
    const trigger    = this._openItem;
    if (menu === trigger?.getMenuTrigger()?.getMenu()) {
      trigger?.getMenuTrigger()?.closeMenu();
      // If the user has moused over a sibling item we want to focus the element under mouse focus
      // not the trigger which previously opened the now closed menu.
      if (trigger) {
        keyManager.setActiveItem(this._pointerTracker?.activeElement || trigger);
      }
    }
  }

  /** Set focus the either the current, previous or next item based on the FocusNext event. */
  private _toggleMenuFocus(event: FocusNext | undefined) {
    const keyManager = this._keyManager;
    switch (event) {
      case FocusNext.nextItem:
        keyManager.setFocusOrigin('keyboard');
        keyManager.setNextItemActive();
        break;

      case FocusNext.previousItem:
        keyManager.setFocusOrigin('keyboard');
        keyManager.setPreviousItemActive();
        break;

      case FocusNext.currentItem:
        if (keyManager.activeItem) {
          keyManager.setFocusOrigin('keyboard');
          keyManager.setActiveItem(keyManager.activeItem);
        }
        break;
    }
  }

  // TODO(andy9775): remove duplicate logic between menu an menu bar
  /**
   * Subscribe to the menu trigger's open events in order to track the trigger which opened the menu
   * and stop tracking it when the menu is closed.
   */
  private _subscribeToMenuOpen() {
    const exitCondition = merge(this._allItems.changes, this.closed);
    this._allItems.changes
      .pipe(
        startWith(this._allItems),
        mergeMap((list: QueryList<TriMenuItem>) =>
          list
            .filter(item => item.hasMenu())
            .map(item => item.getMenuTrigger()!.opened.pipe(mapTo(item), takeUntil(exitCondition))),
        ),
        mergeAll(),
        switchMap((item: TriMenuItem) => {
          this._openItem = item;
          return item.getMenuTrigger()!.closed;
        }),
        takeUntil(this.closed),
      )
      .subscribe(() => (this._openItem = undefined));
  }

  /** Return true if this menu has been configured in a horizontal orientation. */
  private _isHorizontal() {
    return this.orientation === 'horizontal';
  }

  /** Emit and complete the closed event emitter */
  private _emitClosedEvent() {
    this.closed.next();
    this.closed.complete();
  }
}
