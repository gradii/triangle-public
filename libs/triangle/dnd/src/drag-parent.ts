/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */


import { InjectionToken } from '@angular/core';

/**
 * Injection token that can be used for a `TriDrag` to provide itself as a parent to the
 * drag-specific child directive (`TriDragHandle`, `TriDragPreview` etc.). Used primarily
 * to avoid circular imports.
 * @docs-private
 */
export const TRI_DRAG_PARENT = new InjectionToken<{}>('TRI_DRAG_PARENT');
