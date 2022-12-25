/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { EventEmitter, Injectable } from '@angular/core';
import { isPresent } from '@gradii/triangle/util';
import { RowArgs, RowSelectedFn } from '../row-class';
import { GroupRow } from '../row-column/group-row';
import { Row } from '../row-column/row';
import { DomEventsService } from '../service/dom-events.service';
import { SelectableSettings } from './selectable-settings';

let nextId = 0;

export interface SelectionEvent {
  /**
   * The items that were added to the selection.
   */
  selectedRows: RowArgs[];
  /**
   * The items that were removed from the selection.
   */
  deselectedRows: RowArgs[];
  /**
   * Shows the state of the `Ctrl` key (or the `Command` key on a Mac) during the selection.
   */
  ctrlKey?: boolean;
  /**
   * The index of the affected row.
   * This property is deprecated and will be removed in future versions.
   */
  index?: number;
  /**
   * The selected state of the affected row.
   * This property is deprecated and will be removed in future versions.
   */
  selected?: boolean;
}

export interface SelectionServiceSettings {
  rowSelected: RowSelectedFn;
  selectable: boolean | SelectableSettings;
  view: {
    accessor: Iterable<any>;
    at: Function;
    length: Number;
  };
}

@Injectable()
export class SelectionService {
  id: number;
  changes: EventEmitter<SelectionEvent>;
  lastSelectionStartIndex: number;
  currentSelection: RowArgs[];
  selectAllChecked: boolean;
  settings: SelectionServiceSettings;
  private cellClickSubscription;
  private mousedownSubscription;

  constructor(domEvents: DomEventsService) {
    const _this = this;
    this.changes = new EventEmitter();
    this.lastSelectionStartIndex = 0;
    this.currentSelection = [];
    this.selectAllChecked = false;
    this.cellClickSubscription = domEvents.cellClick.subscribe(args => {
      if (_this.options.enabled && !_this.options.checkboxOnly && args.type !== 'contextmenu') {
        _this.handleClick({index: args.rowIndex, data: args.dataItem}, args.originalEvent);
      }
    });
    this.mousedownSubscription = domEvents.cellMousedown.subscribe(args => {
      if (
        _this.options.enabled &&
        (!_this.options.mode || _this.options.mode === 'multiple') &&
        !_this.options.checkboxOnly &&
        args.originalEvent.shiftKey
      ) {
        args.originalEvent.preventDefault();
      }
    });
    this.id = nextId++;
  }

  get selectAllState(): any {
    if (this.selected.length === 0) {
      return false;
    }
    if (this.selected.length === this.settings.view.length) {
      return true;
    }
    return undefined;
  }

  get selected(): number[] {
    return this.currentSelection.map(item => item.index).filter(n => typeof n === 'number');
  }

  get options(): SelectableSettings {
    const defaultOptions: SelectableSettings = {
      checkboxOnly: false,
      enabled     : true,
      mode        : 'multiple'
    };
    if (!isPresent(this.settings)) {
      return defaultOptions;
    }
    if (typeof this.settings.selectable === 'boolean') {
      return {
        checkboxOnly: false,
        enabled     : this.settings.selectable,
        mode        : 'multiple'
      };
    } else {
      return Object.assign(defaultOptions, this.settings.selectable);
    }
  }

  init(settings: any) {
    this.settings = settings;
    this.currentSelection = [];
    if (settings.selectable && settings.selectable.enabled !== false) {
      const iterator = this.getIterator();
      for (const item of iterator) {
        if (item instanceof Row) {
          const rowArgs = {
            dataItem: item.dataItem,
            index   : item.index
          };
          if (settings.rowSelected(rowArgs)) {
            this.currentSelection[item.index] = rowArgs;
          }
        }
      }
    }
  }

  isSelected(index: number): boolean {
    return this.options.enabled && isPresent(this.currentSelection[index]);
  }

  handleClick(item: any, event: any): void {
    let ev;
    if (this.options.mode === 'single' && (event.ctrlKey || event.metaKey) && this.isSelected(item.index)) {
      ev = this.toggle(item);
    } else if (this.options.mode === 'multiple') {
      if ((event.ctrlKey || event.metaKey) && !event.shiftKey) {
        ev = this.toggle(item);
      } else if (event.shiftKey) {
        ev = this.addAllTo(item);
      }
    }
    if (!isPresent(ev)) {
      ev = this.select(item);
      this.currentSelection[item.index] = item.data;
    }
    if (!ev.selectedRows.length && !ev.deselectedRows.length) {
      return;
    }
    ev.ctrlKey = event.ctrlKey || event.metaKey;
    this.setDeprecatedEventProperties(ev);
    this.changes.emit(ev);
  }

  toggleByIndex(index: number): any {
    const iterator = this.getIterator();
    if (this.selectAllChecked && this.isSelected(index)) {
      this.selectAllChecked = false;
    }
    for (const item of iterator) {
      if (item instanceof Row && item.index === index) {
        const itemToToggle = {
          data : item.dataItem,
          index: item.index
        };
        if (this.isSelected(index) || this.options.mode === 'multiple') {
          return this.toggle(itemToToggle);
        } else {
          return this.select(itemToToggle);
        }
      }
    }
  }

  toggle(item: any): any {
    const selectedRows = [];
    const deselectedRows = [];
    this.lastSelectionStartIndex = item.index;
    if (this.isSelected(item.index)) {
      deselectedRows.push({dataItem: item.data, index: item.index});
    } else {
      selectedRows.push({dataItem: item.data, index: item.index});
    }

    this.currentSelection.forEach(row => {
      if (row.index !== item.index) {
        selectedRows.push(row);
      }
    });

    return {
      deselectedRows,
      selectedRows
    };
  }

  select(item: any): any {
    const deselectedRows = [];
    const selectedRows = [];
    this.lastSelectionStartIndex = item.index;
    if (!this.isSelected(item.index)) {
      selectedRows.push({dataItem: item.data, index: item.index});
    }
    this.currentSelection.forEach(row => {
      if (row.index !== item.index) {
        deselectedRows.push(row);
      }
    });
    return {
      deselectedRows,
      selectedRows
    };
  }

  addAllTo(item: any): any {
    const selectedRows = [];
    const deselectedRows = [];
    const start = Math.min(this.lastSelectionStartIndex, item.index);
    const end = Math.max(this.lastSelectionStartIndex, item.index);
    const iterator = this.getIterator();

    for (const item of iterator) {
      if (item instanceof Row) {
        const idx = item.index;
        if ((idx < start || idx > end) && this.isSelected(idx)) {
          deselectedRows.push({dataItem: item.dataItem, index: idx});
        }
        if (idx >= start && idx <= end && !this.isSelected(idx)) {
          selectedRows.push({dataItem: item.dataItem, index: idx});
        }
      }
    }
    return {
      deselectedRows,
      selectedRows
    };
  }

  updateAll(selectAllChecked: boolean): void {
    this.selectAllChecked = selectAllChecked;
    const selectedRows = [];
    const deselectedRows = [];
    const iterator = this.getIterator();
    for (const item of iterator) {
      if (item instanceof Row) {
        const idx = item.index;
        if (this.isSelected(idx) && !selectAllChecked) {
          deselectedRows.push({dataItem: item.dataItem, index: idx});
        }
        if (!this.isSelected(idx) && selectAllChecked) {
          selectedRows.push({dataItem: item.dataItem, index: idx});
        }
      }
    }
    if (!selectedRows.length && !deselectedRows.length) {
      return;
    }
    const ev = {
      deselectedRows,
      selectedRows
    };
    this.setDeprecatedEventProperties(ev);
    this.changes.emit(ev);
  }

  ngOnDestroy() {
    if (this.cellClickSubscription) {
      this.cellClickSubscription.unsubscribe();
      this.cellClickSubscription = null;
    }
    if (this.mousedownSubscription) {
      this.mousedownSubscription.unsubscribe();
      this.mousedownSubscription = null;
    }
  }

  getIterator(): Iterable<Row | GroupRow> {
    const accessor = this.settings.view.accessor;
    if (!accessor) {
      return [];
    }
    return accessor;
  }

  setDeprecatedEventProperties(ev) {
    if (ev.selectedRows.length >= ev.deselectedRows.length) {
      ev.selected = true;
      ev.index = ev.selectedRows[ev.selectedRows.length - 1].index;
    } else {
      ev.selected = false;
      ev.index = ev.deselectedRows[ev.deselectedRows.length - 1].index;
    }
    return ev;
  }
}
