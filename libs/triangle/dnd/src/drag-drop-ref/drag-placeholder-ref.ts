/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { EmbeddedViewRef } from '@angular/core';

/**
 * Helper to remove a node from the DOM and to do all the necessary null checks.
 * @param node Node to be removed.
 */
function removeNode(node: Node | null) {
  if (node && node.parentNode) {
    node.parentNode.removeChild(node);
  }
}

export class DragPlaceholderRef {
  _placeholderElement: HTMLElement;
  _placeholderEmbeddedViewRef: EmbeddedViewRef<any>;

  dispose() {
    if (this._placeholderElement) {
      removeNode(this._placeholderElement);
    }

    if (this._placeholderEmbeddedViewRef) {
      this._placeholderEmbeddedViewRef.destroy();
    }

    this._placeholderElement = this._placeholderEmbeddedViewRef = null!;
  }
}
