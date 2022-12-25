/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { animate, state, style, transition, trigger } from '@angular/animations';
import {
  CdkOverlayOrigin,
  ConnectionPositionPair,
  Overlay,
  OverlayPositionBuilder
} from '@angular/cdk/overlay';
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  Renderer2,
  TemplateRef,
  ViewChild
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { I18nService as I18n } from '@gradii/triangle/i18n';

@Component({
  selector   : 'tri-time-picker',
  templateUrl: './time-picker.component.html',
  animations : [
    trigger('DropDownAnimation', [
      state('void', style({
        opacity: 0,
        display: 'none'
      })),
      state('*', style({
        opacity        : 1,
        transform      : 'scaleY(1)',
        transformOrigin: '0% 0%'
      })),
      transition('void => *', [
        style({
          opacity        : 0,
          transform      : 'scaleY(0.8)',
          transformOrigin: '0% 0%'
        }),
        animate('100ms cubic-bezier(0.755, 0.05, 0.855, 0.06)')
      ]),
      transition('* => void', [
        animate('100ms cubic-bezier(0.755, 0.05, 0.855, 0.06)', style({
          opacity        : 0,
          transform      : 'scaleY(0.8)',
          transformOrigin: '0% 0%'
        }))
      ])
    ])
  ],
  providers  : [
    {provide: NG_VALUE_ACCESSOR, useExisting: TimePickerComponent, multi: true}
  ],
  host       : {
    '[class.tri-time-picker]'      : 'true',
    '[class.tri-time-picker-large]': 'size==="large"',
    '[class.tri-time-picker-small]': 'size==="small"'
  },
  styles     : [`.tri-time-picker-panel {
    position: relative;
    left: 0;
  }

  .tri-time-picker-panel.top {
    bottom: -8px;
  }

  .tri-time-picker-panel.bottom {
    top: -2px;
  }`]
})
export class TimePickerComponent implements ControlValueAccessor, OnInit, AfterViewInit {
  isInit = false;
  origin: CdkOverlayOrigin;
  overlayPositions: ConnectionPositionPair[] = [{
    originX : 'start',
    originY : 'top',
    overlayX: 'end',
    overlayY: 'top',
    offsetX : 0,
    offsetY : 0
  }];
  @ViewChild('inputElement', {static: false}) inputRef: ElementRef;
  @Input() size: string | null = null;
  @Input() hourStep = 1;
  @Input() minuteStep = 1;
  @Input() secondStep = 1;
  @Input() clearText = 'clear';
  @Input() popupClassName = '';
  @Input() placeHolder = '';
  @Input() addOn: TemplateRef<void>;
  @Input() defaultOpenValue = new Date();
  @Input() disabledHours: () => number[];
  @Input() disabledMinutes: (hour: number) => number[];
  @Input() disabledSeconds: (hour: number, minute: number) => number[];
  @Input() format = 'HH:mm:ss';
  @Input() open = false;
  @Output() openChange = new EventEmitter<boolean>();
  private _onChange: (value: Date) => void;
  private _onTouched: () => void;

  constructor(private element: ElementRef,
              private renderer: Renderer2,
              private overlay: Overlay,
              private positionBuilder: OverlayPositionBuilder,
              private i18n: I18n) {
  }

  private _disabled = false;

  get disabled(): boolean {
    return this._disabled;
  }

  @Input()
  set disabled(value: boolean) {
    this._disabled = value;
    const input = this.inputRef.nativeElement as HTMLInputElement;
    if (this._disabled) {
      this.renderer.setAttribute(input, 'disabled', '');
    } else {
      this.renderer.removeAttribute(input, 'disabled');
    }
  }

  private _value: Date | null = null;

  get value(): Date | null {
    return this._value;
  }

  set value(value: Date | null) {
    this._value = value;
    if (this._onChange) {
      this._onChange(this.value);
    }
    if (this._onTouched) {
      this._onTouched();
    }
  }

  private _allowEmpty = true;

  get allowEmpty(): boolean {
    return this._allowEmpty;
  }

  @Input()
  set allowEmpty(value: boolean) {
    this._allowEmpty = value;
  }

  private _autoFocus = false;

  get autoFocus(): boolean {
    return this._autoFocus;
  }

  @Input()
  set autoFocus(value: boolean) {
    this._autoFocus = value;
    this.updateAutoFocus();
  }

  private _hideDisabledOptions = false;

  get hideDisabledOptions(): boolean {
    return this._hideDisabledOptions;
  }

  @Input()
  set hideDisabledOptions(value: boolean) {
    this._hideDisabledOptions = value;
  }

  onOpen(): void {
    if (this.disabled) {
      return;
    }
    this.open = true;
    this.openChange.emit(this.open);
  }

  onClose(): void {
    this.open = false;
    this.openChange.emit(this.open);
  }

  updateAutoFocus(): void {
    if (this.isInit && !this.disabled) {
      if (this.autoFocus) {
        this.renderer.setAttribute(this.inputRef.nativeElement, 'autofocus', 'autofocus');
      } else {
        this.renderer.removeAttribute(this.inputRef.nativeElement, 'autofocus');
      }
    }
  }

  focus(): void {
    if (this.inputRef.nativeElement) {
      this.inputRef.nativeElement.focus();
    }
  }

  blur(): void {
    if (this.inputRef.nativeElement) {
      this.inputRef.nativeElement.blur();
    }
  }

  ngOnInit(): void {
    this.origin = new CdkOverlayOrigin(this.element);
  }

  ngAfterViewInit(): void {
    this.isInit = true;
    this.updateAutoFocus();
  }

  writeValue(time: Date | null): void {
    this._value = time;
  }

  registerOnChange(fn: (time: Date) => void): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
