/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { FocusMonitor } from '@angular/cdk/a11y';
import {
  CdkConnectedOverlay, CdkOverlayOrigin, ConnectedOverlayPositionChange
} from '@angular/cdk/overlay';
import {
  AfterContentInit, AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component,
  ContentChildren, ElementRef, EventEmitter, forwardRef, Input, OnDestroy, OnInit, Output,
  QueryList, Renderer2, TemplateRef, ViewChild, ViewEncapsulation
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { SizeLDSType, SlideAnimation } from '@gradii/triangle/core';
import { coerceToBoolean, isPresent } from '@gradii/triangle/util';
import { EMPTY, merge, Subject } from 'rxjs';
import { flatMap, startWith, takeUntil } from 'rxjs/operators';
import { OptionGroupComponent } from './option-group.component';
import { ComboboxOptionComponent } from './combobox-option.component';
import { TFilterOption } from './option.pipe';
import { SelectTopControlComponent } from './select-top-control.component';
import { SelectService } from './select.service';

@Component({
  selector       : 'tri-combobox',
  providers      : [
    SelectService,
    {
      provide    : NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ComboboxComponent),
      multi      : true
    }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation  : ViewEncapsulation.None,
  animations     : [SlideAnimation],
  templateUrl    : './combobox.component.html',
  host           : {
    '[class.tri-select-lg]'         : 'size==="large"',
    '[class.tri-select-sm]'         : 'size==="small"',
    '[class.tri-select-enabled]'    : '!disabled',
    '[class.tri-select-no-arrow]'   : '!showArrow',
    '[class.tri-select-disabled]'   : 'disabled',
    '[class.tri-select-allow-clear]': 'allowClear',
    '[class.tri-select-open]'       : '_open',
    '(click)'                       : 'toggleDropDown()'
  },
  styles         : [
    `
      .tri-select-dropdown {
        top           : 100%;
        left          : 0;
        position      : relative;
        width         : 100%;
        margin-top    : 4px;
        margin-bottom : 4px;
      }
    `
  ],
  styleUrls      : ['../style/combobox.scss']
})
export class ComboboxComponent implements ControlValueAccessor, OnInit, AfterViewInit, OnDestroy, AfterContentInit {
  // tslint:disable-next-line:no-any
  value: any | any[];
  dropDownPosition: 'top' | 'center' | 'bottom' = 'bottom';
  triggerWidth: number;
  @ViewChild(CdkOverlayOrigin, {static: false}) cdkOverlayOrigin: CdkOverlayOrigin;
  @ViewChild(CdkConnectedOverlay, {static: false}) cdkConnectedOverlay: CdkConnectedOverlay;
  @ViewChild(SelectTopControlComponent,
    {static: false}) selectTopControlComponent: SelectTopControlComponent;
  /** should move to tri-option-container when https://github.com/angular/angular/issues/20810 resolved **/
  @ContentChildren(ComboboxOptionComponent) listOfOptionComponent: QueryList<ComboboxOptionComponent>;
  @ContentChildren(
    OptionGroupComponent) listOfOptionGroupComponent: QueryList<OptionGroupComponent>;
  @Output() readonly onSearch                   = new EventEmitter<string>();
  @Output() readonly scrollToBottom             = new EventEmitter<void>();
  @Output() readonly openChange                 = new EventEmitter<boolean>();
  @Output() readonly blur                       = new EventEmitter<void>();
  @Output() readonly focus                      = new EventEmitter<void>();
  @Input() size: SizeLDSType                    = 'default';
  @Input() dropdownClassName: string | string[] | Set<string> | { [klass: string]: any; };
  @Input() dropdownMatchSelectWidth             = false;
  @Input() dropdownStyle: { [key: string]: string };
  @Input() notFoundContent: string;
  @Input() allowClear                           = false;
  @Input() showSearch                           = false;
  @Input() loading                              = false;
  @Input() placeHolder: string;
  @Input() maxTagCount: number;
  @Input() dropdownRender: TemplateRef<void>;
  @Input() suffixIcon: TemplateRef<void>;
  @Input() clearIcon: TemplateRef<void>;
  @Input() removeIcon: TemplateRef<void>;
  @Input() menuItemSelectedIcon: TemplateRef<void>;
  @Input() showArrow                            = true;
  @Input() tokenSeparators: string[]            = [];
  // tslint:disable-next-line:no-any
  @Input() maxTagPlaceholder: TemplateRef<{ $implicit: any[] }>;
  private isInit                                = false;
  private destroy$                              = new Subject();

  constructor(
    private renderer: Renderer2,
    public selectService: SelectService,
    private cdr: ChangeDetectorRef,
    private focusMonitor: FocusMonitor,
    elementRef: ElementRef
  ) {
    renderer.addClass(elementRef.nativeElement, 'tri-select');
  }

  _open = false;

  @Input()
  set open(value: boolean) {
    this._open = value;
    this.selectService.setOpenState(value);
  }

  private _disabled = false;

  get disabled(): boolean {
    return this._disabled;
  }

  @Input()
  set disabled(value: boolean) {
    this._disabled              = coerceToBoolean(value);
    this.selectService.disabled = this._disabled;
    this.selectService.check();
    if (this.disabled && this.isInit) {
      this.closeDropDown();
    }
  }

  private _autoFocus = false;

  get autoFocus(): boolean {
    return this._autoFocus;
  }

  @Input()
  set autoFocus(value: boolean) {
    this._autoFocus = coerceToBoolean(value);
    this.updateAutoFocus();
  }

  @Input()
  set autoClearSearchValue(value: boolean) {
    this.selectService.autoClearSearchValue = coerceToBoolean(value);
  }

  @Input()
  set maxMultipleCount(value: number) {
    this.selectService.maxMultipleCount = value;
  }

  @Input()
  set serverSearch(value: boolean) {
    this.selectService.serverSearch = coerceToBoolean(value);
  }

  /**
   * Get placeholder text
   * 获取选择框默认文字
   */
  @Input()
  get placeholder(): string {
    return this.placeHolder;
  }

  /**
   * Set placeholder text
   * 设置选择默认文字
   * @param  value
   */
  set placeholder(value: string) {
    this.placeHolder = value;
  }

  @Input()
  set mode(value: 'default' | 'multiple' | 'tags') {
    this.selectService.mode = value;
    this.selectService.check();
  }

  @Input()
  set filterOption(value: TFilterOption) {
    this.selectService.filterOption = value;
  }

  @Input()
  // tslint:disable-next-line:no-any
  set compareWith(value: (o1: any, o2: any) => boolean) {
    this.selectService.compareWith = value;
  }

  onChange: (value: string | string[]) => void = () => null;

  onTouched: () => void = () => null;

  updateAutoFocus(): void {
    if (this.selectTopControlComponent.inputElement) {
      if (this.autoFocus) {
        this.renderer.setAttribute(
          this.selectTopControlComponent.inputElement.nativeElement,
          'autofocus',
          'autofocus'
        );
      } else {
        this.renderer.removeAttribute(this.selectTopControlComponent.inputElement.nativeElement,
          'autofocus');
      }
    }
  }

  _focus(): void {
    if (this.selectTopControlComponent.inputElement) {
      this.focusMonitor.focusVia(this.selectTopControlComponent.inputElement, 'keyboard');
      this.focus.emit();
    }
  }

  _blur(): void {
    if (this.selectTopControlComponent.inputElement) {
      this.selectTopControlComponent.inputElement.nativeElement.blur();
      this.blur.emit();
    }
  }

  onKeyDown(event: KeyboardEvent): void {
    this.selectService.onKeyDown(event);
  }

  toggleDropDown(): void {
    if (!this.disabled) {
      this.selectService.setOpenState(!this._open);
    }
  }

  closeDropDown(): void {
    this.selectService.setOpenState(false);
  }

  onPositionChange(position: ConnectedOverlayPositionChange): void {
    this.dropDownPosition = position.connectionPair.originY;
  }

  updateCdkConnectedOverlayStatus(): void {
    this.triggerWidth = this.cdkOverlayOrigin.elementRef.nativeElement.getBoundingClientRect().width;
  }

  updateCdkConnectedOverlayPositions(): void {
    setTimeout(() => {
      if (this.cdkConnectedOverlay && this.cdkConnectedOverlay.overlayRef) {
        this.cdkConnectedOverlay.overlayRef.updatePosition();
      }
    });
  }

  /** update ngModel -> update listOfSelectedValue **/
  // tslint:disable-next-line:no-any
  writeValue(value: any | any[]): void {
    this.value           = value;
    let listValue: any[] = []; // tslint:disable-line:no-any
    if (isPresent(value)) {
      if (Array.isArray(value)) {
        listValue = value;
      } else {
        listValue = [value];
      }
    }
    this.selectService.updateListOfSelectedValue(listValue, false);
    this.cdr.markForCheck();
  }

  registerOnChange(fn: (value: string | string[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.cdr.markForCheck();
  }

  ngOnInit(): void {
    this.selectService.searchValue$.pipe(takeUntil(this.destroy$)).subscribe(data => {
      this.onSearch.emit(data);
      this.updateCdkConnectedOverlayPositions();
    });
    this.selectService.modelChange$.pipe(takeUntil(this.destroy$)).subscribe(modelValue => {
      if (this.value !== modelValue) {
        this.value = modelValue;
        this.onChange(this.value);
        this.updateCdkConnectedOverlayPositions();
      }
    });
    this.selectService.open$.pipe(takeUntil(this.destroy$)).subscribe(value => {
      if (this._open !== value) {
        this.openChange.emit(value);
      }
      if (value) {
        this._focus();
        this.updateCdkConnectedOverlayStatus();
      } else {
        this._blur();
        this.onTouched();
      }
      this._open = !!value;
    });
    this.selectService.check$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.cdr.markForCheck();
    });
  }

  ngAfterViewInit(): void {
    this.updateCdkConnectedOverlayStatus();
    this.isInit = true;
  }

  ngAfterContentInit(): void {
    this.listOfOptionGroupComponent.changes
      .pipe(
        startWith(true),
        flatMap(() =>
          merge(
            this.listOfOptionGroupComponent.changes,
            this.listOfOptionComponent.changes,
            ...this.listOfOptionGroupComponent.map(group =>
              group.listOfOptionComponent ? group.listOfOptionComponent.changes : EMPTY
            )
          ).pipe(startWith(true))
        )
      )
      .subscribe(() => {
        this.selectService.updateTemplateOption(
          this.listOfOptionComponent.toArray(),
          this.listOfOptionGroupComponent.toArray()
        );
      });
  }

  ngOnDestroy(): void {
    this.destroy$.complete();
  }
}
