/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */


import { normalizePassiveListenerOptions } from '@angular/cdk/platform';
import { DOCUMENT } from '@angular/common';
import { Inject, Injectable, NgZone, OnDestroy } from '@angular/core';
import { interval, Subject, Subscription } from 'rxjs';
import { debounceTime, mapTo, mergeMap, startWith, takeUntil, tap } from 'rxjs/operators';

/** Event options that can be used to bind an active, capturing event. */
const activeCapturingEventOptions = normalizePassiveListenerOptions({
  passive: false,
  capture: true
});

function isTouchEvent(event: MouseEvent | TouchEvent): event is TouchEvent {
  return event.type[0] === 't';
}

/**
 * Service that keeps track of all the drag item and drop container
 * instances, and manages global event listeners on the `document`.
 * @docs-private
 */
// Note: this class is generic, rather than referencing TriDrag and TriDropContainer directly, in order
// to avoid circular imports. If we were to reference them here, importing the registry into the
// classes that are registering themselves will introduce a circular import.
@Injectable({providedIn: 'root'})
export class DragDropRegistry<I extends { isDragging(): boolean }, C> implements OnDestroy {
  private _document: Document;

  /** Registered drop container instances. */
  private _dropInstances = new Set<C>();

  /** Registered drag item instances. */
  private _dragInstances = new Set<I>();

  /** Drag item instances that are currently being dragged. */
  private _activeDragInstances: I[] = [];

  _pointerPressIdleSubscription = Subscription.EMPTY;

  /** Keeps track of the event listeners that we've bound to the `document`. */
  private _globalListeners = new Map<string, {
    handler: (event: Event) => void,
    options?: AddEventListenerOptions | boolean
  }>();

  /**
   * Predicate function to check if an item is being dragged.  Moved out into a property,
   * because it'll be called a lot and we don't want to create a new function every time.
   */
  private _draggingPredicate = (item: I) => item.isDragging();

  /**
   * Emits the `touchmove` or `mousemove` events that are dispatched
   * while the user is dragging a drag item instance.
   */
  readonly pointerMove: Subject<TouchEvent | MouseEvent> = new Subject<TouchEvent | MouseEvent>();

  readonly pointerPressIdle: Subject<TouchEvent | MouseEvent> = new Subject<TouchEvent | MouseEvent>();

  /**
   * Emits the `touchend` or `mouseup` events that are dispatched
   * while the user is dragging a drag item instance.
   */
  readonly pointerUp: Subject<TouchEvent | MouseEvent> = new Subject<TouchEvent | MouseEvent>();

  /** Emits when the viewport has been scrolled while the user is dragging an item. */
  readonly scroll: Subject<Event> = new Subject<Event>();

  constructor(
    private _ngZone: NgZone,
    @Inject(DOCUMENT) _document: any) {
    this._document = _document;
  }

  /** Adds a drop container to the registry. */
  registerDropContainer(drop: C) {
    if (!this._dropInstances.has(drop)) {
      this._dropInstances.add(drop);
    }
  }

  /** Adds a drag item instance to the registry. */
  registerDragItem(drag: I) {
    this._dragInstances.add(drag);

    // The `touchmove` event gets bound once, ahead of time, because WebKit
    // won't preventDefault on a dynamically-added `touchmove` listener.
    // See https://bugs.webkit.org/show_bug.cgi?id=184250.
    if (this._dragInstances.size === 1) {
      this._ngZone.runOutsideAngular(() => {
        // The event handler has to be explicitly active,
        // because newer browsers make it passive by default.
        this._document.addEventListener('touchmove', this._persistentTouchmoveListener,
          activeCapturingEventOptions);
      });
    }
  }

  /** Removes a drop container from the registry. */
  removeDropContainer(drop: C) {
    this._dropInstances.delete(drop);
  }

  /** Removes a drag item instance from the registry. */
  removeDragItem(drag: I) {
    this._dragInstances.delete(drag);
    this.stopDragging(drag);

    if (this._dragInstances.size === 0) {
      this._document.removeEventListener('touchmove', this._persistentTouchmoveListener,
        activeCapturingEventOptions);
    }
  }

  /**
   * Starts the dragging sequence for a drag instance.
   * @param drag Drag instance which is being dragged.
   * @param event Event that initiated the dragging.
   */
  startDragging(drag: I, event: TouchEvent | MouseEvent) {
    // Do not process the same drag twice to avoid memory leaks and redundant listeners
    if (this._activeDragInstances.indexOf(drag) > -1) {
      return;
    }

    this._activeDragInstances.push(drag);

    if (this._activeDragInstances.length === 1) {
      const isTouchEvent = event.type.startsWith('touch');

      // We explicitly bind __active__ listeners here, because newer browsers will default to
      // passive ones for `mousemove` and `touchmove`. The events need to be active, because we
      // use `preventDefault` to prevent the page from scrolling while the user is dragging.
      this._globalListeners
        .set(isTouchEvent ? 'touchend' : 'mouseup', {
          handler: (e: Event) => this.pointerUp.next(e as TouchEvent | MouseEvent),
          options: true
        })
        .set('scroll', {
          handler: (e: Event) => this.scroll.next(e),
          // Use capturing so that we pick up scroll changes in any scrollable nodes that aren't
          // the document. See https://github.com/angular/components/issues/17144.
          options: true
        })
        // Preventing the default action on `mousemove` isn't enough to disable text selection
        // on Safari so we need to prevent the selection event as well. Alternatively this can
        // be done by setting `user-select: none` on the `body`, however it has causes a style
        // recalculation which can be expensive on pages with a lot of elements.
        .set('selectstart', {
          handler: this._preventDefaultWhileDragging,
          options: activeCapturingEventOptions
        });

      // We don't have to bind a move event for touch drag sequences, because
      // we already have a persistent global one bound from `registerDragItem`.
      if (!isTouchEvent) {
        this._globalListeners.set('mousemove', {
          handler: (e: Event) => this.pointerMove.next(e as MouseEvent),
          options: activeCapturingEventOptions
        });
      }

      this._ngZone.runOutsideAngular(() => {
        this._globalListeners.forEach((config, name) => {
          this._document.addEventListener(name, config.handler, config.options);
        });
      });

      this._ngZone.runOutsideAngular(() => {
        this._pointerPressIdleSubscription = this.pointerMove.pipe(
          takeUntil(this.pointerUp),
          debounceTime(300),
          mergeMap((evt) => {
            return interval(200).pipe(
              startWith(evt),
              takeUntil(this.pointerMove),
              mapTo(evt)
            );
          }),
          tap((value) => {
            this.pointerPressIdle.next(value);
          })
        ).subscribe();
      });
    }
  }

  /** Stops dragging a drag item instance. */
  stopDragging(drag: I) {
    const index = this._activeDragInstances.indexOf(drag);

    if (index > -1) {
      this._activeDragInstances.splice(index, 1);

      if (this._activeDragInstances.length === 0) {
        this._clearGlobalListeners();
      }
    }
  }

  /** Gets whether a drag item instance is currently being dragged. */
  isDragging(drag: I) {
    return this._activeDragInstances.indexOf(drag) > -1;
  }

  ngOnDestroy() {
    this._dragInstances.forEach(instance => this.removeDragItem(instance));
    this._dropInstances.forEach(instance => this.removeDropContainer(instance));
    this._clearGlobalListeners();
    this.pointerMove.complete();
    this.pointerPressIdle.complete();
    this.pointerUp.complete();
  }

  /**
   * Event listener that will prevent the default browser action while the user is dragging.
   * @param event Event whose default action should be prevented.
   */
  private _preventDefaultWhileDragging = (event: Event) => {
    if (this._activeDragInstances.length > 0) {
      event.preventDefault();
    }
  };

  /** Event listener for `touchmove` that is bound even if no dragging is happening. */
  private _persistentTouchmoveListener = (event: TouchEvent) => {
    if (this._activeDragInstances.length > 0) {
      // Note that we only want to prevent the default action after dragging has actually started.
      // Usually this is the same time at which the item is added to the `_activeDragInstances`,
      // but it could be pushed back if the user has set up a drag delay or threshold.
      if (this._activeDragInstances.some(this._draggingPredicate)) {
        event.preventDefault();
      }

      this.pointerMove.next(event);
    }
  };

  /** Clears out the global event listeners from the `document`. */
  private _clearGlobalListeners() {
    this._globalListeners.forEach((config, name) => {
      this._document.removeEventListener(name, config.handler, config.options);
    });

    this._globalListeners.clear();

    this._pointerPressIdleSubscription.unsubscribe();
  }
}
