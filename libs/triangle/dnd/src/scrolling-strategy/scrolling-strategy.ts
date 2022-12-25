/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import type { ViewportRuler } from '@angular/cdk/scrolling';
import type { NgZone } from '@angular/core';
import type { DndContainerRef } from '../drag-drop-ref/dnd-container-ref';
import {
  AutoScrollHorizontalDirection, AutoScrollVerticalDirection, DROP_PROXIMITY_THRESHOLD
} from '../enum';
import type { ParentPositionTracker, ScrollPosition } from '../parent-position-tracker';
import {
  getElementScrollDirections, getHorizontalScrollDirection, getVerticalScrollDirection, incrementHorizontalScroll,
  incrementVerticalScroll
} from '../utils';
import { isPointerNearClientRect } from '../utils/client-rect';
import { animationFrameScheduler, interval, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';


type ContainerConfig = 'autoScrollStep';

export class ScrollingStrategy {

  /** Node that is being auto-scrolled. */
  private _scrollNode: HTMLElement | Window;

  /** Vertical direction in which the list is currently scrolling. */
  private _verticalScrollDirection = AutoScrollVerticalDirection.NONE;

  /** Horizontal direction in which the list is currently scrolling. */
  private _horizontalScrollDirection = AutoScrollHorizontalDirection.NONE;

  /** Used to signal to the current auto-scroll sequence when to stop. */
  protected readonly _stopScrollTimers = new Subject<void>();


  /** Starts the interval that'll auto-scroll the element. */
  protected _startScrollInterval = () => {
    this.stopScrolling();

    interval(0, animationFrameScheduler)
      .pipe(takeUntil(this._stopScrollTimers))
      .subscribe(() => {
        const node       = this._scrollNode;
        const scrollStep = this.refData.autoScrollStep;

        if (this._verticalScrollDirection === AutoScrollVerticalDirection.UP) {
          incrementVerticalScroll(node, -scrollStep);
        } else if (this._verticalScrollDirection === AutoScrollVerticalDirection.DOWN) {
          incrementVerticalScroll(node, scrollStep);
        }

        if (this._horizontalScrollDirection === AutoScrollHorizontalDirection.LEFT) {
          incrementHorizontalScroll(node, -scrollStep);
        } else if (this._horizontalScrollDirection === AutoScrollHorizontalDirection.RIGHT) {
          incrementHorizontalScroll(node, scrollStep);
        }
      });
  };

  constructor(
    private _document: Document,
    // /** Keeps track of the positions of any parent scrollable elements. */
    private _parentPositions: ParentPositionTracker,
    private _ngZone: NgZone,
    private _viewportRuler: ViewportRuler,
    private refData: Pick<DndContainerRef, ContainerConfig>,
  ) {
  }

  startScrolling(pointerX: number, pointerY: number) {

    let scrollNode: HTMLElement | Window | undefined;
    let verticalScrollDirection   = AutoScrollVerticalDirection.NONE;
    let horizontalScrollDirection = AutoScrollHorizontalDirection.NONE;

    // Check whether we should start scrolling any of the parent containers.
    this._parentPositions.positions.forEach((position, element) => {
      // We have special handling for the `document` below. Also this would be
      // nicer with a  for...of loop, but it requires changing a compiler flag.
      if (element === this._document || !position.clientRect || scrollNode) {
        return;
      }

      if (isPointerNearClientRect(position.clientRect, DROP_PROXIMITY_THRESHOLD,
        pointerX, pointerY)) {
        [verticalScrollDirection, horizontalScrollDirection] = getElementScrollDirections(
          element as HTMLElement, position.clientRect, pointerX, pointerY);

        if (verticalScrollDirection || horizontalScrollDirection) {
          scrollNode = element as HTMLElement;
        }
      }
    });

    // Otherwise check if we can start scrolling the viewport.
    if (!verticalScrollDirection && !horizontalScrollDirection) {
      const {width, height}     = this._viewportRuler.getViewportSize();
      const clientRect          = {width, height, top: 0, right: width, bottom: height, left: 0} as ClientRect;
      verticalScrollDirection   = getVerticalScrollDirection(clientRect, pointerY);
      horizontalScrollDirection = getHorizontalScrollDirection(clientRect, pointerX);
      scrollNode                = window;
    }

    if (scrollNode && (verticalScrollDirection !== this._verticalScrollDirection ||
      horizontalScrollDirection !== this._horizontalScrollDirection ||
      scrollNode !== this._scrollNode)) {
      this._verticalScrollDirection   = verticalScrollDirection;
      this._horizontalScrollDirection = horizontalScrollDirection;
      this._scrollNode                = scrollNode;

      if ((verticalScrollDirection || horizontalScrollDirection) && scrollNode) {
        this._ngZone.runOutsideAngular(this._startScrollInterval);
      } else {
        this.stopScrolling();
      }
    }
  }


  stopScrolling() {
    this._stopScrollTimers.next();
  }

  dispose() {
    this._stopScrollTimers.complete();
    this._scrollNode = null!;
    this._parentPositions.clear();
  }

  cacheParentPositions(scrollableElements: HTMLElement[]) {
    this._parentPositions.cache(scrollableElements);
  }

  getElementClientRect(element: HTMLElement) {
    return this._parentPositions.positions.get(element)!.clientRect!;
  }

  reset() {
    this._parentPositions.clear();
  }

  handleScroll(event: Event): ScrollPosition | null {
    return this._parentPositions.handleScroll(event);
  }
}
