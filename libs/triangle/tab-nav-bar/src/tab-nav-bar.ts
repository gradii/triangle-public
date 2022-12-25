/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */


import { Directionality } from '@angular/cdk/bidi';
import { BooleanInput } from '@angular/cdk/coercion';
import { Platform } from '@angular/cdk/platform';
import { ViewportRuler } from '@angular/cdk/scrolling';
import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component, ContentChildren, ElementRef, forwardRef,
  Inject, NgZone, Optional, QueryList, ViewChild, ViewEncapsulation,
} from '@angular/core';
import { ANIMATION_MODULE_TYPE } from '@angular/platform-browser/animations';
import { TriInkBar } from '@gradii/triangle/tabs';
import { TriTabLink } from './tab-link';
import { _TriTabNavBase } from './tab-nav-base';

/**
 * Navigation component matching the styles of the tab group header.
 * Provides anchored navigation with animated ink bar.
 */
@Component({
  selector: '[tri-tab-nav-bar]',
  exportAs: 'triTabNavBar, triTabNav',
  inputs: ['color'],
  templateUrl: 'tab-nav-bar.html',
  styleUrls: ['../style/tab-nav-bar.scss'],
  host: {
    'class': 'tri-tab-nav-bar tri-tab-header',
    '[class.tri-tab-header-pagination-controls-enabled]': '_showPaginationControls',
    '[class.tri-tab-header-rtl]': "_getLayoutDirection() == 'rtl'",
    '[class.tri-primary]': 'color !== "warn" && color !== "accent"',
    '[class.tri-accent]': 'color === "accent"',
    '[class.tri-warn]': 'color === "warn"',
  },
  encapsulation: ViewEncapsulation.None,
  // tslint:disable-next-line:validate-decorators
  changeDetection: ChangeDetectionStrategy.Default,
})
export class TriTabNav extends _TriTabNavBase {
  @ContentChildren(forwardRef(() => TriTabLink), {descendants: true}) _items: QueryList<TriTabLink>;
  @ViewChild(TriInkBar, {static: true}) _inkBar: TriInkBar;
  @ViewChild('tabListContainer', {static: true}) _tabListContainer: ElementRef;
  @ViewChild('tabList', {static: true}) _tabList: ElementRef;
  @ViewChild('nextPaginator') _nextPaginator: ElementRef<HTMLElement>;
  @ViewChild('previousPaginator') _previousPaginator: ElementRef<HTMLElement>;

  constructor(
    elementRef: ElementRef,
    @Optional() dir: Directionality,
    ngZone: NgZone,
    changeDetectorRef: ChangeDetectorRef,
    viewportRuler: ViewportRuler,
    platform: Platform,
    @Optional() @Inject(ANIMATION_MODULE_TYPE) animationMode?: string,
  ) {
    super(elementRef, dir, ngZone, changeDetectorRef, viewportRuler, platform, animationMode);
  }

  static ngAcceptInputType_disableRipple: BooleanInput;
}
