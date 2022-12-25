/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { ViewportRuler } from '@angular/cdk/scrolling';
import { DOCUMENT } from '@angular/common';
import { ElementRef, Inject, Injectable, NgZone } from '@angular/core';
import { DndContainerRef } from './drag-drop-ref/dnd-container-ref';
import { DragContainerRef } from './drag-drop-ref/drag-container-ref';
import { DragRef, DragRefConfig } from './drag-drop-ref/drag-ref';
import { DropFlexContainerRef } from './drag-drop-ref/drop-flex-container-ref';
import { DropFreeContainerRef } from './drag-drop-ref/drop-free-container-ref';
import { DropGridContainerRef } from './drag-drop-ref/drop-grid-container-ref';
import { DropListContainerRef } from './drag-drop-ref/drop-list-container-ref';
import { ResizeRef } from './drag-drop-ref/resize-ref';
import { DragDropRegistry } from './drag-drop-registry';
import { FlexSortPositionStrategy } from './position-strategy/flex-sort-position-strategy';
import { GridPositionStrategy } from './position-strategy/grid-position-strategy';
import { NoopPositionStrategy } from './position-strategy/noop-position-strategy';
import { SortPositionStrategy } from './position-strategy/sort-position-strategy';

/** Default configuration to be used when creating a `DragRef`. */
const DEFAULT_CONFIG = {
  dragStartThreshold             : 5,
  pointerDirectionChangeThreshold: 5
};

/**
 * Service that allows for drag-and-drop functionality to be attached to DOM elements.
 */
@Injectable({providedIn: 'root'})
export class DragDrop {
  constructor(
    @Inject(DOCUMENT) private _document: any,
    private _ngZone: NgZone,
    private _viewportRuler: ViewportRuler,
    private _dragDropRegistry: DragDropRegistry<any, DndContainerRef>) {
  }

  /**
   * Turns an element into a draggable item.
   * @param element Element to which to attach the dragging functionality.
   * @param config Object used to configure the dragging behavior.
   */
  createDrag<T = any>(element: ElementRef<HTMLElement> | HTMLElement,
                      config: DragRefConfig = DEFAULT_CONFIG): DragRef<T> {

    return new DragRef<T>(element, config, this._document, this._ngZone, this._viewportRuler,
      this._dragDropRegistry);
  }

  /**
   * Turns an element into a draggable item.
   * @param element Element to which to attach the dragging functionality.
   * @param config Object used to configure the dragging behavior.
   */
  createResize<T = any>(element: ElementRef<HTMLElement> | HTMLElement,
                        config: DragRefConfig = DEFAULT_CONFIG): ResizeRef<T> {
    return new ResizeRef<T>(element, config, this._document, this._ngZone, this._viewportRuler,
      this._dragDropRegistry);
  }

  createDragContainerRef<T = any>(element: ElementRef<HTMLElement> | HTMLElement): DragContainerRef<T> {
    const sortPositionStrategy = new SortPositionStrategy(this._dragDropRegistry);
    const dropContainerRef     = new DragContainerRef<T>(element, this._dragDropRegistry,
      this._document, this._ngZone,
      this._viewportRuler, sortPositionStrategy);

    sortPositionStrategy.dropContainerRef = dropContainerRef;
    return dropContainerRef;
  }

  createDropFreeContainerRef<T = any>(element: ElementRef<HTMLElement> | HTMLElement): DropFreeContainerRef<T> {
    const sortPositionStrategy = new NoopPositionStrategy(this._dragDropRegistry);
    return new DropFreeContainerRef<T>(element, this._dragDropRegistry,
      this._document, this._ngZone,
      this._viewportRuler, sortPositionStrategy);
  }

  /**
   * Turns an element into a drop list.
   * @param element Element to which to attach the drop list functionality.
   */
  createDropListContainerRef<T = any>(element: ElementRef<HTMLElement> | HTMLElement): DropListContainerRef<T> {
    const sortPositionStrategy = new SortPositionStrategy(this._dragDropRegistry);
    const dropContainerRef     = new DropListContainerRef<T>(element, this._dragDropRegistry,
      this._document, this._ngZone,
      this._viewportRuler, sortPositionStrategy);

    sortPositionStrategy.dropContainerRef = dropContainerRef;
    return dropContainerRef;
  }

  /**
   * Turns an element into a drop list.
   * @param element Element to which to attach the drop list functionality.
   */
  createDropGridContainerRef<T = any>(element: ElementRef<HTMLElement> | HTMLElement): DropGridContainerRef<T> {
    const positionStrategy = new GridPositionStrategy(this._dragDropRegistry);
    const dropContainerRef = new DropGridContainerRef<T>(element, this._dragDropRegistry,
      this._document, this._ngZone,
      this._viewportRuler, positionStrategy);

    positionStrategy.dropContainerRef = dropContainerRef;
    return dropContainerRef;
  }

  /**
   * Turns an element into a drop list.
   * @param element Element to which to attach the drop list functionality.
   */
  createDropFlexContainerRef<T = any>(element: ElementRef<HTMLElement> | HTMLElement): DndContainerRef<T> {
    const sortPositionStrategy = new FlexSortPositionStrategy(this._dragDropRegistry);
    const dropContainerRef     = new DropFlexContainerRef<T>(element, this._dragDropRegistry,
      this._document, this._ngZone,
      this._viewportRuler, sortPositionStrategy);

    sortPositionStrategy.dropContainerRef = dropContainerRef;
    return dropContainerRef;
  }


}
