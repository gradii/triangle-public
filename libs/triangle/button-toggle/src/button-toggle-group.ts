/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';
import { SelectionModel } from '@angular/cdk/collections';
import {
  AfterContentInit, ChangeDetectorRef, ContentChildren, Directive, EventEmitter, forwardRef, Inject, Input, OnInit, Optional,
  Output, QueryList
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { TriButtonToggle } from './button-toggle';
import { TriButtonToggleChange } from './event';
import {
  TRI_BUTTON_TOGGLE_DEFAULT_OPTIONS, TRI_BUTTON_TOGGLE_GROUP, TriButtonToggleColor, TriButtonToggleDefaultOptions
} from './type';

declare const ngDevMode: object | null;

// Counter used to generate unique IDs.
let uniqueIdCounter = 0;


/**
 * Provider Expression that allows tri-button-toggle-group to register as a ControlValueAccessor.
 * This allows it to support [(ngModel)].
 * @docs-private
 */
export const TRI_BUTTON_TOGGLE_GROUP_VALUE_ACCESSOR: any = {
  provide    : NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => TriButtonToggleGroup),
  multi      : true,
};


/** Exclusive selection button toggle group that behaves like a radio-button group. */
@Directive({
  selector : 'tri-button-toggle-group',
  providers: [
    TRI_BUTTON_TOGGLE_GROUP_VALUE_ACCESSOR,
    {provide: TRI_BUTTON_TOGGLE_GROUP, useExisting: TriButtonToggleGroup},
  ],
  host     : {
    'role'                                              : 'group',
    'class'                                             : 'tri-button-toggle-group',
    '[attr.aria-disabled]'                              : 'disabled',
    '[class.tri-button-toggle-vertical]'                : 'vertical',
    '[class.tri-button-toggle-group-appearance]'        : 'color !== "default"',
    '[class.tri-button-toggle-group-appearance-primary]': 'color === "primary"',
    '[class.tri-button-toggle-group-appearance-warning]': 'color === "warning"',
  },
  exportAs : 'triButtonToggleGroup',
})
export class TriButtonToggleGroup implements ControlValueAccessor, OnInit, AfterContentInit {
  private _vertical = false;
  private _multiple = false;
  private _disabled = false;
  private _selectionModel: SelectionModel<TriButtonToggle>;

  /**
   * Reference to the raw value that the consumer tried to assign. The real
   * value will exclude any values from this one that don't correspond to a
   * toggle. Useful for the cases where the value is assigned before the toggles
   * have been initialized or at the same that they're being swapped out.
   */
  private _rawValue: any;

  /**
   * The method to be called in order to update ngModel.
   * Now `ngModel` binding is not supported in multiple selection mode.
   */
  _controlValueAccessorChangeFn: (value: any) => void = () => {
  };

  /** onTouch function registered via registerOnTouch (ControlValueAccessor). */
  _onTouched: () => any = () => {
  };

  /** Child button toggle buttons. */
  @ContentChildren(forwardRef(() => TriButtonToggle), {
    // Note that this would technically pick up toggles
    // from nested groups, but that's not a case that we support.
    descendants: true,
  })
  _buttonToggles: QueryList<TriButtonToggle>;

  /** The appearance for all the buttons in the group. */
  @Input() color: TriButtonToggleColor;

  /** `name` attribute for the underlying `input` element. */
  @Input()
  get name(): string {
    return this._name;
  }

  set name(value: string) {
    this._name = value;

    if (this._buttonToggles) {
      this._buttonToggles.forEach(toggle => {
        toggle.name = this._name;
        toggle._markForCheck();
      });
    }
  }

  private _name = `tri-button-toggle-group-${uniqueIdCounter++}`;

  /** Whether the toggle group is vertical. */
  @Input()
  get vertical(): boolean {
    return this._vertical;
  }

  set vertical(value: BooleanInput) {
    this._vertical = coerceBooleanProperty(value);
  }

  /** Value of the toggle group. */
  @Input()
  get value(): any {
    const selected = this._selectionModel ? this._selectionModel.selected : [];

    if (this.multiple) {
      return selected.map(toggle => toggle.value);
    }

    return selected[0] ? selected[0].value : undefined;
  }

  set value(newValue: any) {
    this._setSelectionByValue(newValue);
    this.valueChange.emit(this.value);
  }

  /**
   * Event that emits whenever the value of the group changes.
   * Used to facilitate two-way data binding.
   * @docs-private
   */
  @Output() readonly valueChange = new EventEmitter<any>();

  /** Selected button toggles in the group. */
  get selected(): TriButtonToggle | TriButtonToggle[] {
    const selected = this._selectionModel ? this._selectionModel.selected : [];
    return this.multiple ? selected : selected[0] || null;
  }

  /** Whether multiple button toggles can be selected. */
  @Input()
  get multiple(): boolean {
    return this._multiple;
  }

  set multiple(value: BooleanInput) {
    this._multiple = coerceBooleanProperty(value);
  }

  /** Whether multiple button toggle group is disabled. */
  @Input()
  get disabled(): boolean {
    return this._disabled;
  }

  set disabled(value: BooleanInput) {
    this._disabled = coerceBooleanProperty(value);

    if (this._buttonToggles) {
      this._buttonToggles.forEach(toggle => toggle._markForCheck());
    }
  }

  /** Event emitted when the group's value changes. */
  @Output() readonly change: EventEmitter<TriButtonToggleChange> =
    new EventEmitter<TriButtonToggleChange>();

  constructor(
    private _changeDetector: ChangeDetectorRef,
    @Optional()
    @Inject(TRI_BUTTON_TOGGLE_DEFAULT_OPTIONS)
      defaultOptions?: TriButtonToggleDefaultOptions,
  ) {
    this.color =
      defaultOptions && defaultOptions.appearance ? defaultOptions.appearance : 'default';
  }

  ngOnInit() {
    this._selectionModel = new SelectionModel<TriButtonToggle>(this.multiple, undefined, false);
  }

  ngAfterContentInit() {
    this._selectionModel.select(...this._buttonToggles.filter(toggle => toggle.checked));
  }

  /**
   * Sets the model value. Implemented as part of ControlValueAccessor.
   * @param value Value to be set to the model.
   */
  writeValue(value: any) {
    this.value = value;
    this._changeDetector.markForCheck();
  }

  // Implemented as part of ControlValueAccessor.
  registerOnChange(fn: (value: any) => void) {
    this._controlValueAccessorChangeFn = fn;
  }

  // Implemented as part of ControlValueAccessor.
  registerOnTouched(fn: any) {
    this._onTouched = fn;
  }

  // Implemented as part of ControlValueAccessor.
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  /** Dispatch change event with current selection and group value. */
  _emitChangeEvent(): void {
    const selected = this.selected;
    const source   = Array.isArray(selected) ? selected[selected.length - 1] : selected;
    const event    = new TriButtonToggleChange(source!, this.value);
    this._controlValueAccessorChangeFn(event.value);
    this.change.emit(event);
  }

  /**
   * Syncs a button toggle's selected state with the model value.
   * @param toggle Toggle to be synced.
   * @param select Whether the toggle should be selected.
   * @param isUserInput Whether the change was a result of a user interaction.
   * @param deferEvents Whether to defer emitting the change events.
   */
  _syncButtonToggle(
    toggle: TriButtonToggle,
    select: boolean,
    isUserInput = false,
    deferEvents = false,
  ) {
    // Deselect the currently-selected toggle, if we're in single-selection
    // mode and the button being toggled isn't selected at the moment.
    if (!this.multiple && this.selected && !toggle.checked) {
      (this.selected as TriButtonToggle).checked = false;
    }

    if (this._selectionModel) {
      if (select) {
        this._selectionModel.select(toggle);
      } else {
        this._selectionModel.deselect(toggle);
      }
    } else {
      deferEvents = true;
    }

    // We need to defer in some cases in order to avoid "changed after checked errors", however
    // the side-effect is that we may end up updating the model value out of sequence in others
    // The `deferEvents` flag allows us to decide whether to do it on a case-by-case basis.
    if (deferEvents) {
      Promise.resolve().then(() => this._updateModelValue(isUserInput));
    } else {
      this._updateModelValue(isUserInput);
    }
  }

  /** Checks whether a button toggle is selected. */
  _isSelected(toggle: TriButtonToggle) {
    return this._selectionModel && this._selectionModel.isSelected(toggle);
  }

  /** Determines whether a button toggle should be checked on init. */
  _isPrechecked(toggle: TriButtonToggle) {
    if (typeof this._rawValue === 'undefined') {
      return false;
    }

    if (this.multiple && Array.isArray(this._rawValue)) {
      return this._rawValue.some(value => toggle.value != null && value === toggle.value);
    }

    return toggle.value === this._rawValue;
  }

  /** Updates the selection state of the toggles in the group based on a value. */
  private _setSelectionByValue(value: any | any[]) {
    this._rawValue = value;

    if (!this._buttonToggles) {
      return;
    }

    if (this.multiple && value) {
      if (!Array.isArray(value) && (typeof ngDevMode === 'undefined' || ngDevMode)) {
        throw Error('Value must be an array in multiple-selection mode.');
      }

      this._clearSelection();
      value.forEach((currentValue: any) => this._selectValue(currentValue));
    } else {
      this._clearSelection();
      this._selectValue(value);
    }
  }

  /** Clears the selected toggles. */
  private _clearSelection() {
    this._selectionModel.clear();
    this._buttonToggles.forEach(toggle => (toggle.checked = false));
  }

  /** Selects a value if there's a toggle that corresponds to it. */
  private _selectValue(value: any) {
    const correspondingOption = this._buttonToggles.find(toggle => {
      return toggle.value != null && toggle.value === value;
    });

    if (correspondingOption) {
      correspondingOption.checked = true;
      this._selectionModel.select(correspondingOption);
    }
  }

  /** Syncs up the group's value with the model and emits the change event. */
  private _updateModelValue(isUserInput: boolean) {
    // Only emit the change event for user input.
    if (isUserInput) {
      this._emitChangeEvent();
    }

    // Note: we emit this one no matter whether it was a user interaction, because
    // it is used by Angular to sync up the two-way data binding.
    this.valueChange.emit(this.value);
  }
}
