/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { EventEmitter, Injectable } from "@angular/core";
import { UntypedFormGroup } from "@angular/forms";
import { isPresent } from "@gradii/triangle/util";

const isEqual = function (index) {
  return function (item) {
    return item.index === index;
  };
};
const isNotEqual = function (index) {
  return function (item) {
    return item.index !== index;
  };
};
const isNewRow = function (index) {
  return index === -1 || index === undefined;
};
export type Entity = {
  index: number;
  group: any;
};
export type CommandAction = "edit" | "remove" | "cancel" | "save" | "add";
export type CommandEvent = {
  action: CommandAction;
  formGroup?: UntypedFormGroup;
  isNew?: boolean;
  rowIndex?: number;
};

@Injectable()
export class EditService {
  changes: EventEmitter<CommandEvent>;
  private newItemGroup;

  constructor() {
    this.changes = new EventEmitter();
    this._editedIndices = [];
  }

  private _editedIndices;

  get editedIndices() {
    return this._editedIndices;
  }

  set editedIndices(value) {
    this._editedIndices = value;
  }

  get hasNewItem(): boolean {
    return isPresent(this.newItemGroup);
  }

  get newDataItem(): any {
    if (this.hasNewItem) {
      return this.newItemGroup.group.value;
    }
    return {};
  }

  editRow(index: number, group?: any): void {
    this._editedIndices.push({ index, group });
  }

  addRow(group: any): void {
    this.newItemGroup = { group };
  }

  closeAll(): void {
    this.newItemGroup = undefined;
    this._editedIndices = [];
  }

  close(index?: number): void {
    if (isNewRow(index)) {
      this.newItemGroup = undefined;
      return;
    }
    this._editedIndices = this._editedIndices.filter(isNotEqual(index));
  }

  context(index?: number): Entity {
    if (isNewRow(index)) {
      return this.newItemGroup;
    }
    return this._editedIndices.find(isEqual(index));
  }

  isEdited(index: number): boolean {
    return isPresent(this.context(index));
  }

  beginEdit(rowIndex: number): void {
    this.changes.emit({ action: "edit", rowIndex });
  }

  beginAdd(): void {
    this.changes.emit({ action: "add", rowIndex: -1, isNew: true });
  }

  endEdit(rowIndex?: number): void {
    const formGroup = this.context(rowIndex).group;
    this.changes.emit({
      action: "cancel",
      rowIndex,
      formGroup,
      isNew: isNewRow(rowIndex),
    });
  }

  save(rowIndex?: number): void {
    const formGroup = this.context(rowIndex).group;
    this.changes.emit({
      action: "save",
      rowIndex,
      formGroup,
      isNew: isNewRow(rowIndex),
    });
  }

  remove(rowIndex: number): void {
    this.changes.emit({ action: "remove", rowIndex });
  }
}
