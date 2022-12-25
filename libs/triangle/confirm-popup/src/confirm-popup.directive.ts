/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import {
  AriaDescriber,
  FocusMonitor
} from '@angular/cdk/a11y';
import { Directionality } from '@angular/cdk/bidi';
import { Overlay } from '@angular/cdk/overlay';
import { Platform } from '@angular/cdk/platform';
import { ComponentType } from '@angular/cdk/portal';
import { ScrollDispatcher } from '@angular/cdk/scrolling';
import { DOCUMENT } from '@angular/common';
import {
  Directive,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  NgZone,
  Optional,
  Output,
  ViewContainerRef
} from '@angular/core';
import { ConfirmPopupComponent } from './confirm-popup.component';
import {
  TRI_CONFIRM_POPUP_DEFAULT_OPTIONS,
  TRI_CONFIRM_POPUP_SCROLL_STRATEGY
} from './confirm-popup-common';
import {
  TriggerType,
  TriTooltipDefaultOptions
} from '@gradii/triangle/tooltip';
import { PopoverDirective } from '@gradii/triangle/popover';
import { takeUntil, tap } from 'rxjs/operators';

@Directive({
  selector: '[triConfirmPopup]',
  exportAs: 'triConfirmPopup',
  inputs: [
    'position:triConfirmPopupPosition',
    'disabled:triConfirmPopupDisabled',
    'showDelay:triConfirmPopupShowDelay',
    'hideDelay:triConfirmPopupHideDelay',
    'touchGestures:triConfirmPopupTouchGestures',
    'content:triConfirmPopup',
    'tooltipTrigger:triConfirmPopupTrigger',
    'tooltipClass:triConfirmPopupClass',
    'tooltipContext:triConfirmPopupContext',
    'title:triConfirmPopupTitle',
    'width:triConfirmPopupWidth',
    'maxWidth:triConfirmPopupMaxWidth',
    'minWidth:triConfirmPopupMinWidth',
    'height:triConfirmPopupHeight',
    'maxHeight:triConfirmPopupMaxHeight',
    'minHeight:triConfirmPopupMinHeight',
  ],
  host: {
    'class': 'tri-confirm-popup-trigger'
  }
})
export class ConfirmPopupDirective extends PopoverDirective {
  _tooltipInstance: ConfirmPopupComponent | null;

  protected readonly _tooltipComponent: ComponentType<ConfirmPopupComponent> = ConfirmPopupComponent;

  protected _okText: string;

  _tooltipTrigger: TriggerType = TriggerType.HINT;

  @Input()
  get okText() {
    return this._okText;
  }

  set okText(value: string) {
    this._okText = value;
    this._updateCancelText();
  }

  protected _cancelText: string;
  @Input()
  get cancelText() {
    return this._cancelText;
  }

  set cancelText(value: string) {
    this._cancelText = value;
    this._updateCancelText();
  }

  @Output()
  onCancel = new EventEmitter();

  @Output()
  onConfirm = new EventEmitter();

  constructor(
    overlay: Overlay,
    elementRef: ElementRef<HTMLElement>,
    scrollDispatcher: ScrollDispatcher,
    viewContainerRef: ViewContainerRef,
    ngZone: NgZone,
    platform: Platform,
    ariaDescriber: AriaDescriber,
    focusMonitor: FocusMonitor,
    @Inject(TRI_CONFIRM_POPUP_SCROLL_STRATEGY) scrollStrategy: any,
    @Optional() dir: Directionality,
    @Optional() @Inject(TRI_CONFIRM_POPUP_DEFAULT_OPTIONS) defaultOptions: TriTooltipDefaultOptions,
    @Inject(DOCUMENT) _document: any) {

    super(overlay, elementRef, scrollDispatcher, viewContainerRef, ngZone, platform, ariaDescriber,
      focusMonitor, scrollStrategy, dir, defaultOptions, _document);
  }

  show(delay?: number) {
    super.show(delay);

    if (this.title) {
      this._updateTitle();
    }

    this._tooltipInstance!.onCancel.pipe(
      takeUntil(this._tooltipInstance!.afterHidden()),
      tap((it) => {
        this.onCancel.next(it);
      })
    ).subscribe();

    this._tooltipInstance!.onConfirm.pipe(
      takeUntil(this._tooltipInstance!.afterHidden()),
      tap((it) => {
        this.onConfirm.next(it);
      })
    ).subscribe();
  }

  _updateOkText() {
    if (this._tooltipInstance) {
      this._tooltipInstance!.okText = this.okText;
      this._tooltipInstance!._markForCheck();
    }
  }

  _updateCancelText() {
    if (this._tooltipInstance) {
      this._tooltipInstance!.cancelText = this.cancelText;
      this._tooltipInstance!._markForCheck();
    }
  }

}
