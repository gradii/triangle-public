/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */


import { ActiveDescendantKeyManager, LiveAnnouncer } from '@angular/cdk/a11y';
import { Directionality } from '@angular/cdk/bidi';
import { BooleanInput, coerceBooleanProperty, coerceNumberProperty, NumberInput, } from '@angular/cdk/coercion';
import { SelectionModel } from '@angular/cdk/collections';
import { A, DOWN_ARROW, ENTER, hasModifierKey, LEFT_ARROW, RIGHT_ARROW, SPACE, UP_ARROW, } from '@angular/cdk/keycodes';
import { CdkConnectedOverlay, ConnectedPosition, ScrollStrategy, } from '@angular/cdk/overlay';
import { ViewportRuler } from '@angular/cdk/scrolling';
import {
  AfterContentInit, Attribute, ChangeDetectorRef, Directive, DoCheck, ElementRef, EventEmitter, Inject, Input, NgZone, OnChanges,
  OnDestroy, OnInit, Optional, Output, QueryList, Self, SimpleChanges, ViewChild,
} from '@angular/core';
import { ControlValueAccessor, FormGroupDirective, NgControl, NgForm, Validators, } from '@angular/forms';
import {
  _TriOptionBase, CanDisable, CanDisableRipple, CanUpdateErrorState, ErrorStateMatcher, HasTabIndex, mixinDisabled,
  mixinDisableRipple, mixinErrorState, mixinTabIndex, TriOptgroup, TriOption, TriOptionSelectionChange
} from '@gradii/triangle/core';
import { FormFieldComponent, TRI_FORM_FIELD } from '@gradii/triangle/form-field';

import { defer, merge, Observable, Subject } from 'rxjs';
import { distinctUntilChanged, filter, map, startWith, switchMap, take, takeUntil, } from 'rxjs/operators';
import { TRI_SELECT_CONFIG, TriSelectConfig } from './select-config';
import {
  getTriSelectDynamicMultipleError, getTriSelectNonArrayValueError, getTriSelectNonFunctionValueError,
} from './select-errors';
import { TRI_SELECT_SCROLL_STRATEGY } from './select-scroll';

declare const ngDevMode: object | null;

let nextUniqueId = 0;

// Boilerplate for applying mixins to TriSelect.
/** @docs-private */
const _TriSelectMixinBase = mixinDisableRipple(
  mixinTabIndex(
    mixinDisabled(
      mixinErrorState(
        class {
          constructor(
            public _elementRef: ElementRef,
            public _defaultErrorStateMatcher: ErrorStateMatcher,
            public _parentForm: NgForm,
            public _parentFormGroup: FormGroupDirective,
            public ngControl: NgControl,
          ) {
          }
        },
      ),
    ),
  ),
);


/** Base class with all the `TriSelect` functionality. */
@Directive()
export abstract class _TriSelectBase<C>
  extends _TriSelectMixinBase
  implements
    // eslint-disable-next-line @angular-eslint/no-conflicting-lifecycle
    AfterContentInit, OnChanges, OnDestroy, OnInit, DoCheck,
    ControlValueAccessor,
    CanDisable,
    HasTabIndex,
    // TriFormFieldControl<any>,
    CanUpdateErrorState,
    CanDisableRipple {
  /** All of the defined select options. */
  abstract options: QueryList<_TriOptionBase>;

  // public API so we have to keep it. It should be deprecated and removed eventually.
  /** All of the defined groups of options. */
  abstract optionGroups: QueryList<TriOptgroup>;

  /** User-supplied override of the trigger element. */
    // eslint-disable-next-line @typescript-eslint/ban-types
  abstract customTrigger: {};

  /**
   * This position config ensures that the top "start" corner of the overlay
   * is aligned with with the top "start" of the origin by default (overlapping
   * the trigger completely). If the panel cannot fit below the trigger, it
   * will fall back to a position above the trigger.
   */
  abstract _positions: ConnectedPosition[];

  /** Scrolls a particular option into the view. */
  protected abstract _scrollOptionIntoView(index: number): void;

  /** Called when the panel has been opened and the overlay has settled on its final position. */
  protected abstract _positioningSettled(): void;

  /** Creates a change event object that should be emitted by the select. */
  protected abstract _getChangeEvent(value: any): C;

  /** Factory function used to create a scroll strategy for this select. */
  private _scrollStrategyFactory: () => ScrollStrategy;

  /** Whether or not the overlay panel is open. */
  private _panelOpen = false;

  /** Comparison function to specify which option is displayed. Defaults to object equality. */
  private _compareWith = (o1: any, o2: any) => o1 === o2;

  /** Unique id for this input. */
  private _uid = `tri-select-${nextUniqueId++}`;

  /** Current `ariar-labelledby` value for the select trigger. */
  private _triggerAriaLabelledBy: string | null = null;

  /** Emits whenever the component is destroyed. */
  protected readonly _destroy = new Subject<void>();

  /** The aria-describedby attribute on the select for improved a11y. */
  _ariaDescribedby: string;

  /** Deals with the selection logic. */
  _selectionModel: SelectionModel<TriOption>;

  /** Manages keyboard events for options in the panel. */
  _keyManager: ActiveDescendantKeyManager<TriOption>;

  /** `View -> model callback called when value changes` */
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  _onChange: (value: any) => void = () => {
  };

  /** `View -> model callback called when select has been touched` */
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  _onTouched = (): void => {
  };

  /** ID for the DOM node containing the select's value. */
  _valueId = `tri-select-value-${nextUniqueId++}`;

  /** Emits when the panel element is finished transforming in. */
  readonly _panelDoneAnimatingStream = new Subject<string>();

  /** Strategy that will be used to handle scrolling while the select panel is open. */
  _scrollStrategy: ScrollStrategy;

  _overlayPanelClass: string | string[] = this._defaultOptions?.overlayPanelClass || '';

  /** Whether the select is focused. */
  get focused(): boolean {
    return this._focused || this._panelOpen;
  }

  private _focused = false;

  /** A name for this control that can be used by `tri-form-field`. */
  controlType = 'tri-select';

  /** Trigger that opens the select. */
  @ViewChild('trigger') trigger: ElementRef;

  /** Panel containing the select options. */
  @ViewChild('panel') panel: ElementRef;

  /** Overlay pane containing the options. */
  @ViewChild(CdkConnectedOverlay)
  protected _overlayDir: CdkConnectedOverlay;

  /** Classes to be passed to the select panel. Supports the same syntax as `ngClass`. */
  @Input() panelClass: string | string[] | Set<string> | { [key: string]: any };

  /** Placeholder to be shown if no value has been selected. */
  @Input()
  get placeholder(): string {
    return this._placeholder;
  }

  set placeholder(value: string) {
    this._placeholder = value;
    this.stateChanges.next();
  }

  private _placeholder: string;

  /** Whether the component is required. */
  @Input()
  get required(): boolean {
    return this._required ?? this.ngControl?.control?.hasValidator(Validators.required) ?? false;
  }

  set required(value: BooleanInput) {
    this._required = coerceBooleanProperty(value);
    this.stateChanges.next();
  }

  private _required: boolean | undefined;

  /** Whether the user should be allowed to select multiple options. */
  @Input()
  get multiple(): boolean {
    return this._multiple;
  }

  set multiple(value: BooleanInput) {
    if (this._selectionModel && (typeof ngDevMode === 'undefined' || ngDevMode)) {
      throw getTriSelectDynamicMultipleError();
    }

    this._multiple = coerceBooleanProperty(value);
  }

  private _multiple: boolean = false;

  /** Whether to center the active option over the trigger. */
  @Input()
  get disableOptionCentering(): boolean {
    return this._disableOptionCentering;
  }

  set disableOptionCentering(value: BooleanInput) {
    this._disableOptionCentering = coerceBooleanProperty(value);
  }

  private _disableOptionCentering = this._defaultOptions?.disableOptionCentering ?? false;

  /**
   * Function to compare the option values with the selected values. The first argument
   * is a value from an option. The second is a value from the selection. A boolean
   * should be returned.
   */
  @Input()
  get compareWith() {
    return this._compareWith;
  }

  set compareWith(fn: (o1: any, o2: any) => boolean) {
    if (typeof fn !== 'function' && (typeof ngDevMode === 'undefined' || ngDevMode)) {
      throw getTriSelectNonFunctionValueError();
    }
    this._compareWith = fn;
    if (this._selectionModel) {
      // A different comparator means the selection could change.
      this._initializeSelection();
    }
  }

  /** Value of the select control. */
  @Input()
  get value(): any {
    return this._value;
  }

  set value(newValue: any) {
    // Always re-assign an array, because it might have been mutated.
    if (newValue !== this._value || (this._multiple && Array.isArray(newValue))) {
      if (this.options) {
        this._setSelectionByValue(newValue);
      }

      this._value = newValue;
    }
  }

  private _value: any;

  /** Aria label of the select. */
  @Input('aria-label') ariaLabel: string = '';

  /** Input that can be used to specify the `aria-labelledby` attribute. */
  @Input('aria-labelledby') ariaLabelledby: string;

  /** Object used to control when error messages are shown. */
  @Input() override errorStateMatcher: ErrorStateMatcher;

  /** Time to wait in milliseconds after the last keystroke before moving focus to an item. */
  @Input()
  get typeaheadDebounceInterval(): number {
    return this._typeaheadDebounceInterval;
  }

  set typeaheadDebounceInterval(value: NumberInput) {
    this._typeaheadDebounceInterval = coerceNumberProperty(value);
  }

  private _typeaheadDebounceInterval: number;

  /**
   * Function used to sort the values in a select in multiple mode.
   * Follows the same logic as `Array.prototype.sort`.
   */
  @Input() sortComparator: (a: TriOption, b: TriOption, options: TriOption[]) => number;

  /** Unique id of the element. */
  @Input()
  get id(): string {
    return this._id;
  }

  set id(value: string) {
    this._id = value || this._uid;
    this.stateChanges.next();
  }

  private _id: string;

  /** Combined stream of all of the child options' change events. */
  readonly optionSelectionChanges: Observable<TriOptionSelectionChange> = defer(() => {
    const options = this.options;

    if (options) {
      return options.changes.pipe(
        startWith(options),
        switchMap(() => merge(...options.map(option => option.onSelectionChange))),
      );
    }

    return this._ngZone.onStable.pipe(
      take(1),
      switchMap(() => this.optionSelectionChanges),
    );
  }) as Observable<TriOptionSelectionChange>;

  /** Event emitted when the select panel has been toggled. */
  @Output() readonly openedChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  /** Event emitted when the select has been opened. */
  @Output('opened') readonly _openedStream: Observable<void> = this.openedChange.pipe(
    filter(o => o),
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    map(() => {
    }),
  );

  /** Event emitted when the select has been closed. */
  @Output('closed') readonly _closedStream: Observable<void> = this.openedChange.pipe(
    filter(o => !o),
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    map(() => {
    }),
  );

  /** Event emitted when the selected value has been changed by the user. */
  @Output() readonly selectionChange: EventEmitter<C> = new EventEmitter<C>();

  /**
   * Event that emits whenever the raw value of the select changes. This is here primarily
   * to facilitate the two-way binding for the `value` input.
   * @docs-private
   */
  @Output() readonly valueChange: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    protected _viewportRuler: ViewportRuler,
    protected _changeDetectorRef: ChangeDetectorRef,
    protected _ngZone: NgZone,
    _defaultErrorStateMatcher: ErrorStateMatcher,
    elementRef: ElementRef,
    @Optional() private _dir: Directionality,
    @Optional() _parentForm: NgForm,
    @Optional() _parentFormGroup: FormGroupDirective,
    @Optional() @Inject(TRI_FORM_FIELD) protected _parentFormField: FormFieldComponent,
    @Self() @Optional() ngControl: NgControl,
    @Attribute('tabindex') tabIndex: string,
    @Inject(TRI_SELECT_SCROLL_STRATEGY) scrollStrategyFactory: any,
    private _liveAnnouncer: LiveAnnouncer,
    @Optional() @Inject(TRI_SELECT_CONFIG) private _defaultOptions?: TriSelectConfig,
  ) {
    super(elementRef, _defaultErrorStateMatcher, _parentForm, _parentFormGroup, ngControl);

    if (this.ngControl) {
      // Note: we provide the value accessor through here, instead of
      // the `providers` to avoid running into a circular import.
      this.ngControl.valueAccessor = this;
    }

    // Note that we only want to set this when the defaults pass it in, otherwise it should
    // stay as `undefined` so that it falls back to the default in the key manager.
    if (_defaultOptions?.typeaheadDebounceInterval != null) {
      this._typeaheadDebounceInterval = _defaultOptions.typeaheadDebounceInterval;
    }

    this._scrollStrategyFactory = scrollStrategyFactory;
    this._scrollStrategy        = this._scrollStrategyFactory();
    this.tabIndex               = parseInt(tabIndex) || 0;

    // Force setter to be called in case id was not specified.
    // eslint-disable-next-line no-self-assign
    this.id = this.id;
  }

  // eslint-disable-next-line @angular-eslint/no-conflicting-lifecycle
  ngOnInit() {
    this._selectionModel = new SelectionModel<TriOption>(this.multiple);
    this.stateChanges.next();

    this._panelDoneAnimatingStream
      .pipe(distinctUntilChanged(), takeUntil(this._destroy))
      .subscribe(() => this._panelDoneAnimating(this.panelOpen));
  }

  // eslint-disable-next-line @angular-eslint/no-conflicting-lifecycle
  ngAfterContentInit() {
    this._initKeyManager();

    this._selectionModel.changed.pipe(takeUntil(this._destroy)).subscribe(event => {
      event.added.forEach(option => option.select());
      event.removed.forEach(option => option.deselect());
    });

    this.options.changes.pipe(startWith(null), takeUntil(this._destroy)).subscribe(() => {
      this._resetOptions();
      this._initializeSelection();
    });
  }

  // eslint-disable-next-line @angular-eslint/no-conflicting-lifecycle
  ngDoCheck() {
    const newAriaLabelledby = this._getTriggerAriaLabelledby();

    // We have to manage setting the `aria-labelledby` ourselves, because part of its value
    // is computed as a result of a content query which can cause this binding to trigger a
    // "changed after checked" error.
    if (newAriaLabelledby !== this._triggerAriaLabelledBy) {
      const element: HTMLElement  = this._elementRef.nativeElement;
      this._triggerAriaLabelledBy = newAriaLabelledby;
      if (newAriaLabelledby) {
        element.setAttribute('aria-labelledby', newAriaLabelledby);
      } else {
        element.removeAttribute('aria-labelledby');
      }
    }

    if (this.ngControl) {
      this.updateErrorState();
    }
  }

  // eslint-disable-next-line @angular-eslint/no-conflicting-lifecycle
  ngOnChanges(changes: SimpleChanges) {
    // Updating the disabled state is handled by `mixinDisabled`, but we need to additionally let
    // the parent form field know to run change detection when the disabled state changes.
    if (changes['disabled']) {
      this.stateChanges.next();
    }

    if (changes['typeaheadDebounceInterval'] && this._keyManager) {
      this._keyManager.withTypeAhead(this._typeaheadDebounceInterval);
    }
  }

  // eslint-disable-next-line @angular-eslint/no-conflicting-lifecycle
  ngOnDestroy() {
    this._destroy.next();
    this._destroy.complete();
    this.stateChanges.complete();
  }

  /** Toggles the overlay panel open or closed. */
  toggle(): void {
    this.panelOpen ? this.close() : this.open();
  }

  /** Opens the overlay panel. */
  open(): void {
    if (this._canOpen()) {
      this._panelOpen = true;
      this._keyManager.withHorizontalOrientation(null);
      this._highlightCorrectOption();
      this._changeDetectorRef.markForCheck();
    }
  }

  /** Closes the overlay panel and focuses the host element. */
  close(): void {
    if (this._panelOpen) {
      this._panelOpen = false;
      this._keyManager.withHorizontalOrientation(this._isRtl() ? 'rtl' : 'ltr');
      this._changeDetectorRef.markForCheck();
      this._onTouched();
    }
  }

  /**
   * Sets the select's value. Part of the ControlValueAccessor interface
   * required to integrate with Angular's core forms API.
   *
   * @param value New value to be written to the model.
   */
  writeValue(value: any): void {
    this.value = value;
  }

  /**
   * Saves a callback function to be invoked when the select's value
   * changes from user input. Part of the ControlValueAccessor interface
   * required to integrate with Angular's core forms API.
   *
   * @param fn Callback to be triggered when the value changes.
   */
  registerOnChange(fn: (value: any) => void): void {
    this._onChange = fn;
  }

  /**
   * Saves a callback function to be invoked when the select is blurred
   * by the user. Part of the ControlValueAccessor interface required
   * to integrate with Angular's core forms API.
   *
   * @param fn Callback to be triggered when the component has been touched.
   */
  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  /**
   * Disables the select. Part of the ControlValueAccessor interface required
   * to integrate with Angular's core forms API.
   *
   * @param isDisabled Sets whether the component is disabled.
   */
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this._changeDetectorRef.markForCheck();
    this.stateChanges.next();
  }

  /** Whether or not the overlay panel is open. */
  get panelOpen(): boolean {
    return this._panelOpen;
  }

  /** The currently selected option. */
  get selected(): TriOption | TriOption[] {
    return this.multiple ? this._selectionModel?.selected || [] : this._selectionModel?.selected[0];
  }

  /** The value displayed in the trigger. */
  get triggerValue(): string {
    if (this.empty) {
      return '';
    }

    if (this._multiple) {
      const selectedOptions = this._selectionModel.selected.map(option => option.viewValue);

      if (this._isRtl()) {
        selectedOptions.reverse();
      }

      // TODO(crisbeto): delimiter should be configurable for proper localization.
      return selectedOptions.join(', ');
    }

    return this._selectionModel.selected[0].viewValue;
  }

  /** Whether the element is in RTL mode. */
  _isRtl(): boolean {
    return this._dir ? this._dir.value === 'rtl' : false;
  }

  /** Handles all keydown events on the select. */
  _handleKeydown(event: KeyboardEvent): void {
    if (!this.disabled) {
      this.panelOpen ? this._handleOpenKeydown(event) : this._handleClosedKeydown(event);
    }
  }

  /** Handles keyboard events while the select is closed. */
  private _handleClosedKeydown(event: KeyboardEvent): void {
    const keyCode    = event.keyCode;
    const isArrowKey =
            keyCode === DOWN_ARROW ||
            keyCode === UP_ARROW ||
            keyCode === LEFT_ARROW ||
            keyCode === RIGHT_ARROW;
    const isOpenKey  = keyCode === ENTER || keyCode === SPACE;
    const manager    = this._keyManager;

    // Open the select on ALT + arrow key to match the native <select>
    if (
      (!manager.isTyping() && isOpenKey && !hasModifierKey(event)) ||
      ((this.multiple || event.altKey) && isArrowKey)
    ) {
      event.preventDefault(); // prevents the page from scrolling down when pressing space
      this.open();
    } else if (!this.multiple) {
      const previouslySelectedOption = this.selected;
      manager.onKeydown(event);
      const selectedOption = this.selected;

      // Since the value has changed, we need to announce it ourselves.
      if (selectedOption && previouslySelectedOption !== selectedOption) {
        // We set a duration on the live announcement, because we want the live element to be
        // cleared after a while so that users can't navigate to it using the arrow keys.
        this._liveAnnouncer.announce((selectedOption as TriOption).viewValue, 10000);
      }
    }
  }

  /** Handles keyboard events when the selected is open. */
  private _handleOpenKeydown(event: KeyboardEvent): void {
    const manager    = this._keyManager;
    const keyCode    = event.keyCode;
    const isArrowKey = keyCode === DOWN_ARROW || keyCode === UP_ARROW;
    const isTyping   = manager.isTyping();

    if (isArrowKey && event.altKey) {
      // Close the select on ALT + arrow key to match the native <select>
      event.preventDefault();
      this.close();
      // Don't do anything in this case if the user is typing,
      // because the typing sequence can include the space key.
    } else if (
      !isTyping &&
      (keyCode === ENTER || keyCode === SPACE) &&
      manager.activeItem &&
      !hasModifierKey(event)
    ) {
      event.preventDefault();
      manager.activeItem._selectViaInteraction();
    } else if (!isTyping && this._multiple && keyCode === A && event.ctrlKey) {
      event.preventDefault();
      const hasDeselectedOptions = this.options.some(opt => !opt.disabled && !opt.selected);

      this.options.forEach(option => {
        if (!option.disabled) {
          hasDeselectedOptions ? option.select() : option.deselect();
        }
      });
    } else {
      const previouslyFocusedIndex = manager.activeItemIndex;

      manager.onKeydown(event);

      if (
        this._multiple &&
        isArrowKey &&
        event.shiftKey &&
        manager.activeItem &&
        manager.activeItemIndex !== previouslyFocusedIndex
      ) {
        manager.activeItem._selectViaInteraction();
      }
    }
  }

  _onFocus() {
    if (!this.disabled) {
      this._focused = true;
      this.stateChanges.next();
    }
  }

  /**
   * Calls the touched callback only if the panel is closed. Otherwise, the trigger will
   * "blur" to the panel when it opens, causing a false positive.
   */
  _onBlur() {
    this._focused = false;

    if (!this.disabled && !this.panelOpen) {
      this._onTouched();
      this._changeDetectorRef.markForCheck();
      this.stateChanges.next();
    }
  }

  /**
   * Callback that is invoked when the overlay panel has been attached.
   */
  _onAttached(): void {
    this._overlayDir.positionChange.pipe(take(1)).subscribe(() => {
      this._changeDetectorRef.detectChanges();
      this._positioningSettled();
    });
  }

  /** Returns the theme to be used on the panel. */
  _getPanelTheme(): string {
    return this._parentFormField ? `tri-${this._parentFormField.color}` : '';
  }

  /** Whether the select has a value. */
  get empty(): boolean {
    return !this._selectionModel || this._selectionModel.isEmpty();
  }

  private _initializeSelection(): void {
    // Defer setting the value in order to avoid the "Expression
    // has changed after it was checked" errors from Angular.
    Promise.resolve().then(() => {
      this._setSelectionByValue(this.ngControl ? this.ngControl.value : this._value);
      this.stateChanges.next();
    });
  }

  /**
   * Sets the selected option based on a value. If no option can be
   * found with the designated value, the select trigger is cleared.
   */
  private _setSelectionByValue(value: any | any[]): void {
    this._selectionModel.selected.forEach(option => option.setInactiveStyles());
    this._selectionModel.clear();

    if (this.multiple && value) {
      if (!Array.isArray(value) && (typeof ngDevMode === 'undefined' || ngDevMode)) {
        throw getTriSelectNonArrayValueError();
      }

      value.forEach((currentValue: any) => this._selectValue(currentValue));
      this._sortValues();
    } else {
      const correspondingOption = this._selectValue(value);

      // Shift focus to the active item. Note that we shouldn't do this in multiple
      // mode, because we don't know what option the user interacted with last.
      if (correspondingOption) {
        this._keyManager.updateActiveItem(correspondingOption);
      } else if (!this.panelOpen) {
        // Otherwise reset the highlighted option. Note that we only want to do this while
        // closed, because doing it while open can shift the user's focus unnecessarily.
        this._keyManager.updateActiveItem(-1);
      }
    }

    this._changeDetectorRef.markForCheck();
  }

  /**
   * Finds and selects and option based on its value.
   * @returns Option that has the corresponding value.
   */
  private _selectValue(value: any): TriOption | undefined {
    const correspondingOption = this.options.find((option: TriOption) => {
      // Skip options that are already in the model. This allows us to handle cases
      // where the same primitive value is selected multiple times.
      if (this._selectionModel.isSelected(option)) {
        return false;
      }

      try {
        // Treat null as a special reset value.
        return option.value != null && this._compareWith(option.value, value);
      } catch (error) {
        if (typeof ngDevMode === 'undefined' || ngDevMode) {
          // Notify developers of errors in their comparator.
          console.warn(error);
        }
        return false;
      }
    });

    if (correspondingOption) {
      this._selectionModel.select(correspondingOption);
    }

    return correspondingOption;
  }

  /** Sets up a key manager to listen to keyboard events on the overlay panel. */
  private _initKeyManager() {
    this._keyManager = new ActiveDescendantKeyManager<TriOption>(this.options)
      .withTypeAhead(this._typeaheadDebounceInterval)
      .withVerticalOrientation()
      .withHorizontalOrientation(this._isRtl() ? 'rtl' : 'ltr')
      .withHomeAndEnd()
      .withAllowedModifierKeys(['shiftKey']);

    this._keyManager.tabOut.pipe(takeUntil(this._destroy)).subscribe(() => {
      if (this.panelOpen) {
        // Select the active item when tabbing away. This is consistent with how the native
        // select behaves. Note that we only want to do this in single selection mode.
        if (!this.multiple && this._keyManager.activeItem) {
          this._keyManager.activeItem._selectViaInteraction();
        }

        // Restore focus to the trigger before closing. Ensures that the focus
        // position won't be lost if the user got focus into the overlay.
        this.focus();
        this.close();
      }
    });

    this._keyManager.change.pipe(takeUntil(this._destroy)).subscribe(() => {
      if (this._panelOpen && this.panel) {
        this._scrollOptionIntoView(this._keyManager.activeItemIndex || 0);
      } else if (!this._panelOpen && !this.multiple && this._keyManager.activeItem) {
        this._keyManager.activeItem._selectViaInteraction();
      }
    });
  }

  /** Drops current option subscriptions and IDs and resets from scratch. */
  private _resetOptions(): void {
    const changedOrDestroyed = merge(this.options.changes, this._destroy);

    this.optionSelectionChanges.pipe(takeUntil(changedOrDestroyed)).subscribe(event => {
      this._onSelect(event.source, event.isUserInput);

      if (event.isUserInput && !this.multiple && this._panelOpen) {
        this.close();
        this.focus();
      }
    });

    // Listen to changes in the internal state of the options and react accordingly.
    // Handles cases like the labels of the selected options changing.
    merge(...this.options.map(option => option._stateChanges))
      .pipe(takeUntil(changedOrDestroyed))
      .subscribe(() => {
        this._changeDetectorRef.markForCheck();
        this.stateChanges.next();
      });
  }

  /** Invoked when an option is clicked. */
  private _onSelect(option: TriOption, isUserInput: boolean): void {
    const wasSelected = this._selectionModel.isSelected(option);

    if (option.value == null && !this._multiple) {
      option.deselect();
      this._selectionModel.clear();

      if (this.value != null) {
        this._propagateChanges(option.value);
      }
    } else {
      if (wasSelected !== option.selected) {
        option.selected
          ? this._selectionModel.select(option)
          : this._selectionModel.deselect(option);
      }

      if (isUserInput) {
        this._keyManager.setActiveItem(option);
      }

      if (this.multiple) {
        this._sortValues();

        if (isUserInput) {
          // In case the user selected the option with their mouse, we
          // want to restore focus back to the trigger, in order to
          // prevent the select keyboard controls from clashing with
          // the ones from `tri-option`.
          this.focus();
        }
      }
    }

    if (wasSelected !== this._selectionModel.isSelected(option)) {
      this._propagateChanges();
    }

    this.stateChanges.next();
  }

  /** Sorts the selected values in the selected based on their order in the panel. */
  private _sortValues() {
    if (this.multiple) {
      const options = this.options.toArray();

      this._selectionModel.sort((a, b) => {
        return this.sortComparator
          ? this.sortComparator(a, b, options)
          : options.indexOf(a) - options.indexOf(b);
      });
      this.stateChanges.next();
    }
  }

  /** Emits change event to set the model value. */
  private _propagateChanges(fallbackValue?: any): void {
    let valueToEmit: any = null;

    if (this.multiple) {
      valueToEmit = (this.selected as TriOption[]).map(option => option.value);
    } else {
      valueToEmit = this.selected ? (this.selected as TriOption).value : fallbackValue;
    }

    this._value = valueToEmit;
    this.valueChange.emit(valueToEmit);
    this._onChange(valueToEmit);
    this.selectionChange.emit(this._getChangeEvent(valueToEmit));
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Highlights the selected item. If no option is selected, it will highlight
   * the first item instead.
   */
  private _highlightCorrectOption(): void {
    if (this._keyManager) {
      if (this.empty) {
        this._keyManager.setFirstItemActive();
      } else {
        this._keyManager.setActiveItem(this._selectionModel.selected[0]);
      }
    }
  }

  /** Whether the panel is allowed to open. */
  protected _canOpen(): boolean {
    return !this._panelOpen && !this.disabled && this.options?.length > 0;
  }

  /** Focuses the select element. */
  focus(options?: FocusOptions): void {
    this._elementRef.nativeElement.focus(options);
  }

  /** Gets the aria-labelledby for the select panel. */
  _getPanelAriaLabelledby(): string | null {
    if (this.ariaLabel) {
      return null;
    }

    const labelId         = this._parentFormField?.getLabelId();
    const labelExpression = labelId ? labelId + ' ' : '';
    return this.ariaLabelledby ? labelExpression + this.ariaLabelledby : labelId;
  }

  /** Determines the `aria-activedescendant` to be set on the host. */
  _getAriaActiveDescendant(): string | null {
    if (this.panelOpen && this._keyManager && this._keyManager.activeItem) {
      return this._keyManager.activeItem.id;
    }

    return null;
  }

  /** Gets the aria-labelledby of the select component trigger. */
  private _getTriggerAriaLabelledby(): string | null {
    if (this.ariaLabel) {
      return null;
    }

    const labelId = this._parentFormField?.getLabelId();
    let value     = (labelId ? labelId + ' ' : '') + this._valueId;

    if (this.ariaLabelledby) {
      value += ' ' + this.ariaLabelledby;
    }

    return value;
  }

  /** Called when the overlay panel is done animating. */
  protected _panelDoneAnimating(isOpen: boolean) {
    this.openedChange.emit(isOpen);
  }

  /**
   * Implemented as part of MatFormFieldControl.
   * @docs-private
   */
  setDescribedByIds(ids: string[]) {
    this._ariaDescribedby = ids.join(' ');
  }

  /**
   * Implemented as part of MatFormFieldControl.
   * @docs-private
   */
  onContainerClick() {
    this.focus();
    this.open();
  }

  /**
   * Implemented as part of MatFormFieldControl.
   * @docs-private
   */
  get shouldLabelFloat(): boolean {
    return this._panelOpen || !this.empty || (this._focused && !!this._placeholder);
  }
}
