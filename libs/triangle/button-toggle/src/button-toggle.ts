/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */


import { FocusMonitor } from '@angular/cdk/a11y';
import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';
import {
  AfterViewInit, Attribute, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, Inject, Input,
  OnDestroy, OnInit, Optional, Output, ViewChild, ViewEncapsulation,
} from '@angular/core';
import { CanDisableRipple, mixinDisableRipple } from '@gradii/triangle/core';
import type { TriButtonToggleGroup } from './button-toggle-group';
import { TriButtonToggleChange } from './event';
import {
  TRI_BUTTON_TOGGLE_DEFAULT_OPTIONS, TRI_BUTTON_TOGGLE_GROUP, TriButtonToggleColor, TriButtonToggleDefaultOptions
} from './type';

// Counter used to generate unique IDs.
let uniqueIdCounter = 0;

// Boilerplate for applying mixins to the TriButtonToggle class.
/** @docs-private */
const _TriButtonToggleBase = mixinDisableRipple(class {
});

/** Single button inside of a toggle group. */
@Component({
  selector       : 'tri-button-toggle',
  templateUrl    : 'button-toggle.html',
  styleUrls      : ['../style/button-toggle.scss'],
  encapsulation  : ViewEncapsulation.None,
  exportAs       : 'triButtonToggle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  inputs         : ['disableRipple'],
  host           : {
    'class'                                       : 'tri-button-toggle',
    '[class.tri-button-toggle-standalone]'        : '!buttonToggleGroup',
    '[class.tri-button-toggle-checked]'           : 'checked',
    '[class.tri-button-toggle-disabled]'          : 'disabled',
    '[class.tri-button-toggle-appearance]'        : 'color !== "default"',
    '[class.tri-button-toggle-appearance-primary]': 'color === "primary"',
    '[class.tri-button-toggle-appearance-warning]': 'color === "warning"',
    '[attr.aria-label]'                           : 'null',
    '[attr.aria-labelledby]'                      : 'null',
    '[attr.id]'                                   : 'id',
    '[attr.name]'                                 : 'null',
    '(focus)'                                     : 'focus()',
    'role'                                        : 'presentation',
  },
})
export class TriButtonToggle
  extends _TriButtonToggleBase
  implements OnInit, AfterViewInit, CanDisableRipple, OnDestroy {
  private _isSingleSelector = false;
  private _checked          = false;

  /**
   * Attached to the aria-label attribute of the host element. In most cases, aria-labelledby will
   * take precedence so this may be omitted.
   */
  @Input('aria-label') ariaLabel: string;

  /**
   * Users can specify the `aria-labelledby` attribute which will be forwarded to the input element
   */
  @Input('aria-labelledby') ariaLabelledby: string | null = null;

  /** Underlying native `button` element. */
  @ViewChild('button') _buttonElement: ElementRef<HTMLButtonElement>;

  /** The parent button toggle group (exclusive selection). Optional. */
  buttonToggleGroup: TriButtonToggleGroup;

  /** Unique ID for the underlying `button` element. */
  get buttonId(): string {
    return `${this.id}-button`;
  }

  /** The unique ID for this button toggle. */
  @Input() id: string;

  /** HTML's 'name' attribute used to group radios for unique selection. */
  @Input() name: string;

  /** TriButtonToggleGroup reads this to assign its own value. */
  @Input() value: any;

  /** Tabindex for the toggle. */
  @Input() tabIndex: number | null;

  /** The appearance style of the button. */
  @Input()
  get color(): TriButtonToggleColor {
    return this.buttonToggleGroup ? this.buttonToggleGroup.color : this._color;
  }

  set color(value: TriButtonToggleColor) {
    this._color = value;
  }

  private _color: TriButtonToggleColor;

  /** Whether the button is checked. */
  @Input()
  get checked(): boolean {
    return this.buttonToggleGroup ? this.buttonToggleGroup._isSelected(this) : this._checked;
  }

  set checked(value: BooleanInput) {
    const newValue = coerceBooleanProperty(value);

    if (newValue !== this._checked) {
      this._checked = newValue;

      if (this.buttonToggleGroup) {
        this.buttonToggleGroup._syncButtonToggle(this, this._checked);
      }

      this._changeDetectorRef.markForCheck();
    }
  }

  /** Whether the button is disabled. */
  @Input()
  get disabled(): boolean {
    return this._disabled || (this.buttonToggleGroup && this.buttonToggleGroup.disabled);
  }

  set disabled(value: BooleanInput) {
    this._disabled = coerceBooleanProperty(value);
  }

  private _disabled: boolean = false;

  /** Event emitted when the group value changes. */
  @Output() readonly change: EventEmitter<TriButtonToggleChange> =
    new EventEmitter<TriButtonToggleChange>();

  constructor(
    @Optional() @Inject(TRI_BUTTON_TOGGLE_GROUP) toggleGroup: TriButtonToggleGroup,
    private _changeDetectorRef: ChangeDetectorRef,
    private _elementRef: ElementRef<HTMLElement>,
    private _focusMonitor: FocusMonitor,
    @Attribute('tabindex') defaultTabIndex: string,
    @Optional()
    @Inject(TRI_BUTTON_TOGGLE_DEFAULT_OPTIONS)
      defaultOptions?: TriButtonToggleDefaultOptions,
  ) {
    super();

    const parsedTabIndex   = Number(defaultTabIndex);
    this.tabIndex          = parsedTabIndex || parsedTabIndex === 0 ? parsedTabIndex : null;
    this.buttonToggleGroup = toggleGroup;
    this.color             =
      defaultOptions && defaultOptions.appearance ? defaultOptions.appearance : 'default';
  }

  ngOnInit() {
    const group            = this.buttonToggleGroup;
    this._isSingleSelector = group && !group.multiple;
    this.id                = this.id || `tri-button-toggle-${uniqueIdCounter++}`;

    if (this._isSingleSelector) {
      this.name = group.name;
    }

    if (group) {
      if (group._isPrechecked(this)) {
        this.checked = true;
      } else if (group._isSelected(this) !== this._checked) {
        // As as side effect of the circular dependency between the toggle group and the button,
        // we may end up in a state where the button is supposed to be checked on init, but it
        // isn't, because the checked value was assigned too early. This can happen when Ivy
        // assigns the static input value before the `ngOnInit` has run.
        group._syncButtonToggle(this, this._checked);
      }
    }
  }

  ngAfterViewInit() {
    this._focusMonitor.monitor(this._elementRef, true);
  }

  ngOnDestroy() {
    const group = this.buttonToggleGroup;

    this._focusMonitor.stopMonitoring(this._elementRef);

    // Remove the toggle from the selection once it's destroyed. Needs to happen
    // on the next tick in order to avoid "changed after checked" errors.
    if (group && group._isSelected(this)) {
      group._syncButtonToggle(this, false, false, true);
    }
  }

  /** Focuses the button. */
  focus(options?: FocusOptions): void {
    this._buttonElement.nativeElement.focus(options);
  }

  /** Checks the button toggle due to an interaction with the underlying native button. */
  _onButtonClick() {
    const newChecked = this._isSingleSelector ? true : !this._checked;

    if (newChecked !== this._checked) {
      this._checked = newChecked;
      if (this.buttonToggleGroup) {
        this.buttonToggleGroup._syncButtonToggle(this, this._checked, true);
        this.buttonToggleGroup._onTouched();
      }
    }
    // Emit a change event when it's the single selector
    this.change.emit(new TriButtonToggleChange(this, this.value));
  }

  /**
   * Marks the button toggle as needing checking for change detection.
   * This method is exposed because the parent button toggle group will directly
   * update bound properties of the radio button.
   */
  _markForCheck() {
    // When the group value changes, the button will not be notified.
    // Use `markForCheck` to explicit update button toggle's status.
    this._changeDetectorRef.markForCheck();
  }
}
