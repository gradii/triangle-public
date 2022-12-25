/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { EmbeddedViewRef } from '@angular/core';
import { combineTransforms, extendStyles, toggleNativeDragInteractions } from '../drag-styling';
import { deepCloneNode } from '../utils/clone-node';


/**
 * Gets the root HTML element of an embedded view.
 * If the root is not an HTML element it gets wrapped in one.
 */
function getRootNode(viewRef: EmbeddedViewRef<any>, _document: Document): HTMLElement {
  const rootNodes: Node[] = viewRef.rootNodes;

  if (rootNodes.length === 1 && rootNodes[0].nodeType === _document.ELEMENT_NODE) {
    return rootNodes[0] as HTMLElement;
  }

  const wrapper = _document.createElement('div');
  rootNodes.forEach(node => wrapper.appendChild(node));
  return wrapper;
}

/**
 * Matches the target element's size to the source's size.
 * @param target Element that needs to be resized.
 * @param sourceRect Dimensions of the source element.
 */
function matchElementSize(target: HTMLElement, sourceRect: ClientRect): void {
  target.style.width     = `${sourceRect.width}px`;
  target.style.height    = `${sourceRect.height}px`;
  target.style.transform = getTransform(sourceRect.left, sourceRect.top);
}

/**
 * Gets a 3d `transform` that can be applied to an element.
 * @param x Desired position of the element along the X axis.
 * @param y Desired position of the element along the Y axis.
 */
function getTransform(x: number, y: number): string {
  // Round the transforms since some browsers will
  // blur the elements for sub-pixel transforms.
  return `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0)`;
}

/**
 * Creates the element that will be rendered next to the user's pointer
 * and will be used as a preview of the element that is being dragged.
 */
export class DragPreviewRef {
  public _previewEmbeddedViewRef: EmbeddedViewRef<any>;


  constructor(public previewElement: HTMLElement,
              public _rootElement: HTMLElement,
              private previewConfig: any,
              previewClass: string[] | string, zIndex: number, _direction: string,
              public _pickupPositionOnPage: { x: number, y: number },
              public _pickupPositionInElement: { x: number, y: number }
  ) {
    this._manipulateTransform(previewConfig);
    this._manipulate(previewConfig, previewClass, zIndex, _direction);
  }

  relativeTo() {
  }

  translateToPickupPosition() {

  }

  applyTransform(x: number, y: number) {
    // Only apply the initial transform if the preview is a clone of the original element, otherwise
    // it could be completely different and the transform might not make sense anymore.
    // const initialTransform        = this.previewConfig?.template ? undefined : this._initialTransform;
    const initialTransform: any         = undefined;
    const transform                     = getTransform(x, y);
    this.previewElement.style.transform = combineTransforms(transform, initialTransform);
  }

  applySize(width: number, height: number) {
    this.previewElement.style.width  = `${width}px`;
    this.previewElement.style.height = `${height}px`;
  }

  calculatePreviewPoint(pointOnPage: { x: number, y: number }) {
    return {
      x: pointOnPage.x - this._pickupPositionInElement.x,
      y: pointOnPage.y - this._pickupPositionInElement.y
    };
  }

  private _manipulateTransform(previewConfig: any) {
    // Measure the element before we've inserted the preview
    // since the insertion could throw off the measurement.
    const rootRect = previewConfig?.matchSize ? this._rootElement.getBoundingClientRect() : null;


    if (previewConfig?.matchSize) {
      matchElementSize(this.previewElement, rootRect!);
    } else {
      this.previewElement.style.transform =
        getTransform(
          this._pickupPositionOnPage.x - this._pickupPositionInElement.x,
          this._pickupPositionOnPage.y - this._pickupPositionInElement.y);
    }
  }

  private _manipulate(previewConfig: any, previewClass: string[] | string, zIndex: number, _direction: string) {
    const preview = this.previewElement;

    extendStyles(preview.style, {
      // It's important that we disable the pointer events on the preview, because
      // it can throw off the `document.elementFromPoint` calls in the `TriDropContainer`.
      'pointer-events': 'none',
      // We have to reset the margin, because it can throw off positioning relative to the viewport.
      margin  : '0',
      position: 'fixed',
      top     : '0',
      left    : '0',
      'z-index'  : `${zIndex || 1000}`
    });

    toggleNativeDragInteractions(preview, false);
    preview.classList.add('tri-drag-preview');
    preview.setAttribute('dir', _direction);

    if (previewClass) {
      if (Array.isArray(previewClass)) {
        previewClass.forEach(className => preview.classList.add(className));
      } else {
        preview.classList.add(previewClass);
      }
    }
  }

  static createPreviewByTemplate(
    _document: any,
    _rootElement: any,
    previewClass: any,
    previewTemplate: any,
    previewConfig: any,
    _pickupPositionOnPage: any,
    zIndex: number,
    _direction: string,
    _pickupPositionInElement: { x: number, y: number }
  ) {
    let preview: HTMLElement;


    const viewRef = previewConfig.viewContainer.createEmbeddedView(previewTemplate,
      previewConfig.context);
    viewRef.detectChanges();
    preview = getRootNode(viewRef, _document);


    const previewRef = new DragPreviewRef(preview, _rootElement, previewConfig, previewClass, zIndex, _direction,
      _pickupPositionOnPage,
      _pickupPositionInElement);

    previewRef._previewEmbeddedViewRef = viewRef;
    return previewRef;
  }

  static createPreviewByElement(
    previewConfig: any,
    _rootElement: any,
    previewClass: any,
    _initialTransform: any,
    zIndex: number,
    _direction: string,
    _pickupPositionOnPage: { x: number, y: number },
    _pickupPositionInElement: { x: number, y: number }
  ) {
    let preview: HTMLElement;

    const element = _rootElement;
    preview       = deepCloneNode(element);
    matchElementSize(preview, element.getBoundingClientRect());

    // if (_initialTransform) {
    //   preview.style.transform = _initialTransform;
    // }

    return new DragPreviewRef(preview, _rootElement, previewConfig, previewClass, zIndex, _direction,
      _pickupPositionOnPage,
      _pickupPositionInElement);
  }

  dispose() {
  }

  destroy() {
    if (this._previewEmbeddedViewRef) {
      this._previewEmbeddedViewRef.destroy();
    }
    this._previewEmbeddedViewRef = null;
  }

}
