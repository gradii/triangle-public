/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { ActiveDescendantKeyManager } from '@angular/cdk/a11y';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import {
  AfterContentInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  ElementRef,
  EventEmitter,
  Inject,
  InjectionToken,
  Input,
  Output,
  QueryList,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {
  TriOptgroup as OptionGroupComponent,
  TriOption as OptionComponent
} from '@gradii/triangle/core';
import { TriAutocompleteSelectedEvent } from './event/autocomplete-selected-event';


/**
 * Autocomplete IDs need to be unique across components, so this counter exists outside of
 * the component definition.
 */
let _uniqueAutocompleteIdCounter = 0;


/** Default `tri-autocomplete` options that can be overridden. */
export interface TriAutocompleteDefaultOptions {
  /** Whether the first option should be highlighted when an autocomplete panel is opened. */
  autoActiveFirstOption?: boolean;
}

/** Injection token to be used to override the default options for `tri-autocomplete`. */
export const TRI_AUTOCOMPLETE_DEFAULT_OPTIONS =
  new InjectionToken<TriAutocompleteDefaultOptions>('tri-autocomplete-default-options', {
    providedIn: 'root',
    factory   : TRI_AUTOCOMPLETE_DEFAULT_OPTIONS_FACTORY,
  });

/** @docs-private */
export function TRI_AUTOCOMPLETE_DEFAULT_OPTIONS_FACTORY(): TriAutocompleteDefaultOptions {
  return {autoActiveFirstOption: false};
}

@Component({
  selector       : 'tri-autocomplete',
  template       : `
    <ng-template>
      <div class="tri-autocomplete-panel" role="listbox" [id]="id" [ngClass]="_classList"
           #panel>
        <ng-content></ng-content>
      </div>
    </ng-template>
  `,
  styleUrls      : ['../style/autocomplete.scss'],
  encapsulation  : ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  exportAs       : 'triAutocomplete',
  host           : {
    'class': 'tri-autocomplete'
  }
})
export class TriAutocomplete implements AfterContentInit {

  /** Manages active item in option list based on key events. */
  _keyManager: ActiveDescendantKeyManager<OptionComponent>;

  /** Whether the autocomplete panel should be visible, depending on option length. */
  showPanel: boolean = false;
  /** @docs-private */
  @ViewChild(TemplateRef, {static: false}) template: TemplateRef<any>;
  /** Element for the panel containing the autocomplete options. */
  @ViewChild('panel', {static: false}) panel: ElementRef;
  /** @docs-private */
  @ContentChildren(OptionComponent, {descendants: true}) options: QueryList<OptionComponent>;
  /** @docs-private */
  @ContentChildren(OptionGroupComponent) optionGroups: QueryList<OptionGroupComponent>;
  /** Function that maps an option's control value to its display value in the trigger. */
  @Input() displayWith: ((value: any) => string) | null = null;
  /**
   * Specify the width of the autocomplete panel.  Can be any CSS sizing value, otherwise it will
   * match the width of its host.
   */
  @Input() panelWidth: string | number;
  @Input() multiple: boolean;
  /** Event that is emitted whenever an option from the list is selected. */
  @Output() readonly optionSelected: EventEmitter<TriAutocompleteSelectedEvent> =
    new EventEmitter<TriAutocompleteSelectedEvent>();
  /** Event that is emitted when the autocomplete panel is opened. */
  @Output() readonly opened: EventEmitter<void> = new EventEmitter<void>();
  /** Event that is emitted when the autocomplete panel is closed. */
  @Output() readonly closed: EventEmitter<void> = new EventEmitter<void>();
  /** Unique ID to be used by autocomplete trigger's "aria-owns" property. */
  id: string = `tri-autocomplete-${_uniqueAutocompleteIdCounter++}`;

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _elementRef: ElementRef<HTMLElement>,
    @Inject(TRI_AUTOCOMPLETE_DEFAULT_OPTIONS) defaults: TriAutocompleteDefaultOptions) {

    this._autoActiveFirstOption = !!defaults.autoActiveFirstOption;
  }

  _isOpen: boolean = false;

  /** Whether the autocomplete panel is open. */
  get isOpen(): boolean {
    return this._isOpen && this.showPanel;
  }

  private _autoActiveFirstOption: boolean;

  /**
   * Whether the first option should be highlighted when the autocomplete panel is opened.
   * Can be configured globally through the `TRI_AUTOCOMPLETE_DEFAULT_OPTIONS` token.
   */
  @Input()
  get autoActiveFirstOption(): boolean {
    return this._autoActiveFirstOption;
  }

  set autoActiveFirstOption(value: boolean) {
    this._autoActiveFirstOption = coerceBooleanProperty(value);
  }

  _classList: { [key: string]: boolean } = {};

  /**
   * Takes classes set on the host tri-autocomplete element and applies them to the panel
   * inside the overlay container to allow for easy styling.
   */
  @Input('class')
  set classList(value: string) {
    if (value && value.length) {
      this._classList = value.split(' ').reduce((classList, className) => {
        classList[className.trim()] = true;
        return classList;
      }, {} as { [key: string]: boolean });
    } else {
      this._classList = {};
    }

    this._setVisibilityClasses(this._classList);
    this._elementRef.nativeElement.className = '';
  }

  ngAfterContentInit() {
    this._keyManager = new ActiveDescendantKeyManager<OptionComponent>(this.options).withWrap();
    // Set the initial visibility state.
    this._setVisibility();
  }

  /**
   * Sets the panel scrollTop. This allows us to manually scroll to display options
   * above or below the fold, as they are not actually being focused when active.
   */
  _setScrollTop(scrollTop: number): void {
    if (this.panel) {
      this.panel.nativeElement.scrollTop = scrollTop;
    }
  }

  /** Returns the panel's scrollTop. */
  _getScrollTop(): number {
    return this.panel ? this.panel.nativeElement.scrollTop : 0;
  }

  /** Panel should hide itself when the option list is empty. */
  _setVisibility() {
    this.showPanel = !!this.options.length;
    this._setVisibilityClasses(this._classList);
    this._changeDetectorRef.markForCheck();
  }

  /** Emits the `select` event. */
  _emitSelectEvent(option: OptionComponent): void {
    const event = new TriAutocompleteSelectedEvent(this, option);
    this.optionSelected.emit(event);
  }

  /** Sets the autocomplete visibility classes on a classlist based on the panel is visible. */
  private _setVisibilityClasses(classList: { [key: string]: boolean }) {
    classList['tri-autocomplete-visible'] = this.showPanel;
    classList['tri-autocomplete-hidden'] = !this.showPanel;
  }
}

