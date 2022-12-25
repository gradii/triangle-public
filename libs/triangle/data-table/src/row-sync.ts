/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

const set = value => pair => pair.forEach(x => (x.style.height = value));
const clearHeight = pairs =>
  pairs
    .filter(_a => {
      const left = _a[0];
      const right = _a[1];
      return left.style.height || right.style.height;
    })
    .forEach(set(''));
const zip = (arr1, arr2) => {
  const result = [];
  for (let idx = 0, len = arr1.length; idx < len; idx++) {
    if (!arr2[idx]) {
      break;
    }
    result.push([arr1[idx], arr2[idx]]);
  }
  return result;
};
const setHeight = heights => (row, idx) => set(heights[idx] + 1 + 'px')(row);
const getHeights = rows =>
  rows.map(_a => {
    const left = _a[0];
    const right = _a[1];
    const height = left.offsetHeight;
    const offsetHeight2 = right.offsetHeight;
    if (height < offsetHeight2) {
      return offsetHeight2;
    }
    return height;
  });
export let syncRowsHeight = (table1, table2) => {
  const rows = zip(table1.rows, table2.rows);
  clearHeight(rows);
  const heights = getHeights(rows);
  [table1, table2].forEach(x => (x.style.display = 'none'));
  rows.forEach(setHeight(heights));
  [table1, table2].forEach(x => (x.style.display = ''));
};
