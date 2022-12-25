/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

export { SortDescriptor } from './src/sort-descriptor';
export { GroupDescriptor, GroupResult } from './src/grouping/group-descriptor.interface';
export {
  FilterDescriptor,
  CompositeFilterDescriptor,
  isCompositeFilterDescriptor
} from './src/filtering/filter-descriptor.interface';
export { toODataString } from './src/odata/odata.operators';
export { toDataSourceRequestString, DataSourceRequestState } from './src/mvc/operators';
export {
  translateDataSourceResultGroups,
  ServerGroupResult,
  translateAggregateResults
} from './src/mvc/deserialization';
export { State } from './src/state';
export { orderBy, process, distinct } from './src/array.operators';
export { expr, getter } from './src/accessor';
export { filterBy, compileFilter } from './src/filtering/filter-expression.factory';
export { groupBy } from './src/grouping/group.operators';
export { Comparer, composeSortDescriptors } from './src/sorting/sort-array.operator';
export { filterExpr } from './src/filtering/filter-expression.factory';
export { normalizeFilters } from './src/filtering/filter.operators';
export { normalizeGroups } from './src/grouping/group.operators';
export { DataResult } from './src/data-result.interface';
export { aggregateBy, AggregateDescriptor } from './src/grouping/aggregate.operators';
export { AggregateResult } from './src/transducers';
