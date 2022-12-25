/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { FocusMonitor } from '@angular/cdk/a11y';
import { Platform } from '@angular/cdk/platform';
import {
  Attribute, Directive, ElementRef, Inject, NgZone, OnDestroy, Optional
} from '@angular/core';
import { ANIMATION_MODULE_TYPE } from '@angular/platform-browser/animations';
import { TRI_RIPPLE_GLOBAL_OPTIONS, RippleGlobalOptions, RippleRenderer } from '@gradii/triangle/core';
import { _TriTabLinkBase } from './tab-link-base';
import { TriTabNav } from './tab-nav-bar';

/**
 * Link inside of a `tri-tab-nav-bar`.
 */
@Directive({
  selector: '[tri-tab-link], [triTabLink]',
  exportAs: 'triTabLink',
  inputs: ['disabled', 'disableRipple', 'tabIndex'],
  host: {
    'class': 'tri-tab-link mat-focus-indicator',
    '[attr.aria-current]': 'active ? "page" : null',
    '[attr.aria-disabled]': 'disabled',
    '[attr.tabIndex]': 'tabIndex',
    '[class.tri-tab-disabled]': 'disabled',
    '[class.tri-tab-label-active]': 'active',
    '(focus)': '_handleFocus()',
  },
})
export class TriTabLink extends _TriTabLinkBase implements OnDestroy {
  /** Reference to the RippleRenderer for the tab-link. */
  private _tabLinkRipple: RippleRenderer;

  constructor(
    tabNavBar: TriTabNav,
    elementRef: ElementRef,
    ngZone: NgZone,
    platform: Platform,
    @Optional() @Inject(TRI_RIPPLE_GLOBAL_OPTIONS) globalRippleOptions: RippleGlobalOptions | null,
    @Attribute('tabindex') tabIndex: string,
    focusMonitor: FocusMonitor,
    @Optional() @Inject(ANIMATION_MODULE_TYPE) animationMode?: string,
  ) {
    super(tabNavBar, elementRef, globalRippleOptions, tabIndex, focusMonitor, animationMode);
    this._tabLinkRipple = new RippleRenderer(this, ngZone, elementRef, platform);
    this._tabLinkRipple.setupTriggerEvents(elementRef.nativeElement);
  }

  override ngOnDestroy() {
    super.ngOnDestroy();
    this._tabLinkRipple._removeTriggerEvents();
  }
}
