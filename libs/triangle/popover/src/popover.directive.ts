/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { AriaDescriber, FocusMonitor } from '@angular/cdk/a11y';
import { Directionality } from '@angular/cdk/bidi';
import { Overlay } from '@angular/cdk/overlay';
import { Platform } from '@angular/cdk/platform';
import { ComponentType } from '@angular/cdk/portal';
import { ScrollDispatcher } from '@angular/cdk/scrolling';
import { DOCUMENT } from '@angular/common';
import {
  Directive, ElementRef, Inject, Input, NgZone, Optional, ViewContainerRef
} from '@angular/core';
import { PopoverComponent, } from './popover.component';
import { _TriTooltipBase, TriTooltipDefaultOptions } from '@gradii/triangle/tooltip';
import { TRI_POPOVER_DEFAULT_OPTIONS, TRI_POPOVER_SCROLL_STRATEGY } from './popover-common';

@Directive({
  selector: '[triPopover]',
  exportAs: 'triPopover',
  inputs  : [
    'position:triPopoverPosition',
    'disabled:triPopoverDisabled',
    'showDelay:triPopoverShowDelay',
    'hideDelay:triPopoverHideDelay',
    'touchGestures:triPopoverTouchGestures',
    'content:triPopover',
    'tooltipTrigger:triPopoverTrigger',
    'tooltipClass:triPopoverClass',
    'tooltipContext:triPopoverContext',
    'width:triPopoverWidth',
    'maxWidth:triPopoverMaxWidth',
    'minWidth:triPopoverMinWidth',
    'height:triPopoverHeight',
    'maxHeight:triPopoverMaxHeight',
    'minHeight:triPopoverMinHeight',
  ],
  host    : {
    'class': 'tri-popover-trigger'
  }
})
export class PopoverDirective extends _TriTooltipBase<PopoverComponent> {

  protected override _tooltipPrefix = 'tri-popover';

  protected override readonly _tooltipComponent: ComponentType<PopoverComponent> = PopoverComponent;

  constructor(
    overlay: Overlay,
    elementRef: ElementRef<HTMLElement>,
    scrollDispatcher: ScrollDispatcher,
    viewContainerRef: ViewContainerRef,
    ngZone: NgZone,
    platform: Platform,
    ariaDescriber: AriaDescriber,
    focusMonitor: FocusMonitor,
    @Inject(TRI_POPOVER_SCROLL_STRATEGY) scrollStrategy: any,
    @Optional() dir: Directionality,
    @Optional() @Inject(TRI_POPOVER_DEFAULT_OPTIONS) defaultOptions: TriTooltipDefaultOptions,
    @Inject(DOCUMENT) _document: any) {

    super(overlay, elementRef, scrollDispatcher, viewContainerRef, ngZone, platform, ariaDescriber,
      focusMonitor, scrollStrategy, dir, defaultOptions, _document);
  }

  // protected _content: TemplateRef<any>;
  private _title: string;

  @Input('triPopoverTitle')
  get title(): string {
    return this._title;
  }

  set title(value: string) {
    this._title = value;
    this._updateTitle();
  }

  override show(delay?: number) {
    if (this._tooltipInstance) {
      this._tooltipInstance.show(0);
    } else {
      super.show(delay);
    }

    if (this._title) {
      this._updateTitle();
    }
  }

  _updateTitle() {
    if (this._tooltipInstance) {
      this._tooltipInstance!.title = this._title;
      this._tooltipInstance!._markForCheck();
    }
  }

  // private _content: string
}
