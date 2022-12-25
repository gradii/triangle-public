/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { UntypedFormControl } from "@angular/forms";

export function noWhitespaceValidator(control: UntypedFormControl) {
  const isWhitespace = (control.value || "").trim().length === 0;
  const isValid = !isWhitespace;
  return isValid ? null : { whitespace: true };
}

export function containsAtLeastNChars(chars: number) {
  return (control: UntypedFormControl) => {
    const charsRegExp = new RegExp(`[\-a-zA-Z0-9_+]{${chars},}`, "g");
    const isValid = charsRegExp.test(control.value || "");
    return isValid ? null : { notEnoughChars: true };
  };
}
