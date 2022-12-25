/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Pipe, PipeTransform, QueryList } from '@angular/core';
import { OptionGroupComponent } from './option-group.component';
import { ComboboxOptionComponent } from './combobox-option.component';

export type TFilterOption = (input: string, option: ComboboxOptionComponent) => boolean;

@Pipe({name: 'triFilterOption'})
export class FilterOptionPipe implements PipeTransform {
  transform(
    options: ComboboxOptionComponent[] | QueryList<ComboboxOptionComponent>,
    searchValue: string,
    filterOption: TFilterOption,
    serverSearch: boolean
  ): ComboboxOptionComponent[] | QueryList<ComboboxOptionComponent> {
    if (serverSearch || !searchValue) {
      return options;
    } else {
      return (options as ComboboxOptionComponent[]).filter(o => filterOption(searchValue, o));
    }
  }
}

@Pipe({name: 'triFilterGroupOption'})
export class FilterGroupOptionPipe implements PipeTransform {
  transform(
    groups: OptionGroupComponent[],
    searchValue: string,
    filterOption: TFilterOption,
    serverSearch: boolean
  ): OptionGroupComponent[] {
    if (serverSearch || !searchValue) {
      return groups;
    } else {
      return (groups as OptionGroupComponent[]).filter(g => {
        return g.listOfOptionComponent.some(o => filterOption(searchValue, o));
      });
    }
  }
}

export function defaultFilterOption(searchValue: string, option: ComboboxOptionComponent): boolean {
  if (option && option.label) {
    return option.label.toLowerCase().indexOf(searchValue.toLowerCase()) > -1;
  } else {
    return false;
  }
}
