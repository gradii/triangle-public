/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { CandyDate } from './candy-date/candy-date';
import { DisabledDateFn, DisabledTimeConfig, DisabledTimeFn } from './standard-types';

const defaultDisabledTime: DisabledTimeConfig = {
  disabledHours(): number[] {
    return [];
  },
  disabledMinutes(): number[] {
    return [];
  },
  disabledSeconds(): number[] {
    return [];
  }
};

export function getTimeConfig(value: CandyDate, disabledTime: DisabledTimeFn): DisabledTimeConfig {
  let disabledTimeConfig = disabledTime ? disabledTime(value && value.nativeDate) : {} as DisabledTimeConfig;
  disabledTimeConfig = {
    ...defaultDisabledTime,
    ...disabledTimeConfig
  };
  return disabledTimeConfig;
}

export function isTimeValidByConfig(value: CandyDate, disabledTimeConfig: DisabledTimeConfig): boolean {
  let invalidTime = false;
  if (value) {
    const hour = value.getHours();
    const minutes = value.getMinutes();
    const seconds = value.getSeconds();
    const disabledHours = disabledTimeConfig.disabledHours();
    if (disabledHours.indexOf(hour) === -1) {
      const disabledMinutes = disabledTimeConfig.disabledMinutes(hour);
      if (disabledMinutes.indexOf(minutes) === -1) {
        const disabledSeconds = disabledTimeConfig.disabledSeconds(hour, minutes);
        invalidTime = disabledSeconds.indexOf(seconds) !== -1;
      } else {
        invalidTime = true;
      }
    } else {
      invalidTime = true;
    }
  }
  return !invalidTime;
}

export function isTimeValid(value: CandyDate, disabledTime: DisabledTimeFn): boolean {
  const disabledTimeConfig = getTimeConfig(value, disabledTime);
  return isTimeValidByConfig(value, disabledTimeConfig);
}

export function isAllowedDate(value: CandyDate, disabledDate?: DisabledDateFn, disabledTime?: DisabledTimeFn): boolean {
  if (disabledDate) {
    if (disabledDate(value.nativeDate)) {
      return false;
    }
  }
  if (disabledTime) {
    if (!isTimeValid(value, disabledTime)) {
      return false;
    }
  }
  return true;
}
