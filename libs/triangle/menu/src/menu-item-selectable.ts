/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */


import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';
import { Directive, EventEmitter, Input, Output } from '@angular/core';
import { TriMenuItem } from './menu-item';

/** Counter used to set a unique id and name for a selectable item */
let nextId = 0;

/**
 * Base class providing checked state for MenuItems along with outputting a clicked event when the
 * element is triggered. It provides functionality for selectable elements.
 */
@Directive()
export abstract class TriMenuItemSelectable extends TriMenuItem {
  static ngAcceptInputType_checked: BooleanInput;
  /** Event emitted when the selectable item is clicked */
  @Output('triMenuItemToggled') readonly toggled: EventEmitter<TriMenuItemSelectable> =
    new EventEmitter();
  /** The name of the selectable element with a default value */
  @Input() name: string                                                               = `tri-selectable-item-${nextId++}`;
  /** The id of the selectable element with a default value */
  @Input() id: string                                                                 = `tri-selectable-item-${nextId++}`;

  private _checked = false;

  /** Whether the element is checked */
  @Input()
  get checked() {
    return this._checked;
  }

  set checked(value: boolean) {
    this._checked = coerceBooleanProperty(value);
  }

  /** If the element is not disabled emit the click event */
  override trigger() {
    if (!this.disabled) {
      this.toggled.next(this);
    }
  }
}
