/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { BaseHarnessFilters } from '@angular/cdk/testing';

/** A set of criteria that can be used to filter a list of `MatRadioButtonHarness` instances. */
export interface TabHarnessFilters extends BaseHarnessFilters {
  /** Only find instances whose label matches the given value. */
  label?: string | RegExp;
}

/** A set of criteria that can be used to filter a list of `MatRadioButtonHarness` instances. */
export interface TabGroupHarnessFilters extends BaseHarnessFilters {
  /** Only find instances whose selected tab label matches the given value. */
  selectedTabLabel?: string | RegExp;
}
