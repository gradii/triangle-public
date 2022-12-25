/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { BooleanInput } from '@angular/cdk/coercion';
import { TemplatePortal } from '@angular/cdk/portal';
import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  Inject,
  InjectionToken,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Optional,
  SimpleChanges,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
  ViewEncapsulation,
} from '@angular/core';
import { CanDisable, CanDisableCtor, mixinDisabled } from '@gradii/triangle/core';
import { Subject } from 'rxjs';
import { TriTabContent } from './tab-content';
import { TriTabLabel } from './tab-label';


// Boilerplate for applying mixins to TriTab.
/** @docs-private */
class TriTabBase {
}

const _TriTabMixinBase: CanDisableCtor & typeof TriTabBase =
        mixinDisabled(TriTabBase);

/**
 * Used to provide a tab group to a tab without causing a circular dependency.
 * @docs-private
 */
export const TRI_TAB_GROUP = new InjectionToken<any>('TRI_TAB_GROUP');

@Component({
  selector       : 'tri-tab',
  templateUrl    : './tab.html',
  inputs         : ['disabled'],
  // tslint:disable-next-line:validate-decorators
  changeDetection: ChangeDetectionStrategy.Default,
  encapsulation  : ViewEncapsulation.None,
  exportAs       : 'triTab',
})
export class TriTab extends _TriTabMixinBase implements OnInit, CanDisable, OnChanges, OnDestroy {
  static ngAcceptInputType_disabled: BooleanInput;
  /**
   * Template provided in the tab content that will be used if present, used to enable lazy-loading
   */
  @ContentChild(TriTabContent, {read: TemplateRef, static: true})
  _explicitContent: TemplateRef<any>;
  /** Template inside the TriTab view that contains an `<ng-content>`. */
  @ViewChild(TemplateRef, {static: true}) _implicitContent: TemplateRef<any>;
  /** Plain text label for the tab, used when there is no template label. */
  @Input('label') textLabel: string = '';

  @Input('title')
  set title(value: string) {
    this.textLabel = value;
  }

  @Input('name')
  tabName = '';

  /** Aria label for the tab. */
  @Input('aria-label') ariaLabel: string;
  /**
   * Reference to the element that the tab is labelled by.
   * Will be cleared if `aria-label` is set at the same time.
   */
  @Input('aria-labelledby') ariaLabelledby: string;
  /** Emits whenever the internal state of the tab changes. */
  readonly _stateChanges = new Subject<void>();
  /**
   * The relatively indexed position where 0 represents the center, negative is left, and positive
   * represents the right.
   */
  position: number | null = null;
  /**
   * The initial relatively index origin of the tab if it was created and selected after there
   * was already a selected tab. Provides context of what position the tab should originate from.
   */
  origin: number | null = null;
  /**
   * Whether the tab is currently active.
   */
  isActive = false;
  /** Portal that will be the hosted content of the tab */
  private _contentPortal: TemplatePortal | null = null;

  constructor(
    private _viewContainerRef: ViewContainerRef,
    /**
     * @deprecated `_closestTabGroup` parameter to become required.
     * @breaking-change 10.0.0
     */
    @Optional() @Inject(TRI_TAB_GROUP) public _closestTabGroup?: any) {
    super();
  }

  private _templateLabel: TriTabLabel;

  /** Content for the tab label given by `<ng-template tri-tab-label>`. */
  @ContentChild(TriTabLabel)
  get templateLabel(): TriTabLabel {
    return this._templateLabel;
  }

  set templateLabel(value: TriTabLabel) {
    // Only update the templateLabel via query if there is actually
    // a TriTabLabel found. This works around an issue where a user may have
    // manually set `templateLabel` during creation mode, which would then get clobbered
    // by `undefined` when this query resolves.
    if (value) {
      this._templateLabel = value;
    }
  }

  /** @docs-private */
  get content(): TemplatePortal | null {
    return this._contentPortal;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.hasOwnProperty('textLabel') || changes.hasOwnProperty('disabled')) {
      this._stateChanges.next();
    }
  }

  ngOnDestroy(): void {
    this._stateChanges.complete();
  }

  ngOnInit(): void {
    this._contentPortal = new TemplatePortal(
      this._explicitContent || this._implicitContent, this._viewContainerRef);
  }
}
