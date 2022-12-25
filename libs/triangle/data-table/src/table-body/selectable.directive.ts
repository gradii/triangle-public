/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Directive, HostBinding, HostListener, Input } from '@angular/core';
import { SelectionEvent, SelectionService } from '../selection/selection.service';

/**
 * @deprecated
 */
@Directive({
  selector: '[triGridSelectable], [tri-grid-selectable]'
})
export class SelectableDirective {
  @Input() index: number;
  private selectionService;
  private enabled;
  private ignored;

  constructor(selectionService: SelectionService) {
    this.selectionService = selectionService;
    this.ignored = /^(a|input|textarea|button)$/i;
  }

  @Input()
  set triGridSelectable(enabled) {
    this.enabled = enabled;
  }

  @HostBinding('class.tri-state-selected')
  get className(): boolean {
    return this.selectionService.isSelected(this.index);
  }

  @HostListener('click', ['$event.target'])
  onClick(target: any): void {
    if (!this.enabled) {
      return;
    }
    if (this.shouldSelect(target.tagName)) {
      const ev: SelectionEvent = this.selectionService.toggleByIndex(this.index);
      ev.ctrlKey = false;
      // Setting the deprecated `index` and `selected` properties
      ev.index = this.index;
      ev.selected = !!ev.selectedRows.find(_ => _.index === this.index);
      this.selectionService.changes.emit(ev);
    }
  }

  protected shouldSelect(tagName: string): boolean {
    return !this.ignored.test(tagName);
  }
}
