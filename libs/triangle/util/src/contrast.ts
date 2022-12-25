/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

// 数组元素为数字
export function compareNum(num1: number, num2: number) {
  return num1 - num2;
}

// 数组元素为对象， 需要传入对象的属性
export function compareObj(prop: any) {
  return (val1: any, val2: any) => {
    return val1[prop] - val2[prop];
  };
}

// 需要参照某数组进行固定排序
export function contrast(referArr: any, prop: any) {
  return (obj1: any, obj2: any) => {
    return referArr.indexOf(obj1[prop]) - referArr.indexOf(obj2[prop]);
  };
}
