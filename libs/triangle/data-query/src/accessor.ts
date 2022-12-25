/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { isNullOrEmptyString } from './utils';

const empty          = ['', ''];
const concat         = function (left: [string, string] | string[],
                                 right: [string, string] | string[]) {
  return [left[0] + right[0], left[1] + right[1]];
};
const notEmpty       = function (member: any) {
  return !isNullOrEmptyString(member);
};
const parseMember    = function (member: string, idx: number, length: number) {
  let first   = '(';
  const index = member.indexOf('[');
  if (index === -1) {
    member = '.' + member;
  } else if (index > 0) {
    first += '(';
    member = '.' + member.substring(0, index) + ' || {})' + member.substring(index);
  }
  member += idx < length - 1 ? ' || {})' : ')';
  return [first, member];
};
const wrapExpression = function (members: string[], paramName: string) {
  return members
    .filter(notEmpty)
    .reduce(function (pair: string[], member: string, idx: number, arr: string[]) {
      return concat(pair, parseMember(member, idx, arr.length));
    }, empty)
    .join(paramName);
};
const getterCache: Record<string, any>    = {};

export function expr(expression = '', safe = false, paramName = 'd') {
  if (expression && expression.charAt(0) !== '[') {
    expression = '.' + expression;
  }
  if (safe) {
    expression = expression.replace(/"([^.]*)\.([^"]*)"/g, '"$1_$DOT$_$2"');
    expression = expression.replace(/'([^.]*)\.([^']*)'/g, '\'$1_$DOT$_$2\'');
    expression = wrapExpression(expression.split('.'), paramName);
    expression = expression.replace(/_\$DOT\$_/g, '.');
  } else {
    expression = paramName + expression;
  }
  return expression;
}

export function getter(expression: string, safe?: boolean) {
  const key = expression + safe;
  return (getterCache[key] = getterCache[key] || new Function('d',
    'return ' + expr(expression, safe)));
}
