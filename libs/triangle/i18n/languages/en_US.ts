/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import Calendar from './calendar/en_US';
import DatePicker from './date-picker/en_US';
import Pagination from './pagination/en_US';
import TimePicker from './time-picker/en_US';

export default {
  locale    : 'en',
  Pagination,
  DatePicker,
  TimePicker,
  Calendar,
  global    : {
    placeholder: 'Please select',
  },
  Table     : {
    filterTitle  : 'Filter menu',
    filterConfirm: 'OK',
    filterReset  : 'Reset',
    emptyText    : 'No data',
    selectAll    : 'Select current page',
    selectInvert : 'Invert current page',
    sortTitle    : 'Sort',
  },
  Modal     : {
    okText    : 'OK',
    cancelText: 'Cancel',
    justOkText: 'OK',
  },
  Popconfirm: {
    okText    : 'OK',
    cancelText: 'Cancel',
  },
  Transfer  : {
    titles           : ['', ''],
    notFoundContent  : 'Not Found',
    searchPlaceholder: 'Search here',
    itemUnit         : 'item',
    itemsUnit        : 'items',
  },
  Select    : {
    notFoundContent: 'Not Found',
  },
  Upload    : {
    uploading  : 'Uploading...',
    removeFile : 'Remove file',
    uploadError: 'Upload error',
    previewFile: 'Preview file',
  },
  Empty     : {
    description: 'No Data',
  },
};
