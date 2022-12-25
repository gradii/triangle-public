/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { FocusableOption, FocusMonitor } from '@angular/cdk/a11y';
import { BooleanInput, coerceBooleanProperty, NumberInput } from '@angular/cdk/coercion';
import {
  AfterViewInit, Attribute, Directive, ElementRef, Inject, Input, OnDestroy, Optional
} from '@angular/core';
import { ANIMATION_MODULE_TYPE } from '@angular/platform-browser/animations';

// Boilerplate for applying mixins to TriTabLink.
import {
  CanDisable, CanDisableRipple, HasTabIndex, TRI_RIPPLE_GLOBAL_OPTIONS, mixinDisabled,
  mixinDisableRipple, mixinTabIndex,
  RippleConfig, RippleGlobalOptions,
  RippleTarget
} from '@gradii/triangle/core';
import { _TriTabNavBase } from './tab-nav-base';

const _TriTabLinkMixinBase = mixinTabIndex(mixinDisableRipple(mixinDisabled(class {
})));

/** Base class with all of the `TriTabLink` functionality. */
@Directive()
export class _TriTabLinkBase extends _TriTabLinkMixinBase
  implements AfterViewInit,
    OnDestroy,
    CanDisable,
    CanDisableRipple,
    HasTabIndex,
    RippleTarget,
    FocusableOption {
  /** Whether the tab link is active or not. */
  protected _isActive: boolean = false;

  /** Whether the link is active. */
  @Input()
  get active(): boolean {
    return this._isActive;
  }

  set active(value: boolean) {
    const newValue = coerceBooleanProperty(value);

    if (newValue !== this._isActive) {
      this._isActive = value;
      this._tabNavBar.updateActiveLink();
    }
  }

  /**
   * Ripple configuration for ripples that are launched on pointer down. The ripple config
   * is set to the global ripple options since we don't have any configurable options for
   * the tab link ripples.
   * @docs-private
   */
  rippleConfig: RippleConfig & RippleGlobalOptions;

  /**
   * Whether ripples are disabled on interaction.
   * @docs-private
   */
  get rippleDisabled(): boolean {
    return (
      this.disabled ||
      this.disableRipple ||
      this._tabNavBar.disableRipple ||
      !!this.rippleConfig.disabled
    );
  }

  constructor(
    private _tabNavBar: _TriTabNavBase,
    /** @docs-private */ public elementRef: ElementRef,
    @Optional() @Inject(TRI_RIPPLE_GLOBAL_OPTIONS) globalRippleOptions: RippleGlobalOptions | null,
    @Attribute('tabindex') tabIndex: string,
    private _focusMonitor: FocusMonitor,
    @Optional() @Inject(ANIMATION_MODULE_TYPE) animationMode?: string,
  ) {
    super();

    this.rippleConfig = globalRippleOptions || {};
    this.tabIndex     = parseInt(tabIndex) || 0;

    if (animationMode === 'NoopAnimations') {
      this.rippleConfig.animation = {enterDuration: 0, exitDuration: 0};
    }
  }

  /** Focuses the tab link. */
  focus() {
    this.elementRef.nativeElement.focus();
  }

  ngAfterViewInit() {
    this._focusMonitor.monitor(this.elementRef);
  }

  ngOnDestroy() {
    this._focusMonitor.stopMonitoring(this.elementRef);
  }

  _handleFocus() {
    // Since we allow navigation through tabbing in the nav bar, we
    // have to update the focused index whenever the link receives focus.
    this._tabNavBar.focusIndex = this._tabNavBar._items.toArray().indexOf(this);
  }

  static ngAcceptInputType_active: BooleanInput;
  static ngAcceptInputType_disabled: BooleanInput;
  static ngAcceptInputType_disableRipple: BooleanInput;
  static ngAcceptInputType_tabIndex: NumberInput;
}
