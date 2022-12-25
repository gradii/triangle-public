/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */


/**
 * Throws an exception when a menu panel already has a menu stack.
 * @docs-private
 */
export function throwExistingMenuStackError() {
  throw Error(
    'TriMenuPanel is already referenced by different TriMenuTrigger. Ensure that a menu is' +
    ' opened by a single trigger only.',
  );
}

/**
 * Throws an exception when an instance of the PointerFocusTracker is not provided.
 * @docs-private
 */
export function throwMissingPointerFocusTracker() {
  throw Error('expected an instance of PointerFocusTracker to be provided');
}

/**
 * Throws an exception when a reference to the parent menu is not provided.
 * @docs-private
 */
export function throwMissingMenuReference() {
  throw Error('expected a reference to the parent menu');
}
