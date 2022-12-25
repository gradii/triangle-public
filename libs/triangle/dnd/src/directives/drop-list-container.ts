/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */


import { Directionality } from '@angular/cdk/bidi';
import {
  BooleanInput, coerceArray, coerceBooleanProperty, coerceNumberProperty, NumberInput,
} from '@angular/cdk/coercion';
import { ScrollDispatcher } from '@angular/cdk/scrolling';
import {
  ChangeDetectorRef, Directive, ElementRef, EventEmitter, Inject, Input, OnDestroy, Optional, Output, SkipSelf,
} from '@angular/core';
import { Subject } from 'rxjs';
import { startWith, takeUntil } from 'rxjs/operators';
import { DragDrop } from '../drag-drop';
import { DndContainerRef } from '../drag-drop-ref/dnd-container-ref';
import { DragRef } from '../drag-drop-ref/drag-ref';
import { DropListContainerRef } from '../drag-drop-ref/drop-list-container-ref';
import { TriDragDrop, TriDragEnter, TriDragExit, TriDragSortEvent } from '../event/drag-events';
import { assertElementNode } from './assertions';
import { DragAxis, DragDropConfig, DropContainerOrientation, TRI_DRAG_CONFIG } from './config';
import { TriDrag } from './drag';
import { TRI_DROP_CONTAINER, TriDropContainer } from './drop-container';
import { TRI_DROP_CONTAINER_GROUP, TriDropContainerGroup } from './drop-container-group';

declare const ngDevMode: object | null;

/**
 * Internal compile-time-only representation of a `TriDropContainer`.
 * Used to avoid circular import issues between the `TriDropContainer` and the `TriDrag`.
 * @docs-private
 */
export interface TriDropContainerInternal extends TriDropContainer {
}


/** Container that wraps a set of draggable items. */
@Directive({
  selector : '[triDropListContainer], tri-drop-list-container',
  exportAs : 'triDropListContainer',
  providers: [
    {provide: TRI_DROP_CONTAINER, useExisting: TriDropListContainer},
  ],
  inputs: [
    'disabled:triDropListContainerDisabled',
  ],
  host     : {
    'class'                               : 'tri-drop-container',
    '[attr.id]'                           : 'id',
    '[class.tri-drop-container-disabled]' : 'disabled',
    '[class.tri-drop-container-dragging]' : '_dropContainerRef.isDragging()',
    '[class.tri-drop-container-receiving]': '_dropContainerRef.isReceiving()',
  }
})
export class TriDropListContainer<T = any> extends TriDropContainer implements OnDestroy {
  /** Emits when the list has been destroyed. */
  protected readonly _destroyed = new Subject<void>();

  /** Whether the element's scrollable parents have been resolved. */
  protected _scrollableParentsResolved: boolean;


  /** Reference to the underlying drop list instance. */
  // _dropContainerRef: DropListContainerRef<TriDropListContainer<T>>;

  /**
   * Other draggable containers that this container is connected to and into which the
   * container's items can be transferred. Can either be references to other drop containers,
   * or their unique IDs.
   */
  @Input('triDropListContainerConnectedTo')
  connectedTo: (TriDropListContainer | string)[] | TriDropListContainer | string = [];

  /** Arbitrary data to attach to this container. */
  @Input('triDropListContainerData')
  data: T;

  /** Direction in which the list is oriented. */
  @Input('triDropListContainerOrientation')
  orientation: DropContainerOrientation;

  /** Locks the position of the draggable elements inside the container along the specified axis. */
  @Input('triDropListContainerLockAxis')
  lockAxis: DragAxis;

  /** Whether sorting within this drop list is disabled. */
  @Input('triDropListContainerSortingDisabled')
  sortingDisabled: boolean;

  /**
   * Function that is used to determine whether an item
   * is allowed to be moved into a drop container.
   */
  @Input('triDropListContainerEnterPredicate')
  enterPredicate: (drag: TriDrag, drop: TriDropListContainer) => boolean = () => true;

  /** Functions that is used to determine whether an item can be sorted into a particular index. */
  @Input('triDropListContainerSortPredicate')
  sortPredicate: (index: number, drag: TriDrag, drop: TriDropListContainer) => boolean = () => true;

  /** Whether to auto-scroll the view when the user moves their pointer close to the edges. */
  @Input('triDropListContainerAutoScrollDisabled')
  autoScrollDisabled: boolean;

  /** Number of pixels to scroll for each frame when auto-scrolling an element. */
  @Input('triDropListContainerAutoScrollStep')
  autoScrollStep: number;

  /** Emits when the user drops an item inside the container. */
  @Output('triDropListContainerDropped')
  readonly dropped: EventEmitter<TriDragDrop<T, any>> = new EventEmitter<TriDragDrop<T, any>>();

  /**
   * Emits when the user has moved a new drag item into this container.
   */
  @Output('triDropListContainerEntered')
  readonly entered: EventEmitter<TriDragEnter<T>> = new EventEmitter<TriDragEnter<T>>();

  /**
   * Emits when the user removes an item from the container
   * by dragging it into another container.
   */
  @Output('triDropListContainerExited')
  readonly exited: EventEmitter<TriDragExit<T>> = new EventEmitter<TriDragExit<T>>();

  /**
   * @deprecated will use position strategy. use reposition event
   * @breaking-change 1.13.0
   */
  /** Emits as the user is swapping items while actively dragging. */
  @Output('triDropListContainerSorted')
  readonly sorted: EventEmitter<TriDragSortEvent<T>> = new EventEmitter<TriDragSortEvent<T>>();

  @Output('triDropListContainerRepositioned')
  readonly repositioned: EventEmitter<any> = new EventEmitter<any>();

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
      assertElementNode(element.nativeElement, 'triDropListContainer');
    }

    this._dropContainerRef      = dragDrop.createDropListContainerRef(element);
    this._dropContainerRef.data = this;

    if (config) {
      this._assignDefaults(config);
    }

    this._dropContainerRef.enterPredicate = (drag: DragRef<TriDrag>,
                                             drop: DndContainerRef<TriDropListContainer>) => {
      return this.enterPredicate(drag.data, drop.data);
    };

    this._dropContainerRef.sortPredicate =
      (index: number, drag: DragRef<TriDrag>, drop: DndContainerRef<TriDropListContainer>) => {
        return this.sortPredicate(index, drag.data, drop.data);
      };

    this._setupInputSyncSubscription(this._dropContainerRef as DropListContainerRef);
    this._handleEvents(this._dropContainerRef as DropListContainerRef);
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

  /** Gets the registered items in the list, sorted by their position in the DOM. */
  getSortedItems(): TriDrag[] {
    return Array.from(this._unsortedItems).sort((a: TriDrag, b: TriDrag) => {
      const documentPosition =
              a._dragRef.getVisibleElement().compareDocumentPosition(
                b._dragRef.getVisibleElement());

      // `compareDocumentPosition` returns a bitmask so we have to use a bitwise operator.
      // https://developer.mozilla.org/en-US/docs/Web/API/Node/compareDocumentPosition
      // tslint:disable-next-line:no-bitwise
      return documentPosition & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
    });
  }

  /** Syncs the inputs of the TriDropContainer with the options of the underlying DropContainerRef. */
  protected _setupInputSyncSubscription(ref: DropListContainerRef<TriDropListContainer>) {
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
      ref.lockAxis           = this.lockAxis;
      ref.sortingDisabled    = coerceBooleanProperty(this.sortingDisabled);
      ref.autoScrollDisabled = coerceBooleanProperty(this.autoScrollDisabled);
      ref.autoScrollStep     = coerceNumberProperty(this.autoScrollStep, 2);
      ref
        .connectedTo(
          siblings.filter(drop => drop && drop !== this).map(list => list._dropContainerRef))
        .withOrientation(this.orientation)
        .withPositionStrategy(this.orientation);
    });
  }

  /**
   * todo remove me specify drop list event
   */
  /** Handles events from the underlying DropContainerRef. */
  protected _handleEvents(ref: DropListContainerRef<TriDropListContainer>) {
    ref.beforeStarted.subscribe(() => {
      this._syncItemsWithRef();
      this._changeDetectorRef.markForCheck();
    });

    ref.entered.subscribe(event => {
      this.entered.emit({
        container   : this,
        item        : event.item.data,
        currentIndex: event.currentIndex
      });
    });

    ref.exited.subscribe(event => {
      this.exited.emit({
        container: this,
        item     : event.item.data
      });
      this._changeDetectorRef.markForCheck();
    });

    ref.sorted.subscribe(event => {
      this.sorted.emit({
        previousIndex: event.previousIndex,
        currentIndex : event.currentIndex,
        container    : this,
        item         : event.item.data
      });
    });

    ref.dropped.subscribe(event => {
      this.dropped.emit({
        previousIndex         : event.previousIndex,
        currentIndex          : event.currentIndex,
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

  /** Assigns the default input values based on a provided config object. */
  protected _assignDefaults(config: DragDropConfig) {
    const {
            lockAxis, draggingDisabled, sortingDisabled, listAutoScrollDisabled, listOrientation
          } = config;

    this.disabled           = draggingDisabled == null ? false : draggingDisabled;
    this.sortingDisabled    = sortingDisabled == null ? false : sortingDisabled;
    this.autoScrollDisabled = listAutoScrollDisabled == null ? false : listAutoScrollDisabled;
    this.orientation        = listOrientation || 'vertical';

    if (lockAxis) {
      this.lockAxis = lockAxis;
    }
  }

  /** Syncs up the registered drag items with underlying drop list ref. */
  protected _syncItemsWithRef() {
    this._dropContainerRef.withItems(this.getSortedItems().map(item => item._dragRef));
  }

  ngOnDestroy() {
    const index = TriDropContainer._dropContainers.indexOf(this);

    if (index > -1) {
      TriDropContainer._dropContainers.splice(index, 1);
    }

    if (this._group) {
      this._group._items.delete(this);
    }

    this._unsortedItems.clear();
    this._dropContainerRef.dispose();
    this._destroyed.next();
    this._destroyed.complete();
  }

  static ngAcceptInputType_disabled: BooleanInput;
  static ngAcceptInputType_sortingDisabled: BooleanInput;
  static ngAcceptInputType_autoScrollDisabled: BooleanInput;
  static ngAcceptInputType_autoScrollStep: NumberInput;
}
