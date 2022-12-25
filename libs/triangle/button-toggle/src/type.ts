/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { InjectionToken } from '@angular/core';
import type { TriButtonToggleGroup } from './button-toggle-group';

/** Possible appearance styles for the button toggle. */
export type TriButtonToggleColor = 'default' | 'primary' | 'warning';

/**
 * Represents the default options for the button toggle that can be configured
 * using the `TRI_BUTTON_TOGGLE_DEFAULT_OPTIONS` injection token.
 */
export interface TriButtonToggleDefaultOptions {
  /**
   * Default appearance to be used by button toggles. Can be overridden by explicitly
   * setting an appearance on a button toggle or group.
   */
  appearance?: TriButtonToggleColor;
}

/**
 * Injection token that can be used to configure the
 * default options for all button toggles within an app.
 */
export const TRI_BUTTON_TOGGLE_DEFAULT_OPTIONS = new InjectionToken<TriButtonToggleDefaultOptions>(
  'TRI_BUTTON_TOGGLE_DEFAULT_OPTIONS',
);


/**
 * Injection token that can be used to reference instances of `TriButtonToggleGroup`.
 * It serves as alternative token to the actual `TriButtonToggleGroup` class which
 * could cause unnecessary retention of the class and its component metadata.
 */
export const TRI_BUTTON_TOGGLE_GROUP = new InjectionToken<TriButtonToggleGroup>(
  'TriButtonToggleGroup',
);
