import { CandyDate } from '@gradii/triangle/date-picker';
import { isAllowedDate } from '../../lib/util';

describe('util.ts coverage supplements', () => {
  it('should cover untouched branches', () => {
    const disabledDate = () => true;
    expect(isAllowedDate(new CandyDate(), disabledDate)).toBeFalsy();

    const disabledTime = () => {
      return {
        disabledHours  : () => [1],
        disabledMinutes: (hour) => [2],
        disabledSeconds: (hour, minute) => [3]
      };
    };
    expect(isAllowedDate(new CandyDate('2000-11-11 01:11:11'), null, disabledTime)).toBeFalsy();
    expect(isAllowedDate(new CandyDate('2000-11-11 02:02:11'), null, disabledTime)).toBeFalsy();
    expect(isAllowedDate(new CandyDate('2000-11-11 02:03:03'), null, disabledTime)).toBeFalsy();
  });
});
