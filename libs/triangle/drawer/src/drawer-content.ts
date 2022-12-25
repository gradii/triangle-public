/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { CdkScrollable, ScrollDispatcher } from '@angular/cdk/scrolling';
import {
  AfterContentInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, forwardRef,
  Inject, NgZone, ViewEncapsulation
} from '@angular/core';
import { TriDrawerContainer } from './drawer-container';

@Component({
  selector       : 'tri-drawer-content',
  template       : '<ng-content></ng-content>',
  host           : {
    'class'                  : 'tri-drawer-content',
    '[style.margin-left.px]' : '_container._contentMargins.left',
    '[style.margin-right.px]': '_container._contentMargins.right',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation  : ViewEncapsulation.None,
})
export class TriDrawerContent extends CdkScrollable implements AfterContentInit {
  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    @Inject(forwardRef(() => TriDrawerContainer)) public _container: TriDrawerContainer,
    elementRef: ElementRef<HTMLElement>,
    scrollDispatcher: ScrollDispatcher,
    ngZone: NgZone) {
    super(elementRef, scrollDispatcher, ngZone);
  }

  ngAfterContentInit() {
    this._container._contentMarginChanges.subscribe(() => {
      this._changeDetectorRef.markForCheck();
    });
  }
}
