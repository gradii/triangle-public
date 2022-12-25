/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { expr } from '../accessor';
import { isFunction, isPresent } from '../utils';
import { isCompositeFilterDescriptor } from './filter-descriptor.interface';
import { normalizeFilters, operators } from './filter.operators';

const logic              = {and: ' && ', or: ' || '};
const fieldProp          = function (field, fieldFunctions) {
  if (isFunction(field)) {
    const prop = '__f[' + fieldFunctions.length + '](d)';
    return [prop, fieldFunctions.concat([field])];
  }
  return [expr(field), fieldFunctions];
};
const operatorExpression = function (filter, operatorFunctions, prop) {
  if (isFunction(filter.operator)) {
    const expression = '__o[' + operatorFunctions.length + '](' + prop + ', ' + operators.quote(
      filter.value) + ')';
    return [expression, operatorFunctions.concat([filter.operator])];
  }
  const ignoreCase = isPresent(filter.ignoreCase) ? filter.ignoreCase : true;
  return [operators[filter.operator || 'eq'](prop, filter.value, ignoreCase), operatorFunctions];
};
const fieldExpression    = function (filter, expressions, operatorFunctions, fieldFunctions) {
  const _a         = fieldProp(filter.field, fieldFunctions),
        prop       = _a[0],
        fields     = _a[1];
  const _b         = operatorExpression(filter, operatorFunctions, prop),
        expression = _b[0],
        funcs      = _b[1];
  return {
    expression: expressions.concat([expression]),
    fields    : fields,
    operators : funcs
  };
};
const factory            = (function () {
  return {
    compositeFilterExpression: function (filter, expressions, operatorFunctions, fieldFunctions) {
      const inner      = factory.filterExpr(filter);
      // Nested function fields or operators - update their index e.g. __o[0] -> __o[1]
      const expression = inner.expression
        .replace(/__o\[(\d+)\]/g, function (_, index) {
          return '__o[' + (operatorFunctions.length + +index) + ']';
        })
        .replace(/__f\[(\d+)\]/g, function (_, index) {
          return '__f[' + (fieldFunctions.length + +index) + ']';
        });
      return {
        expression: expressions.concat([expression]),
        fields    : fieldFunctions.concat(inner.fields),
        operators : operatorFunctions.concat(inner.operators)
      };
    },
    createExpression         : function (acc, filter) {
      if (isCompositeFilterDescriptor(filter)) {
        return factory.compositeFilterExpression(filter, acc.expression, acc.operators, acc.fields);
      }
      return fieldExpression(filter, acc.expression, acc.operators, acc.fields);
    },
    filterExpr               : function (descriptor) {
      const filters = descriptor.filters;
      let result    = {expression: [], fields: [], operators: []};
      for (let idx = 0, length_1 = filters.length; idx < length_1; idx++) {
        result = factory.createExpression(result, filters[idx]);
      }
      return {
        expression: '(' + result.expression.join(logic[descriptor.logic]) + ')',
        fields    : result.fields,
        operators : result.operators
      };
    }
  };
})();
export const filterExpr  = factory.filterExpr;

export function compileFilter(descriptor) {
  if (!descriptor || descriptor.filters.length === 0) {
    return function () {
      return true;
    };
  }
  const expr       = filterExpr(descriptor);
  const predicate  = new Function('d, __f, __o', 'return ' + expr.expression);
  const shouldWrap = expr.fields.length || expr.operators.length;
  return !shouldWrap
    ? predicate
    : function (d) {
      return predicate(d, expr.fields, expr.operators);
    };
}

export function filterBy(data: any, descriptor: any) {
  if (
    !isPresent(descriptor) ||
    (
      isCompositeFilterDescriptor(descriptor)
      && descriptor.filters.length === 0
    )
  ) {
    return data;
  }
  return data.filter(compileFilter(normalizeFilters(descriptor)));
}
