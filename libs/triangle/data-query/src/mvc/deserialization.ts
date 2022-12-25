/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { compose } from '../funcs';
import { isPresent } from '../utils';

export interface ServerGroupResult {
  Items: Object[];
  Aggregates: any;
  Member: string;
  Key: any;
  HasSubgroups: boolean;
}

const set                 = function (field: any, target: any, value: any) {
  target[field] = value;
  return target;
};
const convert             = function (mapper: any) {
  return function (values: any) {
    return Object.keys(values).reduce(mapper.bind(null, values), {});
  };
};
const translateAggregate  = convert(function (source: any, acc: any, field: string) {
  return set(field.toLowerCase(), acc, source[field]);
});
const translateAggregates = convert(function (source: any, acc: any, field: string) {
  return set(field, acc, translateAggregate(source[field]));
});
const valueOrDefault      = function (value: any, defaultValue: any) {
  return isPresent(value) ? value : defaultValue;
};
const normalizeGroup      = function (group: any) {
  return {
    aggregates  : group.Aggregates || group.aggregates,
    field       : group.Member || group.member || group.field,
    hasSubgroups: group.HasSubgroups || group.hasSubgroups || false,
    items       : group.Items || group.items,
    value       : valueOrDefault(group.Key, valueOrDefault(group.key, group.value))
  };
};
const translateGroup      = compose(function ({field, hasSubgroups, value, aggregates, items}: {
  field: any,
  hasSubgroups: boolean,
  value: any,
  aggregates: any,
  items: any[]
}) {
  return {
    aggregates: translateAggregates(aggregates),
    field     : field,
    items     : hasSubgroups ? items.map(translateGroup) : items,
    value     : value
  };
}, normalizeGroup);

export function translateDataSourceResultGroups(data: any[]) {
  return data.map(translateGroup);
}

export function translateAggregateResults(data: any | any[]) {
  return (data || []).reduce(function (acc: any, x: any) {
    return set(x.Member, acc,
      set(x.AggregateMethodName.toLowerCase(), acc[x.Member] || {}, x.Value));
  }, {});
}
