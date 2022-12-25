/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { AriaDescriber, FocusMonitor } from '@angular/cdk/a11y';
import { Directionality } from '@angular/cdk/bidi';
import { Overlay } from '@angular/cdk/overlay';
import { Platform } from '@angular/cdk/platform';
import { ScrollDispatcher } from '@angular/cdk/scrolling';
import { DOCUMENT } from '@angular/common';
import {
  AfterViewInit, Directive, ElementRef, Inject, NgZone, Optional, ViewContainerRef
} from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { _TriTooltipBase } from './tooltip-base';
import {
  TRI_TOOLTIP_DEFAULT_OPTIONS, TRI_TOOLTIP_SCROLL_STRATEGY, TriggerType
} from './tooltip.common';
import { TooltipComponent, } from './tooltip.component';
import { TriTooltipDefaultOptions } from './tooltip.interface';

@Directive({
  selector: '[triTooltip]',
  exportAs: 'triTooltip',
  host    : {
    'class': 'tri-tooltip-trigger'
  }
})
export class TooltipDirective extends _TriTooltipBase<TooltipComponent> implements AfterViewInit {
  protected readonly _tooltipComponent = TooltipComponent;

  constructor(
    overlay: Overlay,
    elementRef: ElementRef<HTMLElement>,
    scrollDispatcher: ScrollDispatcher,
    viewContainerRef: ViewContainerRef,
    ngZone: NgZone,
    platform: Platform,
    ariaDescriber: AriaDescriber,
    focusMonitor: FocusMonitor,
    @Inject(TRI_TOOLTIP_SCROLL_STRATEGY) scrollStrategy: any,
    @Optional() dir: Directionality,
    @Optional() @Inject(TRI_TOOLTIP_DEFAULT_OPTIONS) defaultOptions: TriTooltipDefaultOptions,
    @Inject(DOCUMENT) _document: any) {

    super(overlay, elementRef, scrollDispatcher, viewContainerRef, ngZone, platform, ariaDescriber,
      focusMonitor, scrollStrategy, dir, defaultOptions, _document);
  }

  override ngAfterViewInit() {
    super.ngAfterViewInit();

    this._focusMonitor.monitor(this._elementRef)
      .pipe(takeUntil(this._destroyed))
      .subscribe(origin => {
        // Note that the focus monitor runs outside the Angular zone.
        if (!origin) {
          this._ngZone.run(() => this.hide(50));
        } else if (origin === 'keyboard') {
          if (this._tooltipTrigger !== TriggerType.NOOP) {
            this._ngZone.run(() => this.show());
          }
        }
      });
  }

  static ngAcceptInputType_content: string;
}
