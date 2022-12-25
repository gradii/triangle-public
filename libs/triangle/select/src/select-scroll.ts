import { Overlay, ScrollStrategy } from '@angular/cdk/overlay';
import { InjectionToken } from '@angular/core';

/** Injection token that determines the scroll handling while a select is open. */
export const TRI_SELECT_SCROLL_STRATEGY = new InjectionToken<() => ScrollStrategy>(
  'tri-select-scroll-strategy',
);

/** @docs-private */
export function TRI_SELECT_SCROLL_STRATEGY_PROVIDER_FACTORY(
  overlay: Overlay,
): () => ScrollStrategy {
  return () => overlay.scrollStrategies.reposition();
}

