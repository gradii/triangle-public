/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { UntypedFormGroup } from "@angular/forms";

export function getDirtyValues(formGroup: UntypedFormGroup) {
  const dirtyValues: any = {}; // initialize empty object
  Object.keys(formGroup.controls).forEach((c) => {
    const currentControl = formGroup.get(c);

    if (currentControl) {
      if (currentControl.dirty) {
        if (currentControl instanceof UntypedFormGroup) {
          dirtyValues[c] = getDirtyValues(currentControl);
        } else {
          dirtyValues[c] = currentControl.value;
        }
      }
    }
  });
  return dirtyValues;
}
