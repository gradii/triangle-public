/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { QueryList } from '@angular/core';
import { TriOptgroup } from './optgroup';
import { TriOption } from './option';

/**
 * Counts the amount of option group labels that precede the specified option.
 * @param optionIndex Index of the option at which to start counting.
 * @param options Flat list of all of the options.
 * @param optionGroups Flat list of all of the option groups.
 * @docs-private
 */
export function _countGroupLabelsBeforeOption(optionIndex: number, options: QueryList<TriOption>,
                                              optionGroups: QueryList<TriOptgroup>): number {

  if (optionGroups.length) {
    const optionsArray = options.toArray();
    const groups       = optionGroups.toArray();
    let groupCounter   = 0;

    for (let i = 0; i < optionIndex + 1; i++) {
      if (optionsArray[i].group && optionsArray[i].group === groups[groupCounter]) {
        groupCounter++;
      }
    }

    return groupCounter;
  }

  return 0;
}

/**
 * Determines the position to which to scroll a panel in order for an option to be into view.
 * @param optionIndex Index of the option to be scrolled into the view.
 * @param optionHeight Height of the options.
 * @param currentScrollPosition Current scroll position of the panel.
 * @param panelHeight Height of the panel.
 * @docs-private
 */
export function _getOptionScrollPosition(optionIndex: number, optionHeight: number,
                                         currentScrollPosition: number,
                                         panelHeight: number): number {
  const optionOffset = optionIndex * optionHeight;

  if (optionOffset < currentScrollPosition) {
    return optionOffset;
  }

  if (optionOffset + optionHeight > currentScrollPosition + panelHeight) {
    return Math.max(0, optionOffset - panelHeight + optionHeight);
  }

  return currentScrollPosition;
}
