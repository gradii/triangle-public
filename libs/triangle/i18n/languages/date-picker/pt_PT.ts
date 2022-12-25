/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import CalendarLocale from '../calendar/en_US';
import TimePickerLocale from '../time-picker/en_US';

// Merge into a locale object
const locale = {
  lang            : {
    placeholder     : 'Select date',
    rangePlaceholder: ['Data inicial', 'Data final'],
    ...CalendarLocale,
  },
  timePickerLocale: {
    ...TimePickerLocale,
  },
};

// All settings at:
// https://github.com/ant-design/ant-design/blob/master/components/date-picker/locale/example.json

export default locale;
