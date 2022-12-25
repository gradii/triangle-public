/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Directionality } from '@angular/cdk/bidi';
import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';
import { Platform } from '@angular/cdk/platform';
import { ViewportRuler } from '@angular/cdk/scrolling';
import {
  AfterContentChecked,
  AfterContentInit,
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  Directive,
  ElementRef,
  Inject,
  Input,
  NgZone,
  OnDestroy,
  Optional,
  QueryList,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { ANIMATION_MODULE_TYPE } from '@angular/platform-browser/animations';
import { TriInkBar } from './ink-bar';
import { TriPaginatedTabHeader } from './paginated-tab-header';
import { TriTabLabelWrapper } from './tab-label-wrapper';

/**
 * Base class with all of the `TriTabHeader` functionality.
 * @docs-private
 */
@Directive()
// tslint:disable-next-line:class-name
export abstract class _TriTabHeaderBase extends TriPaginatedTabHeader
  implements AfterContentChecked, AfterContentInit, AfterViewInit, OnDestroy {

  constructor(elementRef: ElementRef,
              changeDetectorRef: ChangeDetectorRef,
              viewportRuler: ViewportRuler,
              @Optional() dir: Directionality,
              ngZone: NgZone,
              platform: Platform,
              // @breaking-change 9.0.0 `_animationMode` parameter to be made required.
              @Optional() @Inject(ANIMATION_MODULE_TYPE) animationMode?: string) {
    super(elementRef, changeDetectorRef, viewportRuler, dir, ngZone, platform, animationMode);
  }

  private _disableRipple: boolean = false;

  /** Whether the ripple effect is disabled or not. */
  @Input()
  get disableRipple() {
    return this._disableRipple;
  }

  set disableRipple(value: any) {
    this._disableRipple = coerceBooleanProperty(value);
  }

  protected _itemSelected(event: KeyboardEvent) {
    event.preventDefault();
  }
}

/**
 * The header of the tab group which displays a list of all the tabs in the tab group. Includes
 * an ink bar that follows the currently selected tab. When the tabs list's width exceeds the
 * width of the header container, then arrows will be displayed to allow the user to scroll
 * left and right across the header.
 * @docs-private
 */
@Component({
  selector     : 'tri-tab-header',
  templateUrl  : 'tab-header.html',
  styleUrls    : ['../style/tab-header.scss'],
  inputs       : ['selectedIndex'],
  outputs      : ['selectFocusedIndex', 'indexFocused'],
  encapsulation: ViewEncapsulation.None,
  // tslint:disable-next-line:validate-decorators
  changeDetection: ChangeDetectionStrategy.Default,
  host           : {
    'class'                                             : 'tri-tab-header',
    '[class.tri-tab-header-pagination-controls-enabled]': '_showPaginationControls',
    '[class.tri-tab-header-rtl]'                        : "_getLayoutDirection() == 'rtl'",
  },
})
export class TriTabHeader extends _TriTabHeaderBase {
  static ngAcceptInputType_disableRipple: BooleanInput;
  @ContentChildren(TriTabLabelWrapper, {descendants: false}) _items: QueryList<TriTabLabelWrapper>;
  @ViewChild(TriInkBar, {static: true}) _inkBar: TriInkBar;
  @ViewChild('tabListContainer', {static: true}) _tabListContainer: ElementRef;
  @ViewChild('tabList', {static: true}) _tabList: ElementRef;
  @ViewChild('nextPaginator') _nextPaginator: ElementRef<HTMLElement>;
  @ViewChild('previousPaginator') _previousPaginator: ElementRef<HTMLElement>;

  constructor(elementRef: ElementRef,
              changeDetectorRef: ChangeDetectorRef,
              viewportRuler: ViewportRuler,
              @Optional() dir: Directionality,
              ngZone: NgZone,
              platform: Platform,
              // @breaking-change 9.0.0 `_animationMode` parameter to be made required.
              @Optional() @Inject(ANIMATION_MODULE_TYPE) animationMode?: string) {
    super(elementRef, changeDetectorRef, viewportRuler, dir, ngZone, platform, animationMode);
  }
}
