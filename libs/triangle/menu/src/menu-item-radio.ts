/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */


import { Directionality } from '@angular/cdk/bidi';
import { UniqueSelectionDispatcher } from '@angular/cdk/collections';
import { Directive, ElementRef, Inject, NgZone, OnDestroy, Optional, Self } from '@angular/core';
import { MENU_AIM, MenuAim } from './menu-aim';
import { Menu, TRI_MENU } from './menu-interface';
import { TriMenuItem } from './menu-item';
import { TriMenuItemSelectable } from './menu-item-selectable';
import { TriMenuItemTrigger } from './menu-item-trigger';

/**
 * A directive providing behavior for the "menuitemradio" ARIA role, which behaves similarly to
 * a conventional radio-button. Any sibling `TriMenuItemRadio` instances within the same `TriMenu`
 * or `TriMenuGroup` comprise a radio group with unique selection enforced.
 */
@Directive({
  selector : '[triMenuItemRadio]',
  exportAs : 'triMenuItemRadio',
  host     : {
    '[tabindex]'          : '_tabindex',
    'type'                : 'button',
    'role'                : 'menuitemradio',
    '[attr.aria-checked]' : 'checked || null',
    '[attr.aria-disabled]': 'disabled || null',
  },
  providers: [
    {provide: TriMenuItemSelectable, useExisting: TriMenuItemRadio},
    {provide: TriMenuItem, useExisting: TriMenuItemSelectable},
  ],
})
export class TriMenuItemRadio extends TriMenuItemSelectable implements OnDestroy {
  /** Function to unregister the selection dispatcher */
  private _removeDispatcherListener: () => void;

  constructor(
    private readonly _selectionDispatcher: UniqueSelectionDispatcher,
    element: ElementRef<HTMLElement>,
    ngZone: NgZone,
    @Optional() @Inject(TRI_MENU) parentMenu?: Menu,
    @Optional() @Inject(MENU_AIM) menuAim?: MenuAim,
    @Optional() dir?: Directionality,
    /** Reference to the TriMenuItemTrigger directive if one is added to the same element */
    // `TriMenuItemRadio` is commonly used in combination with a `TriMenuItemTrigger`.
    // tslint:disable-next-line: lightweight-tokens
    @Self() @Optional() menuTrigger?: TriMenuItemTrigger,
  ) {
    super(element, ngZone, parentMenu, menuAim, dir, menuTrigger);

    this._registerDispatcherListener();
  }

  /** Toggles the checked state of the radio-button. */
  override trigger() {
    super.trigger();

    if (!this.disabled) {
      this._selectionDispatcher.notify(this.id, this.name);
    }
  }

  override ngOnDestroy() {
    super.ngOnDestroy();
    this._removeDispatcherListener();
  }

  /** Configure the unique selection dispatcher listener in order to toggle the checked state  */
  private _registerDispatcherListener() {
    this._removeDispatcherListener = this._selectionDispatcher.listen(
      (id: string, name: string) => (this.checked = this.id === id && this.name === name),
    );
  }
}
