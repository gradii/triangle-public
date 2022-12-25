/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Directionality } from '@angular/cdk/bidi';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { Platform } from '@angular/cdk/platform';
import { ViewportRuler } from '@angular/cdk/scrolling';
import {
  AfterContentChecked, AfterContentInit, ChangeDetectorRef, Directive, ElementRef, Inject, Input,
  NgZone,
  OnDestroy, Optional,
  QueryList,
} from '@angular/core';
import { ANIMATION_MODULE_TYPE } from '@angular/platform-browser/animations';
import { startWith, takeUntil } from 'rxjs/operators';
import { ThemePalette } from '@gradii/triangle/core';
import { ɵTriPaginatedTabHeader, ɵTriPaginatedTabHeaderItem } from '@gradii/triangle/tabs';

/**
 * Base class with all of the `TriTabNav` functionality.
 * @docs-private
 */
@Directive()
export abstract class _TriTabNavBase
  extends ɵTriPaginatedTabHeader
  implements AfterContentChecked, AfterContentInit, OnDestroy {
  /** Query list of all tab links of the tab navigation. */
  abstract override _items: QueryList<ɵTriPaginatedTabHeaderItem & { active: boolean }>;

  /** Background color of the tab nav. */
  @Input()
  get backgroundColor(): ThemePalette {
    return this._backgroundColor;
  }

  set backgroundColor(value: ThemePalette) {
    const classList = this._elementRef.nativeElement.classList;
    classList.remove(`tri-background-${this.backgroundColor}`);

    if (value) {
      classList.add(`tri-background-${value}`);
    }

    this._backgroundColor = value;
  }

  private _backgroundColor: ThemePalette;

  private _disableRipple: boolean = true;

  /** Whether the ripple effect is disabled or not. */
  @Input()
  get disableRipple() {
    return this._disableRipple;
  }

  set disableRipple(value: any) {
    this._disableRipple = coerceBooleanProperty(value);
  }

  /** Theme color of the nav bar. */
  @Input() color: ThemePalette = 'primary';

  constructor(
    elementRef: ElementRef,
    @Optional() dir: Directionality,
    ngZone: NgZone,
    changeDetectorRef: ChangeDetectorRef,
    viewportRuler: ViewportRuler,
    platform: Platform,
    @Optional() @Inject(ANIMATION_MODULE_TYPE) animationMode?: string,
  ) {
    super(elementRef, changeDetectorRef, viewportRuler, dir, ngZone, platform, animationMode);
  }

  protected _itemSelected() {
    // noop
  }

  override ngAfterContentInit() {
    // We need this to run before the `changes` subscription in parent to ensure that the
    // selectedIndex is up-to-date by the time the super class starts looking for it.
    this._items.changes.pipe(startWith(null), takeUntil(this._destroyed)).subscribe(() => {
      this.updateActiveLink();
    });

    super.ngAfterContentInit();
  }

  /** Notifies the component that the active link has been changed. */
  updateActiveLink() {
    if (!this._items) {
      return;
    }

    const items = this._items.toArray();

    for (let i = 0; i < items.length; i++) {
      if (items[i].active) {
        this.selectedIndex = i;
        this._changeDetectorRef.markForCheck();
        return;
      }
    }

    // The ink bar should hide itself if no items are active.
    this.selectedIndex = -1;
    this._inkBar.hide();
  }
}
