/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

export const isChanged = (propertyName: string, changes: any, skipFirstChange: boolean = true) =>
  changes[propertyName] &&
  (!changes[propertyName].isFirstChange() || !skipFirstChange) &&
  changes[propertyName].previousValue !== changes[propertyName].currentValue;
export const anyChanged = (propertyNames: string[], changes: any, skipFirstChange: boolean = true) =>
  propertyNames.some(name => isChanged(name, changes, skipFirstChange));
