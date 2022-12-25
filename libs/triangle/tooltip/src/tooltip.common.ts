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
import { SCROLL_THROTTLE_MS, } from './tooltip.component';
import { TriTooltipDefaultOptions } from './tooltip.interface';

export const enum TriggerType {
  CLICK = 'click',
  HINT = 'hint',
  HOVER = 'hover',
  NOOP  = 'noop',
}

/**
 * Creates an error to be thrown if the user supplied an invalid tooltip position.
 * @docs-private
 */
export function getTriTooltipInvalidPositionError(position: string) {
  return Error(`Tooltip position "${position}" is invalid.`);
}


/** Injection token to be used to override the default options for `triTooltip`. */
export const TRI_TOOLTIP_DEFAULT_OPTIONS =
  new InjectionToken<TriTooltipDefaultOptions>('tri-tooltip-default-options', {
    providedIn: 'root',
    factory   : TRI_TOOLTIP_DEFAULT_OPTIONS_FACTORY
  });

/** @docs-private */
export function TRI_TOOLTIP_DEFAULT_OPTIONS_FACTORY(): TriTooltipDefaultOptions {
  return {
    showDelay        : 100,
    hideDelay        : 100,
    touchendHideDelay: 1500,
  };
}

/** Injection token that determines the scroll handling while a tooltip is visible. */
export const TRI_TOOLTIP_SCROLL_STRATEGY =
  new InjectionToken<() => ScrollStrategy>('tri-tooltip-scroll-strategy');

/** @docs-private */
export function TRI_TOOLTIP_SCROLL_STRATEGY_FACTORY(overlay: Overlay): () => ScrollStrategy {
  return () => overlay.scrollStrategies.reposition({scrollThrottle: SCROLL_THROTTLE_MS});
}


/** @docs-private */
export const TRI_TOOLTIP_SCROLL_STRATEGY_FACTORY_PROVIDER = {
  provide   : TRI_TOOLTIP_SCROLL_STRATEGY,
  deps      : [Overlay],
  useFactory: TRI_TOOLTIP_SCROLL_STRATEGY_FACTORY,
};
