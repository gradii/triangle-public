/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Inject, Injectable, Optional } from '@angular/core';
import { ExpandStateService } from '../service/expand-state.service';
import { Skip } from '../utils';

const removeLast = function (groupIndex) {
  return groupIndex.lastIndexOf('_') > -1 ? groupIndex.slice(0, groupIndex.lastIndexOf('_')) : '';
};

@Injectable()
export class GroupsService extends ExpandStateService {

  constructor(@Optional() @Inject(Skip) isCollapsed: boolean = false) {
    super(isCollapsed);
  }

  isInExpandedGroup(groupIndex: string, skipSelf: boolean = true): boolean {
    if (skipSelf) {
      groupIndex = removeLast(groupIndex);
    }

    let expanded = true;

    while (groupIndex && expanded) {
      expanded = this.isExpanded(groupIndex);
      groupIndex = removeLast(groupIndex);
    }
    return expanded;
  }

  expandChildren(groupIndex: string): void {
    this.rowState = this.rowState.filter((x: any) => !x.startsWith(groupIndex));
  }
}
