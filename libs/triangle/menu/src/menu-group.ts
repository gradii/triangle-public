/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */


import { UniqueSelectionDispatcher } from '@angular/cdk/collections';
import {
  AfterContentInit, ContentChildren, Directive, EventEmitter, OnDestroy, Output, QueryList,
} from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { TriMenuItem } from './menu-item';
import { TriMenuItemSelectable } from './menu-item-selectable';

/**
 * Directive which acts as a grouping container for `TriMenuItem` instances with
 * `role="menuitemradio"`, similar to a `role="radiogroup"` element.
 */
@Directive({
  selector : '[triMenuGroup]',
  exportAs : 'triMenuGroup',
  host     : {
    'role' : 'group',
    'class': 'tri-menu-group',
  },
  providers: [{provide: UniqueSelectionDispatcher, useClass: UniqueSelectionDispatcher}],
})
export class TriMenuGroup implements AfterContentInit, OnDestroy {
  /** Emits the element when checkbox or radiobutton state changed  */
  @Output() readonly change: EventEmitter<TriMenuItem> = new EventEmitter();

  /** List of menuitemcheckbox or menuitemradio elements which reside in this group */
  @ContentChildren(TriMenuItemSelectable, {descendants: true})
  private readonly _selectableItems: QueryList<TriMenuItemSelectable>;

  /** Emits when the _selectableItems QueryList triggers a change */
  private readonly _selectableChanges: EventEmitter<void> = new EventEmitter();

  ngAfterContentInit() {
    this._registerMenuSelectionListeners();
  }

  ngOnDestroy() {
    this._selectableChanges.next();
    this._selectableChanges.complete();
  }

  /**
   * Register the child selectable elements with the change emitter and ensure any new child
   * elements do so as well.
   */
  private _registerMenuSelectionListeners() {
    this._selectableItems.forEach(selectable => this._registerClickListener(selectable));

    this._selectableItems.changes.subscribe((selectableItems: QueryList<TriMenuItemSelectable>) => {
      this._selectableChanges.next();
      selectableItems.forEach(selectable => this._registerClickListener(selectable));
    });
  }

  /** Register each selectable to emit on the change Emitter when clicked */
  private _registerClickListener(selectable: TriMenuItemSelectable) {
    selectable.toggled
      .pipe(takeUntil(this._selectableChanges))
      .subscribe(() => this.change.next(selectable));
  }
}
