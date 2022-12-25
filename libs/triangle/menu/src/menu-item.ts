/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */


import { FocusableOption } from '@angular/cdk/a11y';
import { Directionality } from '@angular/cdk/bidi';
import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';
import { ENTER, LEFT_ARROW, RIGHT_ARROW, SPACE } from '@angular/cdk/keycodes';
import {
  Directive, ElementRef, EventEmitter, HostListener, Inject, Input, NgZone, OnDestroy, Optional,
  Output, Self,
} from '@angular/core';
import { fromEvent, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { MENU_AIM, MenuAim, Toggler } from './menu-aim';
import { Menu, TRI_MENU } from './menu-interface';
import { TriMenuItemTrigger } from './menu-item-trigger';
import { FocusNext } from './menu-stack';
import { FocusableElement } from './pointer-focus-tracker';

// TODO refactor this to be configurable allowing for custom elements to be removed
/** Removes all icons from within the given element. */
function removeIcons(element: Element) {
  for (const icon of Array.from(element.querySelectorAll('mat-icon, .material-icons'))) {
    icon.remove();
  }
}

/**
 * Directive which provides the ability for an element to be focused and navigated to using the
 * keyboard when residing in a TriMenu, TriMenuBar, or TriMenuGroup. It performs user defined
 * behavior when clicked.
 */
@Directive({
  selector: '[triMenuItem]',
  exportAs: 'triMenuItem',
  host    : {
    '[tabindex]'          : '_tabindex',
    'type'                : 'button',
    'role'                : 'menuitem',
    'class'               : 'tri-menu-item',
    '[attr.aria-disabled]': 'disabled || null',
  },
})
export class TriMenuItem implements FocusableOption, FocusableElement, Toggler, OnDestroy {
  static ngAcceptInputType_disabled: BooleanInput;
  /**
   * If this MenuItem is a regular MenuItem, outputs when it is triggered by a keyboard or mouse
   * event.
   */
  @Output('triMenuItemTriggered') readonly triggered: EventEmitter<void> = new EventEmitter();
  /**
   * The tabindex for this menu item managed internally and used for implementing roving a
   * tab index.
   */
  _tabindex: 0 | -1                                                      = -1;
  /** Emits when the menu item is destroyed. */
  private readonly _destroyed                                            = new Subject<void>();

  constructor(
    readonly _elementRef: ElementRef<HTMLElement>,
    private readonly _ngZone: NgZone,
    @Optional() @Inject(TRI_MENU) private readonly _parentMenu?: Menu,
    @Optional() @Inject(MENU_AIM) private readonly _menuAim?: MenuAim,
    @Optional() private readonly _dir?: Directionality,
    /** Reference to the TriMenuItemTrigger directive if one is added to the same element */
    // `TriMenuItem` is commonly used in combination with a `TriMenuItemTrigger`.
    // tslint:disable-next-line: lightweight-tokens
    @Self() @Optional() private readonly _menuTrigger?: TriMenuItemTrigger,
  ) {
    this._setupMouseEnter();

    if (this._isStandaloneItem()) {
      this._tabindex = 0;
    }
  }

  private _disabled = false;

  /**  Whether the TriMenuItem is disabled - defaults to false */
  @Input()
  get disabled(): boolean {
    return this._disabled;
  }

  set disabled(value: boolean) {
    this._disabled = coerceBooleanProperty(value);
  }

  // In Ivy the `host` metadata will be merged, whereas in ViewEngine it is overridden. In order
  // to avoid double event listeners, we need to use `HostListener`. Once Ivy is the default, we
  // can move this back into `host`.

  /** Place focus on the element. */
  focus() {
    this._elementRef.nativeElement.focus();
  }

  // In Ivy the `host` metadata will be merged, whereas in ViewEngine it is overridden. In order
  // to avoid double event listeners, we need to use `HostListener`. Once Ivy is the default, we
  // can move this back into `host`.

  // tslint:disable:no-host-decorator-in-concrete
  @HostListener('blur')
  @HostListener('mouseout')
  /** Reset the _tabindex to -1. */
  _resetTabIndex() {
    if (!this._isStandaloneItem()) {
      this._tabindex = -1;
    }
  }

  // tslint:disable:no-host-decorator-in-concrete
  @HostListener('focus')
  @HostListener('mouseenter', ['$event'])
  /**
   * Set the tab index to 0 if not disabled and it's a focus event, or a mouse enter if this element
   * is not in a menu bar.
   */
  _setTabIndex(event?: MouseEvent) {
    if (this.disabled) {
      return;
    }

    // don't set the tabindex if there are no open sibling or parent menus
    if (!event || !this._getMenuStack()?.isEmpty()) {
      this._tabindex = 0;
    }
  }

  // In Ivy the `host` metadata will be merged, whereas in ViewEngine it is overridden. In order
  // to avoid double event listeners, we need to use `HostListener`. Once Ivy is the default, we
  // can move this back into `host`.

  /** Whether this menu item is standalone or within a menu or menu bar. */
  _isStandaloneItem() {
    return !this._parentMenu;
  }

  // tslint:disable:no-host-decorator-in-concrete
  @HostListener('click')
  /**
   * If the menu item is not disabled and the element does not have a menu trigger attached, emit
   * on the triMenuItemTriggered emitter and close all open menus.
   */
  trigger() {
    if (!this.disabled && !this.hasMenu()) {
      this.triggered.next();
      this._getMenuStack()?.closeAll();
    }
  }

  /** Whether the menu item opens a menu. */
  hasMenu() {
    return !!this._menuTrigger?.hasMenu();
  }

  /** Return true if this MenuItem has an attached menu and it is open. */
  isMenuOpen() {
    return !!this._menuTrigger?.isMenuOpen();
  }

  /**
   * Get a reference to the rendered Menu if the Menu is open and it is visible in the DOM.
   * @return the menu if it is open, otherwise undefined.
   */
  getMenu(): Menu | undefined {
    return this._menuTrigger?.getMenu();
  }

  /** Get the MenuItemTrigger associated with this element. */
  getMenuTrigger(): TriMenuItemTrigger | undefined {
    return this._menuTrigger;
  }

  // In Ivy the `host` metadata will be merged, whereas in ViewEngine it is overridden. In order
  // to avoid double event listeners, we need to use `HostListener`. Once Ivy is the default, we
  // can move this back into `host`.

  /** Get the label for this element which is required by the FocusableOption interface. */
  getLabel(): string {
    // TODO cloning the tree may be expensive; implement a better method
    // we know that the current node is an element type
    const clone = this._elementRef.nativeElement.cloneNode(true) as Element;
    removeIcons(clone);

    return clone.textContent?.trim() || '';
  }

  // tslint:disable:no-host-decorator-in-concrete
  @HostListener('keydown', ['$event'])
  /**
   * Handles keyboard events for the menu item, specifically either triggering the user defined
   * callback or opening/closing the current menu based on whether the left or right arrow key was
   * pressed.
   * @param event the keyboard event to handle
   */
  _onKeydown(event: KeyboardEvent) {
    switch (event.keyCode) {
      case SPACE:
      case ENTER:
        event.preventDefault();
        this.trigger();
        break;

      case RIGHT_ARROW:
        if (this._parentMenu && this._isParentVertical() && !this.hasMenu()) {
          event.preventDefault();
          this._dir?.value === 'rtl'
            ? this._getMenuStack()?.close(this._parentMenu, FocusNext.previousItem)
            : this._getMenuStack()?.closeAll(FocusNext.nextItem);
        }
        break;

      case LEFT_ARROW:
        if (this._parentMenu && this._isParentVertical() && !this.hasMenu()) {
          event.preventDefault();
          this._dir?.value === 'rtl'
            ? this._getMenuStack()?.closeAll(FocusNext.nextItem)
            : this._getMenuStack()?.close(this._parentMenu, FocusNext.previousItem);
        }
        break;
    }
  }

  ngOnDestroy() {
    this._destroyed.next();
  }

  /**
   * Subscribe to the mouseenter events and close any sibling menu items if this element is moused
   * into.
   */
  private _setupMouseEnter() {
    if (!this._isStandaloneItem()) {
      const closeOpenSiblings = () =>
        this._ngZone.run(() => this._getMenuStack()?.closeSubMenuOf(this._parentMenu!));

      this._ngZone.runOutsideAngular(() =>
        fromEvent(this._elementRef.nativeElement, 'mouseenter')
          .pipe(
            filter(() => !this._getMenuStack()?.isEmpty() && !this.hasMenu()),
            takeUntil(this._destroyed),
          )
          .subscribe(() => {
            if (this._menuAim) {
              this._menuAim.toggle(closeOpenSiblings);
            } else {
              closeOpenSiblings();
            }
          }),
      );
    }
  }

  /**
   * Return true if the enclosing parent menu is configured in a horizontal orientation, false
   * otherwise or if no parent.
   */
  private _isParentVertical() {
    return this._parentMenu?.orientation === 'vertical';
  }

  /** Get the MenuStack from the parent menu. */
  private _getMenuStack() {
    // We use a function since at the construction of the MenuItemTrigger the parent Menu won't have
    // its menu stack set. Therefore we need to reference the menu stack from the parent each time
    // we want to use it.
    return this._parentMenu?._menuStack;
  }
}
