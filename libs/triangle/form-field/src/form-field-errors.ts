/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

/** @docs-private */
export function getTriFormFieldDuplicatedHintError(align: string): Error {
  return Error(`A hint was already declared for 'align="${align}"'.`);
}

/** @docs-private */
export function getTriFormFieldMissingControlError(): Error {
  return Error('tri-form-field must contain a TriFormFieldControl.');
}
