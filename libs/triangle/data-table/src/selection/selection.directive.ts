/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Directive, Host } from '@angular/core';
import { DataTableComponent } from '../data-table.component';
import { Selection } from './selection-default';

/**
 * A directive which stores the row selection state of the Grid in memory.
 */
@Directive({
  selector: 'tri-data-table[selectedBy]'
})
export class SelectionDirective extends Selection {
  constructor(@Host() protected grid: DataTableComponent) {
    super(grid);
  }

  ngOnInit() {
    if (this.grid.selectable === false) {
      this.grid.selectable = true;
    }
    this.grid.selectionDirective = true;
  }

  ngOnDestroy() {
    super.destroy();
  }
}
