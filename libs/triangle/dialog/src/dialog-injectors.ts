/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Overlay, ScrollStrategy, } from '@angular/cdk/overlay';
import { InjectionToken } from '@angular/core';
import { TriDialogConfig } from './dialog.types';

/** Injection token that can be used to access the data that was passed in to a dialog. */
export const TRI_DIALOG_DATA = new InjectionToken<any>('DialogData');

/** Injection token that can be used to specify default dialog options. */
export const TRI_DIALOG_DEFAULT_OPTIONS =
  new InjectionToken<TriDialogConfig>('dialog-default-options');

/** Injection token that determines the scroll handling while the dialog is open. */
export const TRI_DIALOG_SCROLL_STRATEGY =
  new InjectionToken<() => ScrollStrategy>('dialog-scroll-strategy');

/** @docs-private */
export function TRI_DIALOG_SCROLL_STRATEGY_FACTORY(overlay: Overlay): () => ScrollStrategy {
  return () => overlay.scrollStrategies.block();
}

/** @docs-private */
export function TRI_DIALOG_SCROLL_STRATEGY_PROVIDER_FACTORY(overlay: Overlay):
  () => ScrollStrategy {
  return () => overlay.scrollStrategies.block();
}

/** @docs-private */
export const TRI_DIALOG_SCROLL_STRATEGY_PROVIDER = {
  provide   : TRI_DIALOG_SCROLL_STRATEGY,
  deps      : [Overlay],
  useFactory: TRI_DIALOG_SCROLL_STRATEGY_PROVIDER_FACTORY,
};
