/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Overlay } from '@angular/cdk/overlay';
import { InjectionToken } from '@angular/core';
import {
  TRI_SELECT_SCROLL_STRATEGY, TRI_SELECT_SCROLL_STRATEGY_PROVIDER_FACTORY
} from './select-scroll';

/** Object that can be used to configure the default options for the select module. */
export interface TriSelectConfig {
  /** Whether option centering should be disabled. */
  disableOptionCentering?: boolean;

  /** Time to wait in milliseconds after the last keystroke before moving focus to an item. */
  typeaheadDebounceInterval?: number;

  /** Class or list of classes to be applied to the menu's overlay panel. */
  overlayPanelClass?: string | string[];
}

/** Injection token that can be used to provide the default options the select module. */
export const TRI_SELECT_CONFIG = new InjectionToken<TriSelectConfig>('TRI_SELECT_CONFIG');

/** @docs-private */
export const TRI_SELECT_SCROLL_STRATEGY_PROVIDER = {
  provide   : TRI_SELECT_SCROLL_STRATEGY,
  deps      : [Overlay],
  useFactory: TRI_SELECT_SCROLL_STRATEGY_PROVIDER_FACTORY,
};

