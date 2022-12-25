/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { HighContrastModeDetector } from '@angular/cdk/a11y';
import { BidiModule } from '@angular/cdk/bidi';
import { Inject, InjectionToken, isDevMode, NgModule, Optional, Version } from '@angular/core';
import { StringTemplateOutletDirective } from './string_template_outlet';


// Private version constant to circumvent test/build issues,
// i.e. avoid core to depend on the @angular/material primary entry-point
// Can be removed once the Material primary entry-point no longer
// re-exports all secondary entry-points
const VERSION = new Version('0.0.0-PLACEHOLDER');

/** @docs-private */
export function TRIANGLE_SANITY_CHECKS_FACTORY(): SanityChecks {
  return true;
}

/** Injection token that configures whether the Material sanity checks are enabled. */
export const TRIANGLE_SANITY_CHECKS = new InjectionToken<SanityChecks>('mat-sanity-checks', {
  providedIn: 'root',
  factory   : TRIANGLE_SANITY_CHECKS_FACTORY,
});

/**
 * Possible sanity checks that can be enabled. If set to
 * true/false, all checks will be enabled/disabled.
 */
export type SanityChecks = boolean | GranularSanityChecks;

/** Object that can be used to configure the sanity checks granularly. */
export interface GranularSanityChecks {
  doctype: boolean;
  theme: boolean;
  version: boolean;
}

/**
 * Module that captures anything that should be loaded and/or run for *all* Angular Material
 * components. This includes Bidi, etc.
 *
 * This module should be imported to each top-level component module (e.g., MatTabsModule).
 */
@NgModule({
  imports     : [BidiModule],
  exports     : [BidiModule, StringTemplateOutletDirective],
  declarations: [StringTemplateOutletDirective]
})
export class TriCommonModule {
  /** Whether we've done the global sanity checks (e.g. a theme is loaded, there is a doctype). */
  private _hasDoneGlobalChecks = false;

  /** Reference to the global `document` object. */
  private _document = typeof document === 'object' && document ? document : null;

  /** Reference to the global 'window' object. */
  private _window = typeof window === 'object' && window ? window : null;

  /** Configured sanity checks. */
  private _sanityChecks: SanityChecks;

  constructor(
    highContrastModeDetector: HighContrastModeDetector,
    @Optional() @Inject(TRIANGLE_SANITY_CHECKS) sanityChecks: any) {
    // While A11yModule also does this, we repeat it here to avoid importing A11yModule
    // in MatCommonModule.
    highContrastModeDetector._applyBodyHighContrastModeCssClasses();

    // Note that `_sanityChecks` is typed to `any`, because AoT
    // throws an error if we use the `SanityChecks` type directly.
    this._sanityChecks = sanityChecks;

    if (!this._hasDoneGlobalChecks) {
      this._checkDoctypeIsDefined();
      this._checkThemeIsPresent();
      this._hasDoneGlobalChecks = true;
    }
  }

  /** Whether any sanity checks are enabled. */
  private _checksAreEnabled(): boolean {
    return isDevMode() && !this._isTestEnv();
  }

  /** Whether the code is running in tests. */
  private _isTestEnv() {
    const window = this._window as any;
    return window && (window.__karma__ || window.jasmine);
  }

  private _checkDoctypeIsDefined(): void {
    const isEnabled = this._checksAreEnabled() &&
      (this._sanityChecks === true || (this._sanityChecks as GranularSanityChecks).doctype);

    if (isEnabled && this._document && !this._document.doctype) {
      console.warn(
        'Current document does not have a doctype. This may cause ' +
        'some Angular Material components not to behave as expected.'
      );
    }
  }

  private _checkThemeIsPresent(): void {
    // We need to assert that the `body` is defined, because these checks run very early
    // and the `body` won't be defined if the consumer put their scripts in the `head`.
    const isDisabled = !this._checksAreEnabled() ||
      (this._sanityChecks === false || !(this._sanityChecks as GranularSanityChecks).theme);

    if (isDisabled || !this._document || !this._document.body ||
      typeof getComputedStyle !== 'function') {
      return;
    }

    const testElement = this._document.createElement('div');

    testElement.classList.add('mat-theme-loaded-marker');
    this._document.body.appendChild(testElement);

    const computedStyle = getComputedStyle(testElement);

    // In some situations the computed style of the test element can be null. For example in
    // Firefox, the computed style is null if an application is running inside of a hidden iframe.
    // See: https://bugzilla.mozilla.org/show_bug.cgi?id=548397
    if (computedStyle && computedStyle.display !== 'none') {
      console.warn(
        'Could not find Angular Material core theme. Most Material ' +
        'components may not work as expected. For more info refer ' +
        'to the theming guide: https://material.angular.io/guide/theming'
      );
    }

    this._document.body.removeChild(testElement);
  }
}
