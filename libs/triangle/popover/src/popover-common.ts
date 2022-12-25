/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import {
  Overlay,
  ScrollStrategy
} from '@angular/cdk/overlay';
import { InjectionToken } from '@angular/core';
import {
  SCROLL_THROTTLE_MS,
  TriTooltipDefaultOptions
} from '@gradii/triangle/tooltip';

export const TRI_POPOVER_DEFAULT_OPTIONS = new InjectionToken<TriTooltipDefaultOptions>(
  'tri-popover-default-options', {
    providedIn: 'root',
    factory   : TRI_POPOVER_DEFAULT_OPTIONS_FACTORY
  });

/** @docs-private */
export function TRI_POPOVER_DEFAULT_OPTIONS_FACTORY(): TriTooltipDefaultOptions {
  return {
    showDelay        : 100,
    hideDelay        : 100,
    touchendHideDelay: 1500,
  };
}

/** Injection token that determines the scroll handling while a tooltip is visible. */
export const TRI_POPOVER_SCROLL_STRATEGY =
  new InjectionToken<() => ScrollStrategy>('tri-tooltip-scroll-strategy');

/** @docs-private */
export const TRI_POPOVER_SCROLL_STRATEGY_FACTORY_PROVIDER = {
  provide   : TRI_POPOVER_SCROLL_STRATEGY,
  deps      : [Overlay],
  useFactory: TRI_POPOVER_SCROLL_STRATEGY_FACTORY,
};

/** @docs-private */
export function TRI_POPOVER_SCROLL_STRATEGY_FACTORY(overlay: Overlay): () => ScrollStrategy {
  return () => overlay.scrollStrategies.reposition({scrollThrottle: SCROLL_THROTTLE_MS});
}
