/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import {
  Directive,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';

import { DatePickerI18nInterface, I18nService } from '@gradii/triangle/i18n';
import { CandyDate } from '../lib/candy-date/candy-date';
import { PickerComponent } from './picker.component';

const POPUP_STYLE_PATCH = {'position': 'relative'}; // Aim to override antd's style to support overlay's position strategy (position:absolute will cause it not working beacuse the overlay can't get the height/width of it's content)

/**
 * The base picker for all common APIs
 */
@Directive()
export abstract class AbstractPickerComponent implements OnInit, OnChanges, ControlValueAccessor {
  // --- Common API
  @Input() allowClear: boolean = true;
  @Input() autoFocus: boolean = false;
  @Input() disabled: boolean = false;
  @Input() open: boolean;
  @Input() className: string;
  @Input() disabledDate: (d: Date) => boolean;
  @Input() locale: DatePickerI18nInterface;
  @Input() placeholder: string | string[];
  @Input() popupStyle: object = POPUP_STYLE_PATCH;
  @Input() dropdownClassName: string;
  @Input() size: 'large' | 'small' | 'default';
  @Input() style: object;
  @Output() onOpen = new EventEmitter<boolean>();

  @Input() format: string;

  @Input() value: any;
  isRange: boolean = false; // Indicate whether the value is a range value
  @ViewChild(PickerComponent, {static: true}) protected picker: PickerComponent;

  constructor(protected i18n: I18nService) {
  }

  get realOpenState(): boolean {
    return this.picker.animationOpenState;
  } // Use picker's real open state to let re-render the picker's content when shown up

  initValue(): void {
    this.value = this.isRange ? [] : null;
  }

  ngOnInit(): void {
    // Default locale (NOTE: Place here to assign default value due to the i18n'locale may change before ngOnInit)
    if (!this.locale) {
      this.locale = this.i18n.getLocaleData('DatePicker', {});
    }

    // Default value
    this.initValue();

    // Default placeholder
    if (!this.placeholder) {
      this.placeholder = this.isRange ? this.locale.lang.rangePlaceholder : this.locale.lang.placeholder;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.popupStyle) { // Always assign the popup style patch
      this.popupStyle = this.popupStyle ? {...this.popupStyle, ...POPUP_STYLE_PATCH} : POPUP_STYLE_PATCH;
    }
  }

  closeOverlay(): void {
    this.picker.hideOverlay();
  }

  /**
   * Common handle for value changes
   * @param value changed value
   */
  onValueChange(value: CompatibleValue): void {
    this.value = value;
    if (this.isRange) {
      if ((this.value as CandyDate[]).length) {
        this.onChangeFn([this.value[0].nativeDate, this.value[1].nativeDate]);
      } else {
        this.onChangeFn([]);
      }
    } else {
      if (this.value) {
        this.onChangeFn((this.value as CandyDate).nativeDate);
      } else {
        this.onChangeFn(null);
      }
    }
    this.onTouchedFn();
  }

  /**
   * Triggered when overlayOpen changes (different with realOpenState)
   * @param open The overlayOpen in picker component
   */
  onOpenChange(open: boolean): void {
    this.onOpen.emit(open);
  }

  // ------------------------------------------------------------------------
  // | Control value accessor implements
  // ------------------------------------------------------------------------

  // NOTE: onChangeFn/onTouchedFn will not be assigned if user not use as ngModel
  onChangeFn: (val: CompatibleDate) => void = () => void 0;
  onTouchedFn: () => void = () => void 0;

  writeValue(value: CompatibleDate): void {
    this.setValue(value);
  }

  registerOnChange(fn: any): void { // tslint:disable-line:no-any
    this.onChangeFn = fn;
  }

  registerOnTouched(fn: any): void { // tslint:disable-line:no-any
    this.onTouchedFn = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.disabled = disabled;
  }

  // ------------------------------------------------------------------------
  // | Internal methods
  // ------------------------------------------------------------------------

  private formatDate(date: CandyDate): string {
    return date ? this.i18n.formatDateCompatible(date.nativeDate, this.format) : '';
  }

  // Safe way of setting value with default
  private setValue(value: CompatibleDate): void {
    if (this.isRange) {
      this.value = value ? (value as Date[]).map(val => new CandyDate(val)) : [];
    } else {
      this.value = value ? new CandyDate(value as Date) : null;
    }
  }
}

export type CompatibleValue = CandyDate | CandyDate[];

export type CompatibleDate = Date | Date[];
