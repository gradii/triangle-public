/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */
import { InjectionToken } from '@angular/core';

/** Object that can be used to configure the default options for the tabs module. */
export interface TriTabsConfig {
  /** Duration for the tab animation. Must be a valid CSS value (e.g. 600ms). */
  animationDuration?: string;

  /**
   * Whether pagination should be disabled. This can be used to avoid unnecessary
   * layout recalculations if it's known that pagination won't be required.
   */
  disablePagination?: boolean;

  /**
   * Whether the ink bar should fit its width to the size of the tab label content.
   * This only applies to the MDC-based tabs.
   */
  fitInkBarToContent?: boolean;
}

/** Injection token that can be used to provide the default options the tabs module. */
export const TRI_TABS_CONFIG = new InjectionToken<TriTabsConfig>('TRI_TABS_CONFIG');
