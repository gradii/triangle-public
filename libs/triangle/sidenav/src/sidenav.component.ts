/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { FocusMonitor, FocusTrapFactory, InteractivityChecker } from '@angular/cdk/a11y';
import {
  BooleanInput, coerceBooleanProperty, coerceNumberProperty, NumberInput
} from '@angular/cdk/coercion';
import { Platform } from '@angular/cdk/platform';
import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy, Component, ElementRef, Inject, Input, NgZone, OnDestroy, Optional,
  ViewEncapsulation,
} from '@angular/core';
import {
  TRI_DRAWER_CONTAINER, TriDrawer, triDrawerAnimations, TriDrawerContainer
} from '@gradii/triangle/drawer';
import { SidenavService } from './sidenav.service';


@Component({
  selector       : 'tri-sidenav',
  exportAs       : 'triSidenav',
  templateUrl    : 'sidenav.html',
  animations     : [triDrawerAnimations.transformDrawer],
  host           : {
    'class'   : 'tri-drawer tri-sidenav',
    'tabIndex': '-1',
    // must prevent the browser from aligning text based on value
    '[attr.align]'             : 'null',
    '[class.tri-drawer-end]'   : 'position === "end"',
    '[class.tri-drawer-over]'  : 'mode === "over"',
    '[class.tri-drawer-push]'  : 'mode === "push"',
    '[class.tri-drawer-side]'  : 'mode === "side"',
    '[class.tri-drawer-opened]': 'opened',
    '[class.tri-sidenav-fixed]': 'fixedInViewport',
    '[style.top.px]'           : 'fixedInViewport ? fixedTopGap : null',
    '[style.bottom.px]'        : 'fixedInViewport ? fixedBottomGap : null',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation  : ViewEncapsulation.None,
})
export class SidenavComponent extends TriDrawer implements OnDestroy {
  static ngAcceptInputType_fixedInViewport: BooleanInput;
  static ngAcceptInputType_fixedTopGap: NumberInput;
  static ngAcceptInputType_fixedBottomGap: NumberInput;

  private _fixedInViewport = false;

  /** Whether the sidenav is fixed in the viewport. */
  @Input()
  get fixedInViewport(): boolean {
    return this._fixedInViewport;
  }

  set fixedInViewport(value) {
    this._fixedInViewport = coerceBooleanProperty(value);
  }

  private _fixedTopGap = 0;

  /**
   * The gap between the top of the sidenav and the top of the viewport when the sidenav is in fixed
   * mode.
   */
  @Input()
  get fixedTopGap(): number {
    return this._fixedTopGap;
  }

  set fixedTopGap(value) {
    this._fixedTopGap = coerceNumberProperty(value);
  }

  private _fixedBottomGap = 0;

  /**
   * The gap between the bottom of the sidenav and the bottom of the viewport when the sidenav is in
   * fixed mode.
   */
  @Input()
  get fixedBottomGap(): number {
    return this._fixedBottomGap;
  }

  set fixedBottomGap(value) {
    this._fixedBottomGap = coerceNumberProperty(value);
  }

  constructor(private sidenavService: SidenavService,
              public elementRef: ElementRef<HTMLElement>,
              _focusTrapFactory: FocusTrapFactory,
              _focusMonitor: FocusMonitor,
              _platform: Platform,
              _ngZone: NgZone,
              _interactivityChecker: InteractivityChecker,
              @Optional() @Inject(DOCUMENT) _doc: any,
              @Optional() @Inject(TRI_DRAWER_CONTAINER) _container?: TriDrawerContainer
  ) {
    super(
      elementRef, _focusTrapFactory, _focusMonitor, _platform, _ngZone,
      _interactivityChecker, _doc, _container
    );
    sidenavService._registrySidenavComponent(this);
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.sidenavService._unRegistrySidenavComponent(this);
  }
}
