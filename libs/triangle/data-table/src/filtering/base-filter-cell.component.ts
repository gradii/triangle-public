/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import {
  CompositeFilterDescriptor,
  FilterDescriptor,
  isCompositeFilterDescriptor
} from '@gradii/triangle/data-query';
import { isPresent } from '@gradii/triangle/util';
import { FilterService } from './filter.service';

export function flatten(filter) {
  if (isPresent(filter) && isPresent(filter.filters)) {
    return filter.filters.reduce(
      (acc, curr) => acc.concat(isCompositeFilterDescriptor(curr) ? flatten(curr) : [curr]),
      []
    );
  }
  return [];
}

const trimFilterByField = (filter, field) => {
  if (isPresent(filter) && isPresent(filter.filters)) {
    filter.filters = filter.filters.filter(x => {
      if (isCompositeFilterDescriptor(x)) {
        trimFilterByField(x, field);
        return x.filters.length;
      } else {
        return x.field !== field;
      }
    });
  }
};

export function filtersByField(filter, field) {
  return flatten(filter || {}).filter(function (x) {
    return x.field === field;
  });
}

export function filterByField(filter, field) {
  return filtersByField(filter, field)[0];
}

export function removeFilter(filter, field) {
  trimFilterByField(filter, field);
  return filter;
}

export function localizeOperators(operators) {
  return localization =>
    Object.keys(operators).map(key => ({
      text: localization.get(key),
      value: operators[key]
    }));
}

export abstract class BaseFilterCellComponent /*implements AfterContentInit, OnDestroy*/ {
  filter: CompositeFilterDescriptor;
  protected defaultOperators: Array<{
    label: string;
    value: string;
  }>;

  constructor(protected filterService: FilterService) {
  }

  private _operators = [];

  get operators(): Array<{
    label: string;
    value: string;
  }> {
    return this._operators.length ? this._operators : this.defaultOperators;
  }

  set operators(values) {
    this._operators = values;
  }


  protected filterByField(field: string): FilterDescriptor {
    return this.filtersByField(field)[0];
  }

  protected filtersByField(field: string): FilterDescriptor[] {
    return flatten(this.filter || {}).filter(x => x.field === field);
  }

  protected removeFilter(field: string): CompositeFilterDescriptor {
    trimFilterByField(this.filter, field);
    return this.filter;
  }

  protected updateFilter(filter: FilterDescriptor): CompositeFilterDescriptor {
    const root: CompositeFilterDescriptor = this.filter || {
      filters: [],
      logic  : 'and'
    };
    const currentFilter = flatten(root).filter(x => x.field === filter.field)[0];
    if (!isPresent(currentFilter)) {
      root.filters.push(filter);
    } else {
      Object.assign(currentFilter, filter);
    }
    return root;
  }

  protected applyFilter(filter: CompositeFilterDescriptor): void {
    this.filterService.filter(filter);
  }
}
