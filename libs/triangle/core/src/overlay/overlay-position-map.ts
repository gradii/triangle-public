/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import {
  ConnectedPosition,
  ConnectionPositionPair
} from '@angular/cdk/overlay';

export const POSITION_MAP_LTR: { [key: string]: ConnectedPosition } = {
  topLeft     : {originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom'},
  top         : {originX: 'center', originY: 'top', overlayX: 'center', overlayY: 'bottom'},
  topRight    : {originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom'},
  rightTop    : {originX: 'end', originY: 'top', overlayX: 'start', overlayY: 'top'},
  right       : {originX: 'end', originY: 'center', overlayX: 'start', overlayY: 'center'},
  rightBottom : {originX: 'end', originY: 'bottom', overlayX: 'start', overlayY: 'bottom'},
  bottomLeft  : {originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top'},
  bottom      : {originX: 'center', originY: 'bottom', overlayX: 'center', overlayY: 'top'},
  bottomRight : {originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top'},
  leftTop     : {originX: 'start', originY: 'top', overlayX: 'end', overlayY: 'top'},
  left        : {originX: 'start', originY: 'center', overlayX: 'end', overlayY: 'center'},
  leftBottom  : {originX: 'start', originY: 'bottom', overlayX: 'end', overlayY: 'bottom'}
};

export const POSITION_MAP_RTL: { [key: string]: ConnectedPosition } = {
  topLeft     : {originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom'},
  top         : {originX: 'center', originY: 'top', overlayX: 'center', overlayY: 'bottom'},
  topRight    : {originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom'},
  leftTop     : {originX: 'end', originY: 'top', overlayX: 'start', overlayY: 'top'},
  left        : {originX: 'end', originY: 'center', overlayX: 'start', overlayY: 'center'},
  leftBottom  : {originX: 'end', originY: 'bottom', overlayX: 'start', overlayY: 'bottom'},
  bottomLeft  : {originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top'},
  bottom      : {originX: 'center', originY: 'bottom', overlayX: 'center', overlayY: 'top'},
  bottomRight : {originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top'},
  rightTop    : {originX: 'start', originY: 'top', overlayX: 'end', overlayY: 'top'},
  right       : {originX: 'start', originY: 'center', overlayX: 'end', overlayY: 'center'},
  rightBottom : {originX: 'start', originY: 'bottom', overlayX: 'end', overlayY: 'bottom'}
};

export const DEFAULT_4_POSITIONS        = _objectValues([
  POSITION_MAP_LTR['top'], POSITION_MAP_LTR['right'], POSITION_MAP_LTR['bottom'], POSITION_MAP_LTR['left']
]);
export const DEFAULT_DROPDOWN_POSITIONS = _objectValues(
  [POSITION_MAP_LTR['bottomLeft'], POSITION_MAP_LTR['topLeft'], POSITION_MAP_LTR['bottomRight'], POSITION_MAP_LTR['topRight']]);

export const DEFAULT_DATEPICKER_POSITIONS = [
  {
    originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'top'
  }, {
    originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'bottom'
  }
] as ConnectionPositionPair[];

function arrayMap(array: any[], iteratee: Function) {
  let index    = -1;
  const length = array == null ? 0 : array.length, result = Array(length);

  while (++index < length) {
    result[index] = iteratee(array[index], index, array);
  }
  return result;
}

function baseValues(object: any, props: any[]) {
  return arrayMap(props, function (key: string) {
    return object[key];
  });
}

function _objectValues(object: any) {
  return object == null ? [] : baseValues(object, Object.keys(object));
}
