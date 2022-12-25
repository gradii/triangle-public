/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Directionality } from '@angular/cdk/bidi';
import { coerceArray } from '@angular/cdk/coercion';
import { ScrollDispatcher } from '@angular/cdk/scrolling';
import {
  ChangeDetectorRef, Directive, ElementRef, EventEmitter, Inject, Input, Optional, Output, SkipSelf
} from '@angular/core';
import { Subject } from 'rxjs';
import { startWith, takeUntil } from 'rxjs/operators';
import { DragDrop } from '../drag-drop';
import { DragContainerRef } from '../drag-drop-ref/drag-container-ref';
import { TriDragDrop, TriDragEnter, TriDragExit } from '../event/drag-events';
import { assertElementNode } from './assertions';
import { DragDropConfig, TRI_DRAG_CONFIG } from './config';
import { TriDrag } from './drag';
import { TRI_DROP_CONTAINER, TriDropContainer } from './drop-container';
import { TRI_DROP_CONTAINER_GROUP, TriDropContainerGroup } from './drop-container-group';
import { TriDropListContainer } from './drop-list-container';

declare const ngDevMode: object | null;

@Directive({
  selector : '[triDragContainer], tri-drag-container',
  exportAs : 'triDragContainer',
  providers: [
    {provide: TRI_DROP_CONTAINER, useExisting: TriDragContainer},
  ],
  inputs: [
    'disabled:triDragContainerDisabled',
  ],
  host     : {
    'class'                               : 'tri-drop-container',
    '[attr.id]'                           : 'id',
    '[class.tri-drag-container-disabled]' : 'disabled',
    '[class.tri-drag-container-dragging]' : '_dropContainerRef.isDragging()',
    '[class.tri-drag-container-receiving]': '_dropContainerRef.isReceiving()',
  }
})
export class TriDragContainer<T = any> extends TriDropContainer<T> {

  /** Reference to the underlying drop list instance. */
  _dropContainerRef: DragContainerRef<TriDragContainer>;

  // @ts-ignore
  get sortingDisabled(): boolean {
    throw new Error('can\'t be visited');
  }

  /** Emits when the list has been destroyed. */
  protected readonly _destroyed = new Subject<void>();

  /** Whether the element's scrollable parents have been resolved. */
  protected _scrollableParentsResolved: boolean;

  /**
   * Other draggable containers that this container is connected to and into which the
   * container's items can be transferred. Can either be references to other drop containers,
   * or their unique IDs.
   */
  @Input('triDragContainerConnectedTo')
  connectedTo: (TriDropListContainer | string)[] | TriDropListContainer | string = [];

  /** Arbitrary data to attach to this container. */
  @Input('triDragContainerData')
  data: T;


  /** Emits when the user drops an item inside the container. */
  @Output('triDragContainerDropped')
  readonly dropped: EventEmitter<TriDragDrop<T, any>> = new EventEmitter<TriDragDrop<T, any>>();

  /**
   * Emits when the user has moved a new drag item into this container.
   */
  @Output('triDragContainerEntered')
  readonly entered: EventEmitter<TriDragEnter<T>> = new EventEmitter<TriDragEnter<T>>();

  /**
   * Emits when the user removes an item from the container
   * by dragging it into another container.
   */
  @Output('triDragContainerExited')
  readonly exited: EventEmitter<TriDragExit<T>> = new EventEmitter<TriDragExit<T>>();

  /**
   * Keeps track of the items that are registered with this container. Historically we used to
   * do this with a `ContentChildren` query, however queries don't handle transplanted views very
   * well which means that we can't handle cases like dragging the headers of a `mat-table`
   * correctly. What we do instead is to have the items register themselves with the container
   * and then we sort them based on their position in the DOM.
   */
  protected _unsortedItems = new Set<TriDrag>();


  constructor(
    /** Element that the drop list is attached to. */
    public element: ElementRef<HTMLElement>, dragDrop: DragDrop,
    protected _changeDetectorRef: ChangeDetectorRef,
    protected _scrollDispatcher: ScrollDispatcher,
    @Optional() protected _dir?: Directionality,
    @Optional() @Inject(TRI_DROP_CONTAINER_GROUP) @SkipSelf()
    protected _group?: TriDropContainerGroup<TriDropListContainer>,
    @Optional() @Inject(TRI_DRAG_CONFIG) config?: DragDropConfig) {
    super(_group);

    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      assertElementNode(element.nativeElement, 'triDropContainer');
    }

    this._dropContainerRef      = dragDrop.createDragContainerRef(element);
    this._dropContainerRef.data = this;

    if (config) {
      this._assignDefaults(config);
    }

    this._setupInputSyncSubscription(this._dropContainerRef as DragContainerRef);
    this._handleEvents(this._dropContainerRef as DragContainerRef);
    TriDropContainer._dropContainers.push(this);

  }

  /** Registers an items with the drop list. */
  addItem(item: TriDrag): void {
    this._unsortedItems.add(item);

    if (this._dropContainerRef.isDragging()) {
      this._syncItemsWithRef();
    }
  }

  /** Removes an item from the drop list. */
  removeItem(item: TriDrag): void {
    this._unsortedItems.delete(item);

    if (this._dropContainerRef.isDragging()) {
      this._syncItemsWithRef();
    }
  }

  /** Syncs the inputs of the TriDropContainer with the options of the underlying DropContainerRef. */
  // @ts-ignore
  protected _setupInputSyncSubscription(ref: DragContainerRef<TriDragContainer>) {
    if (this._dir) {
      this._dir.change
        .pipe(startWith(this._dir.value), takeUntil(this._destroyed))
        .subscribe(value => ref.withDirection(value));
    }

    ref.beforeStarted.subscribe(() => {
      const siblings = coerceArray(this.connectedTo).map(drop => {
        if (typeof drop === 'string') {
          const correspondingDropContainer = TriDropContainer._dropContainers.find(
            list => list.id === drop);

          if (!correspondingDropContainer && (typeof ngDevMode === 'undefined' || ngDevMode)) {
            console.warn(`TriDropContainer could not find connected drop list with id "${drop}"`);
          }

          return correspondingDropContainer!;
        }

        return drop;
      });

      if (this._group) {
        this._group._items.forEach(drop => {
          if (siblings.indexOf(drop) === -1) {
            siblings.push(drop);
          }
        });
      }

      // Note that we resolve the scrollable parents here so that we delay the resolution
      // as long as possible, ensuring that the element is in its final place in the DOM.
      if (!this._scrollableParentsResolved) {
        const scrollableParents = this._scrollDispatcher
          .getAncestorScrollContainers(this.element)
          .map(scrollable => scrollable.getElementRef().nativeElement);
        this._dropContainerRef.withScrollableParents(scrollableParents);

        // Only do this once since it involves traversing the DOM and the parents
        // shouldn't be able to change without the drop list being destroyed.
        this._scrollableParentsResolved = true;
      }

      ref.disabled           = this.disabled;
      // ref.lockAxis           = this.lockAxis;
      // ref.sortingDisabled    = coerceBooleanProperty(this.sortingDisabled);
      // ref.autoScrollDisabled = coerceBooleanProperty(this.autoScrollDisabled);
      // ref.autoScrollStep     = coerceNumberProperty(this.autoScrollStep, 2);
      ref
        .connectedTo(
          siblings.filter(drop => drop && drop !== this).map(list => list._dropContainerRef)
        );
        // .withOrientation(this.orientation);
    });
  }

  /**
   * todo remove me specify drop list event
   */
  /** Handles events from the underlying DropContainerRef. */
  protected _handleEvents(ref: DragContainerRef<TriDragContainer>) {
    ref.beforeStarted.subscribe(() => {
      this._syncItemsWithRef();
      this._changeDetectorRef.markForCheck();
    });

    ref.entered.subscribe(event => {
      this.entered.emit({
        container   : this,
        item        : event.item.data,
        // currentIndex: event.currentIndex
      });
    });

    ref.exited.subscribe(event => {
      this.exited.emit({
        container: this,
        item     : event.item.data
      });
      this._changeDetectorRef.markForCheck();
    });

    ref.dropped.subscribe(event => {
      this.dropped.emit({
        // previousIndex         : event.previousIndex,
        // currentIndex          : event.currentIndex,
        previousContainer     : event.previousContainer.data,
        container             : event.container.data,
        item                  : event.item.data,
        isPointerOverContainer: event.isPointerOverContainer,
        distance              : event.distance,
        dropPoint             : event.dropPoint
      });

      // Mark for check since all of these events run outside of change
      // detection and we're not guaranteed for something else to have triggered it.
      this._changeDetectorRef.markForCheck();
    });
  }

  /** Syncs up the registered drag items with underlying drop list ref. */
  protected _syncItemsWithRef() {
    this._dropContainerRef.withItems(Array.from(this._unsortedItems).map(item => item._dragRef));
  }

  /** Assigns the default input values based on a provided config object. */
  protected _assignDefaults(config: DragDropConfig) {
    const {draggingDisabled} = config;

    this.disabled = draggingDisabled == null ? false : draggingDisabled;
  }
}
