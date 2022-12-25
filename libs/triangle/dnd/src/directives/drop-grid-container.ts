/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Directionality } from '@angular/cdk/bidi';
import {
  BooleanInput, coerceArray, coerceBooleanProperty, coerceElement, coerceNumberProperty, NumberInput
} from '@angular/cdk/coercion';
import { ScrollDispatcher } from '@angular/cdk/scrolling';
import {
  AfterViewInit, ChangeDetectorRef, Component, ElementRef, EventEmitter, forwardRef, Inject,
  InjectionToken, Input, NgZone, OnChanges, OnDestroy, OnInit, Optional, Output, SimpleChanges,
  SkipSelf, ViewChild, ViewEncapsulation
} from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, startWith, takeUntil, tap } from 'rxjs/operators';
import { assertElementNode } from '../directives/assertions';
import { TRI_DROP_CONTAINER, TriDropContainer } from '../directives/drop-container';
import { DragDrop } from '../drag-drop';
import { DndContainerRef } from '../drag-drop-ref/dnd-container-ref';
import { DragRef } from '../drag-drop-ref/drag-ref';
import { DropGridContainerRef } from '../drag-drop-ref/drop-grid-container-ref';
import { CompactPositionService } from '../drag-grid/compact-position.service';
import { TriDragGridItemComponent } from '../drag-grid/drag-grid-item.component';
import { GridType } from '../drag-grid/grid-config.interface';
import { CompactType, Direction, GridTypes } from '../enum';
import { TriDragDrop, TriDragEnter, TriDragExit } from '../event/drag-events';
import { DragAxis, DragDropConfig, TRI_DRAG_CONFIG } from './config';
import { TRI_DROP_CONTAINER_GROUP, TriDropContainerGroup } from './drop-container-group';

declare const ngDevMode: boolean;

export const TRI_DROP_GRID_CONTAINER_CONFIG = new InjectionToken('tri drop grid container config');


@Component({
  selector     : '[triDropGridContainer], tri-drop-grid-container',
  exportAs     : 'triDropGridContainer',
  template     : `
    <div #content style="position: absolute; transition: .3s;visibility: hidden"></div>
    <ng-content></ng-content>
  `,
  encapsulation: ViewEncapsulation.None,
  providers    : [
    {provide: TRI_DROP_CONTAINER, useExisting: forwardRef(() => TriDropGridContainer)},
  ],
  inputs       : [
    'disabled:triDropGridContainerDisabled',
  ],
  host         : {
    'class'                                           : 'tri-drop-grid-container',
    '[attr.id]'                                       : 'id',
    '[class.tri-drop-container-disabled]'             : 'disabled',
    '[class.tri-drop-container-dragging]'             : '_dropContainerRef.isDragging()',
    '[class.tri-drop-container-receiving]'            : '_dropContainerRef.isReceiving()',
    '[class.tri-drop-grid-container-fit]'             : 'gridType === "fit"',
    '[class.tri-drop-grid-container-scrollVertical]'  : 'gridType === "scrollVertical" || gridType === "verticalFixed"',
    '[class.tri-drop-grid-container-scrollHorizontal]': 'gridType === "scrollHorizontal" || gridType === "horizontalFixed"',
    '[class.tri-drop-grid-container-fixed]'           : 'gridType === "fixed"',
  },
  styles       : [
    `
      .tri-drop-grid-container {
        position    : relative;
        box-sizing  : border-box;
        background  : gray;
        width       : 100%;
        height      : 100%;
        user-select : none;
        display     : block;
        overflow    : hidden;
      }

      .tri-drop-grid-container-fit {
        overflow-x : hidden;
        overflow-y : hidden;
      }

      .tri-drop-grid-container-scrollVertical {
        overflow-x : hidden;
        overflow-y : auto;
      }

      .tri-drop-grid-container-scrollHorizontal {
        overflow-x : auto;
        overflow-y : hidden;
      }

      .tri-drop-grid-container-fixed {
        overflow : auto;
      }
    `
  ]
})
export class TriDropGridContainer<T = any>
  extends TriDropContainer
  implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  /** Emits when the list has been destroyed. */
  private readonly _destroyed = new Subject<void>();

  /** Whether the element's scrollable parents have been resolved. */
  private _scrollableParentsResolved: boolean;

  @ViewChild('content')
  contentElement: ElementRef;

  /** Reference to the underlying drop list instance. */
  _dropContainerRef: DropGridContainerRef<TriDropGridContainer<T>>;

  /**
   * Other draggable containers that this container is connected to and into which the
   * container's items can be transferred. Can either be references to other drop containers,
   * or their unique IDs.
   */
  @Input('triDropGridContainerConnectedTo')
  connectedTo: (TriDropContainer | string)[] | TriDropContainer | string = [];

  /** Arbitrary data to attach to this container. */
  @Input('triDropGridContainerData')
  data: T;

  @Input('triDropGridContainerHasPadding')
  hasPadding: boolean = false;

  /** Locks the position of the draggable elements inside the container along the specified axis. */
  @Input('triDropGridContainerLockAxis')
  lockAxis: DragAxis;

  @Input('triDropGridContainerGap')
  gap: number = 10;

  private _rowGap: number = 0;


  @Input('triDropGridContainerRowGap')
  get rowGap(): number {
    return this._rowGap || this.gap;
  }

  set rowGap(value: number) {
    this._rowGap = value;
  }

  private _columnGap: number = 0;

  @Input('triDropGridContainerColumnGap')
  get columnGap(): number {
    return this._columnGap || this.gap;
  }

  set columnGap(value: number) {
    this._columnGap = value;
  }

  renderRows: number = 1;

  renderCols: number = 1;

  @Input('triDropGridContainerCols')
  cols: number = 1;

  @Input('triDropGridContainerRows')
  rows: number = 1;

  @Input('triDropGridContainerMinCols')
  minCols: number = 1;

  @Input('triDropGridContainerMaxCols')
  maxCols: number = 100;

  @Input('triDropGridContainerMinRows')
  minRows: number = 1;

  @Input('triDropGridContainerMaxRows')
  maxRows: number = 100;

  @Input('triDropGridContainerCompactType')
  compactType: CompactType;

  @Input('triDropGridContainerPushItems')
  pushItems: boolean;

  @Input('triDropGridContainerSwapItem')
  swapItem: boolean;

  @Input('triDropGridContainerDisablePushResizeItems')
  disablePushResizeItems: boolean = false;

  @Input('triDropGridContainerPushDirectionsSouth')
  pushDirectionsSouth: boolean = true;

  @Input('triDropGridContainerPushDirectionsWest')
  pushDirectionsWest: boolean = true;

  @Input('triDropGridContainerPushDirectionsNorth')
  pushDirectionsNorth: boolean = true;

  @Input('triDropGridContainerPushDirectionsEast')
  pushDirectionsEast: boolean = true;

  @Input('triDropGridContainerDisablePushOnDrag')
  disablePushOnDrag: boolean = false;

  @Input('triDropGridContainerDisablePushOnResize')
  disablePushOnResize: boolean = false;

  @Input('triDropGridContainerDisableAutoPositionOnConflict')
  disableAutoPositionOnConflict: boolean;

  @Input('triDropGridContainerCheckCollisionCallback')
  checkCollisionCallback: (item: any) => boolean;

  @Input('triDropGridContainerGridType')
  gridType: GridTypes = 'fit';

  /** Whether sorting within this drop list is disabled. */
  // @Input('triDropContainerSortingDisabled')
  // sortingDisabled: boolean;

  /**
   * Function that is used to determine whether an item
   * is allowed to be moved into a drop container.
   */
  @Input('triDropGridContainerEnterPredicate')
  enterPredicate: (drag: TriDragGridItemComponent,
                   drop: TriDropGridContainer) => boolean = () => true;

  /** Functions that is used to determine whether an item can be sorted into a particular index. */
  @Input('triDropGridContainerSortPredicate')
  sortPredicate: (index: number, drag: TriDragGridItemComponent,
                  drop: TriDropGridContainer) => boolean = () => true;

  /** Whether to auto-scroll the view when the user moves their pointer close to the edges. */
  @Input('triDropGridContainerAutoScrollDisabled')
  autoScrollDisabled: boolean;

  /** Number of pixels to scroll for each frame when auto-scrolling an element. */
  @Input('triDropGridContainerAutoScrollStep')
  autoScrollStep: number;

  @Input('triDropGridContainerTileRatio')
  tileRatio: number = 1;

  @Input('triDropGridContainerFixedWidth')
  fixedWidth: number;

  @Input('triDropGridContainerFixedHeight')
  fixedHeight: number;

  /** Emits when the user drops an item inside the container. */
  @Output('triDropGridContainerDropped')
  readonly dropped: EventEmitter<TriDragDrop<T, any>> = new EventEmitter<TriDragDrop<T, any>>();

  /**
   * Emits when the user has moved a new drag item into this container.
   */
  @Output('triDropGridContainerEntered')
  readonly entered: EventEmitter<TriDragEnter<T>> = new EventEmitter<TriDragEnter<T>>();

  /**
   * Emits when the user removes an item from the container
   * by dragging it into another container.
   */
  @Output('triDropGridContainerExited')
  readonly exited: EventEmitter<TriDragExit<T>> = new EventEmitter<TriDragExit<T>>();

  // /**
  //  * @deprecated will use position strategy. use reposition event
  //  * @breaking-change 1.13.0
  //  */
  // /** Emits as the user is swapping items while actively dragging. */
  // @Output('triDropContainerSorted')
  // readonly sorted: EventEmitter<TriDragSortEvent<T>> = new
  // EventEmitter<TriDragSortEvent<T>>();

  @Output('triDropGridContainerRepositioned')
  readonly repositioned: EventEmitter<any> = new EventEmitter<any>();

  @Output('triDropGridContainerResized')
  readonly itemsResized: EventEmitter<any[]> = new EventEmitter<any[]>();

  /**
   * Keeps track of the items that are registered with this container. Historically we used to
   * do this with a `ContentChildren` query, however queries don't handle transplanted views very
   * well which means that we can't handle cases like dragging the headers of a `mat-table`
   * correctly. What we do instead is to have the items register themselves with the container
   * and then we sort them based on their position in the DOM.
   */
  private _unsortedItems = new Set<TriDragGridItemComponent>();

  private el: HTMLElement;

  private compactService: CompactPositionService;

  swapWhileDragging: boolean = false;

  swap: boolean = false;


  constructor(
    /** Element that the drop list is attached to. */
    public element: ElementRef<HTMLElement>, dragDrop: DragDrop,
    private _changeDetectorRef: ChangeDetectorRef,
    private _scrollDispatcher: ScrollDispatcher,
    private _ngZone: NgZone,
    @Optional() private _dir?: Directionality,
    @Optional() @Inject(TRI_DROP_CONTAINER_GROUP) @SkipSelf()
    protected _group?: TriDropContainerGroup<TriDropGridContainer>,
    @Optional() @Inject(TRI_DRAG_CONFIG) public config?: DragDropConfig
  ) {
    super(_group);

    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      assertElementNode(element.nativeElement, 'triDropContainer');
    }

    this.el = element.nativeElement;

    this._dropContainerRef      = dragDrop.createDropGridContainerRef(element);
    this._dropContainerRef.data = this;

    if (config) {
      this._assignDefaults(config);
    }

    this._dropContainerRef.enterPredicate = (drag: DragRef<TriDragGridItemComponent>,
                                             drop: DndContainerRef<TriDropGridContainer>) => {
      return this.enterPredicate(drag.data, drop.data);
    };

    this._dropContainerRef.sortPredicate =
      (index: number, drag: DragRef<TriDragGridItemComponent>,
       drop: DndContainerRef<TriDropGridContainer>) => {
        return this.sortPredicate(index, drag.data, drop.data);
      };

    this._setupInputSyncSubscription(this._dropContainerRef);
    this._handleEvents(this._dropContainerRef);
    TriDropContainer._dropContainers.push(this);


    this.compactService = new CompactPositionService(this);
  }

//   /**
//    * @deprecated use positionItem instead
//    * @param itemComponent
//    */
//   addGridItem(itemComponent: TriDragGridItemComponent): void {
//     if (itemComponent.cols === undefined) {
//       itemComponent.cols       = this.defaultItemCols;
//       itemComponent.renderCols = itemComponent.cols;
//       // itemComponent.itemChanged();
//     }
//     if (itemComponent.rows === undefined) {
//       itemComponent.rows       = this.defaultItemRows;
//       itemComponent.renderRows = itemComponent.rows;
//       // itemComponent.itemChanged();
//     }
//     if (itemComponent.x === -1 || itemComponent.y === -1) {
//       this.autoPositionItem(itemComponent);
//     } else if (this.checkCollision(itemComponent)) {
//       if (ngDevMode) {
//         itemComponent.notPlaced = true;
//         console.warn(
//           `Can't be placed in the bounds of the dashboard, trying to auto position!
// ${JSON.stringify(itemComponent, ['cols', 'rows', 'x', 'y'])}`
//         );
//       }
//       if (!this.disableAutoPositionOnConflict) {
//         this.autoPositionItem(itemComponent);
//       } else {
//         itemComponent.notPlaced = true;
//       }
//     }
//     // this.grid.push(itemComponent);
//     this._unsortedItems.add(itemComponent);
//     this.calculateLayout$.next();
//   }

  positionItem(item: TriDragGridItemComponent) {
    if (item.renderCols == null) {
      item.renderCols = item.cols;
      // item.itemChanged();
    }
    if (item.renderCols == null) {
      item.renderRows = item.rows;
      // item.itemChanged();
    }
    // item.renderX = item.x;
    // item.renderY = item.y;
    if (item.x === -1 || item.y === -1) {
      this.autoPositionItem(item);
    } else if (this.checkCollision(item)) {
      if (ngDevMode) {
        item.notPlaced = true;
        console.warn(`Can't be placed in the bounds of the dashboard, trying to auto position!
${JSON.stringify(item, ['cols', 'rows', 'x', 'y'])}`);
      }
      if (!this.disableAutoPositionOnConflict) {
        this.autoPositionItem(item);
      } else {
        item.notPlaced = true;
      }
    } else {
      item.notPlaced = false;
    }

    this.calculateLayout();
  }

  getUnSortedItems() {
    return this._unsortedItems;
  }

  /** Gets the registered items in the list, sorted by their position in the DOM. */
  getSortedItems(direction: Direction = Direction.xy): TriDragGridItemComponent[] {
    return Array.from(this._unsortedItems).sort(
      (a: TriDragGridItemComponent, b: TriDragGridItemComponent) => {
        if (direction == Direction.yx) {
          return (a.x - b.x || a.y > b.y) as number;
        } else {
          return (a.y > b.y || a.x - b.x) as number;
        }
      });
  }

  /** Syncs the inputs of the TriDropContainer with the options of the underlying DropContainerRef. */
  private _setupInputSyncSubscription(ref: DropGridContainerRef<TriDropGridContainer>) {
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
      // ref.sortingDisabled    = coerceBooleanProperty(this.sortingDisabled);
      ref.autoScrollDisabled = coerceBooleanProperty(this.autoScrollDisabled);
      ref.autoScrollStep     = coerceNumberProperty(this.autoScrollStep, 2);

      ref._hasPadding             = this.hasPadding;
      ref._rowGap                 = this.rowGap;
      ref._columnGap              = this.rowGap;
      ref._currentContainerWidth  = this.renderWidth;
      ref._currentContainerHeight = this.renderHeight;
      ref._currentTileWidth       = this.renderTileWidth;
      ref._currentTileHeight      = this.renderTileHeight;

      ref
        .connectedTo(
          siblings.filter(drop => drop && drop !== this).map(list => list._dropContainerRef));
    });
  }

  /**
   * todo remove me specify drop list event
   */
  /** Handles events from the underlying DropContainerRef. */
  private _handleEvents(ref: DndContainerRef<TriDropGridContainer>) {
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

    // ref.sorted.subscribe(event => {
    //   this.sorted.emit({
    //     previousIndex: event.previousIndex,
    //     currentIndex : event.currentIndex,
    //     container    : this,
    //     item         : event.item.data
    //   });
    // });

    ref.dropped.subscribe(event => {
      this.dropped.emit({
        previousIndex         : event.previousIndex,
        currentIndex          : event.currentIndex,
        positionX             : event.positionX,
        positionY             : event.positionY,
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
  private _assignDefaults(config: DragDropConfig) {
    const {
            lockAxis, draggingDisabled, listAutoScrollDisabled
          } = config;

    this.disabled           = draggingDisabled == null ? false : draggingDisabled;
    // this.sortingDisabled    = sortingDisabled == null ? false : sortingDisabled;
    this.autoScrollDisabled = listAutoScrollDisabled == null ? false : listAutoScrollDisabled;

    if (lockAxis) {
      this.lockAxis = lockAxis;
    }
  }

  /** Syncs up the registered drag items with underlying drop list ref. */
  private _syncItemsWithRef() {
    this._dropContainerRef.withItems(this.getSortedItems().map(item => item._dragRef));
  }

  private calculateLayout$ = new Subject();

  calculateLayout() {
    this.calculateLayout$.next(true);
  }

  renderTileWidth: number;
  renderTileHeight: number;

  ngOnInit() {
    this._ngZone.runOutsideAngular(() => {
      this.calculateLayout$.pipe(
        debounceTime(10), takeUntil(this._destroyed),
      ).subscribe(() => this._ngZone.run(() => this._calculateLayout()));
    });
  }

  checkCollision(item: TriDragGridItemComponent): any | boolean {
    let collision: any | boolean = false;
    if (this.checkCollisionCallback) {
      collision = this.checkCollisionCallback(item);
    }
    if (!collision && this.checkGridCollision(item)) {
      collision = true;
    }
    if (!collision) {
      const c = this.findItemWithItem(item);
      if (c) {
        collision = c;
      }
    }
    return collision;
  }

  checkGridCollision(item: TriDragGridItemComponent): boolean {
    const noNegativePosition = item.renderY > -1 && item.renderX > -1;
    const maxGridCols        = item.renderCols + item.renderX <= this.maxCols;
    const maxGridRows        = item.renderRows + item.renderY <= this.maxRows;
    const inColsLimits       = item.renderCols <= item.maxItemCols && item.renderCols >= item.minItemCols;
    const inRowsLimits       = item.renderRows <= item.maxItemRows && item.renderRows >= item.minItemRows;
    const area               = item.renderCols * item.renderRows;
    const inMinArea          = item.minItemArea <= area;
    const inMaxArea          = item.maxItemArea >= area;
    return !(noNegativePosition && maxGridCols && maxGridRows && inColsLimits && inRowsLimits && inMinArea && inMaxArea);
  }

  findItemWithItem(item: TriDragGridItemComponent): any | boolean {
    for (const widget of this._unsortedItems) {
      if (widget !== item && this.checkCollisionTwoItems(widget, item)) {
        return widget;
      }
    }
    return false;
  }

  findItemsWithItem(item: TriDragGridItemComponent): Array<TriDragGridItemComponent> {
    const rst = [];
    for (const widget of this._unsortedItems) {
      if (widget !== item && this.checkCollisionTwoItems(widget, item)) {
        rst.push(widget);
      }
    }
    return rst;
  }

  pixelsToPositionX(pointerX: number, fn: (x: number) => number = Math.round): number {
    const scrollLeft = coerceElement(this.element).scrollLeft;
    return this.hasPadding ?
      fn((pointerX + scrollLeft - this.columnGap) / this.renderTileWidth) :
      fn((pointerX + scrollLeft + this.columnGap) / this.renderTileWidth);
  }

  pixelsToPositionY(pointerY: number, fn: (x: number) => number = Math.round) {
    const scrollTop = coerceElement(this.element).scrollTop;
    return this.hasPadding ?
      fn((pointerY + scrollTop - this.rowGap) / this.renderTileHeight) :
      fn((pointerY + scrollTop + this.rowGap) / this.renderTileHeight);
  }

  positionXToPixels(x: number): number {
    return this.hasPadding ? x * this.renderTileWidth + this.columnGap : x * this.renderTileWidth;
  }

  positionYToPixels(y: number): number {
    return this.hasPadding ? y * this.renderTileHeight + this.rowGap : y * this.renderTileHeight;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['rows'] && changes['rows'].firstChange) {
      this.renderRows = this.rows;
    }
    if (changes['cols'] && changes['cols'].firstChange) {
      this.renderCols = this.cols;
    }

    if (
      changes['x'] || changes['y'] ||
      changes['rows'] || changes['cols'] ||
      changes['compactType'] ||
      changes['hasPadding']
    ) {
      this.calculateLayout();
    }

    // this.columns = this.$options.minCols;
    // this.rows    = this.$options.minRows + this.$options.addEmptyRowsCount;
    // this.setGridSize();
    // this.calculateLayout();
  }

  ngAfterViewInit() {
    this.calculateLayout();
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
  // static ngAcceptInputType_sortingDisabled: BooleanInput;
  static ngAcceptInputType_columns: NumberInput;
  static ngAcceptInputType_rows: NumberInput;
  static ngAcceptInputType_autoScrollDisabled: BooleanInput;
  static ngAcceptInputType_autoScrollStep: NumberInput;


  // ------ Function for swapWhileDragging option

  // checkCollisionTwoItems(item: any, item2: any): boolean {
  //   const collision = item.x < item2.x + item2.cols
  //     && item.x + item.cols > item2.x
  //     && item.y < item2.y + item2.rows
  //     && item.y + item.rows > item2.y;
  //   if (!collision) {
  //     return false;
  //   }
  //   return true;
  //   // if (!this.options.allowMultiLayer) {
  //   //   return true;
  //   // }
  //   // const defaultLayerIndex = this.$options.defaultLayerIndex;
  //   // const layerIndex        = item.layerIndex === undefined ? defaultLayerIndex : item.layerIndex;
  //   // const layerIndex2       = item2.layerIndex === undefined ? defaultLayerIndex : item2.layerIndex;
  //   // return layerIndex === layerIndex2;
  // }

  @Input('triDropGridContainerAllowMultiLayer')
  allowMultiLayer: boolean;

  defaultLayerIndex = 0;

  checkCollisionTwoItems(item: TriDragGridItemComponent, item2: TriDragGridItemComponent): boolean {
    const collision =
            !(item.renderX + item.renderCols <= item2.renderX ||
              item.renderX >= item2.renderX + item2.renderCols ||
              item.renderY + item.renderRows <= item2.renderY ||
              item.renderY >= item2.renderY + item2.renderRows);
    if (!collision) {
      return false;
    }
    if (!this.allowMultiLayer) {
      return true;
    }
    const defaultLayerIndex = this.defaultLayerIndex;
    const layerIndex        =
            item.layerIndex === undefined ? defaultLayerIndex : item.layerIndex;
    const layerIndex2       =
            item2.layerIndex === undefined ? defaultLayerIndex : item2.layerIndex;
    return layerIndex === layerIndex2;
  }

  // ngOnInit(): void {
  //   if (this.options.initCallback) {
  //     this.options.initCallback(this);
  //   }
  //
  //   this.calculateLayout$
  //     .pipe(debounceTime(0), takeUntil(this.destroy$))
  //     .subscribe(() => this.calculateLayout());
  //
  //   this.resize$
  //     .pipe(
  //       // Cancel previously scheduled DOM timer if `calculateLayout()` has been called
  //       // within this time range.
  //       switchMap(() => timer(100)),
  //       takeUntil(this.destroy$)
  //     )
  //     .subscribe(() => this.resize());
  // }
  //
  // ngOnChanges(changes: SimpleChanges): void {
  //   if (changes.options) {
  //     this.setOptions();
  //     this.options.api = {
  //       optionsChanged          : this.optionsChanged,
  //       resize                  : this.onResize,
  //       getNextPossiblePosition : this.getNextPossiblePosition,
  //       getFirstPossiblePosition: this.getFirstPossiblePosition,
  //       getLastPossiblePosition : this.getLastPossiblePosition,
  //       getItemComponent        : (item: GridsterItem) => this.getItemComponent(item)
  //     };
  //     this.columns     = this.$options.minCols;
  //     this.rows        = this.$options.minRows + this.$options.addEmptyRowsCount;
  //     this.setGridSize();
  //     this.calculateLayout();
  //   }
  // }
  //
  // private resize(): void {
  //   let height;
  //   let width;
  //   if (this.$options.gridType === 'fit' && !this.mobile) {
  //     width  = this.el.offsetWidth;
  //     height = this.el.offsetHeight;
  //   } else {
  //     width  = this.el.clientWidth;
  //     height = this.el.clientHeight;
  //   }
  //   if (
  //     (width !== this.curWidth || height !== this.curHeight) &&
  //     this.checkIfToResize()
  //   ) {
  //     this.onResize();
  //   }
  // }
  //
  // setOptions(): void {
  //   this.$options = GridsterUtils.merge(
  //     this.$options,
  //     this.options,
  //     this.$options
  //   );
  //   if (!this.$options.disableWindowResize && !this.windowResize) {
  //     this.windowResize = this.renderer.listen(
  //       'window',
  //       'resize',
  //       this.onResize
  //     );
  //   } else if (this.$options.disableWindowResize && this.windowResize) {
  //     this.windowResize();
  //     this.windowResize = null;
  //   }
  //   this.emptyCell.updateOptions();
  // }
  //
  // optionsChanged = (): void => {
  //   this.setOptions();
  //   let widgetsIndex: number = this.grid.length - 1;
  //   let widget: GridsterItemComponentInterface;
  //   for (; widgetsIndex >= 0; widgetsIndex--) {
  //     widget = this.grid[widgetsIndex];
  //     widget.updateOptions();
  //   }
  //   this.calculateLayout();
  // };
  //
  // ngOnDestroy(): void {
  //   this.destroy$.next();
  //   this.previewStyle$.complete();
  //   if (this.windowResize) {
  //     this.windowResize();
  //   }
  //   if (this.options && this.options.destroyCallback) {
  //     this.options.destroyCallback(this);
  //   }
  //   if (this.options && this.options.api) {
  //     this.options.api.resize                  = undefined;
  //     this.options.api.optionsChanged          = undefined;
  //     this.options.api.getNextPossiblePosition = undefined;
  //     this.options.api                         = undefined;
  //   }
  //   this.emptyCell.destroy();
  //   this.emptyCell = null!;
  //   this.compact.destroy();
  //   this.compact = null!;
  // }
  //
  // onResize = (): void => {
  //   if (this.el.clientWidth) {
  //     if (this.options.setGridSize) {
  //       // reset width/height so the size is recalculated afterwards
  //       this.renderer.setStyle(this.el, 'width', '');
  //       this.renderer.setStyle(this.el, 'height', '');
  //     }
  //     this.setGridSize();
  //     this.calculateLayout();
  //   }
  // };
  //
  // checkIfToResize(): boolean {
  //   const clientWidth             = this.el.clientWidth;
  //   const offsetWidth             = this.el.offsetWidth;
  //   const scrollWidth             = this.el.scrollWidth;
  //   const clientHeight            = this.el.clientHeight;
  //   const offsetHeight            = this.el.offsetHeight;
  //   const scrollHeight            = this.el.scrollHeight;
  //   const verticalScrollPresent   =
  //           clientWidth < offsetWidth &&
  //           scrollHeight > offsetHeight &&
  //           scrollHeight - offsetHeight < offsetWidth - clientWidth;
  //   const horizontalScrollPresent =
  //           clientHeight < offsetHeight &&
  //           scrollWidth > offsetWidth &&
  //           scrollWidth - offsetWidth < offsetHeight - clientHeight;
  //   if (verticalScrollPresent) {
  //     return false;
  //   }
  //   return !horizontalScrollPresent;
  // }
  //
  // checkIfMobile(): boolean {
  //   if (this.$options.useBodyForBreakpoint) {
  //     return this.$options.mobileBreakpoint > document.body.clientWidth;
  //   } else {
  //     return this.$options.mobileBreakpoint > this.curWidth;
  //   }
  // }
  //

  mobile: boolean;

  renderWidth: number;
  renderHeight: number;

  canSetGridSize: boolean;

  setGridSize(): void {
    const el = this.el;
    let width;
    let height;
    if (
      this.canSetGridSize ||
      (this.gridType === GridType.Fit && !this.mobile)
    ) {
      width  = el.offsetWidth;
      height = el.offsetHeight;
    } else {
      width  = el.clientWidth;
      height = el.clientHeight;
    }
    this.renderWidth  = width;
    this.renderHeight = height;
  }


  // setGridDimensions(): void {
  //   // this.setGridSize();
  //   let rows    = this.minRows;
  //   let columns = this.minCols;
  //
  //   this._unsortedItems.forEach(item => {
  //     // item.updateItemSize();
  //     if (!item.notPlaced) {
  //       rows    = Math.max(rows, item.y + item.rows);
  //       columns = Math.max(columns, item.x + item.cols);
  //     }
  //   });
  //
  //   if (this.cols !== columns || this.rows !== rows) {
  //     this.cols = columns;
  //     this.rows = rows;
  //     // if (this.options.gridSizeChangedCallback) {
  //     //   this.options.gridSizeChangedCallback(this);
  //     // }
  //   }
  // }

  checkIfMobile() {
    return false;
  }

  addEmptyRowsCount: number = 0;

  gridSizeChanged: EventEmitter<any> = new EventEmitter();

  setGridDimensions(): void {
    this.setGridSize();
    if (!this.mobile && this.checkIfMobile()) {
      this.mobile = !this.mobile;
      this.el.classList.add('mobile');
    } else if (this.mobile && !this.checkIfMobile()) {
      this.mobile = !this.mobile;
      this.el.classList.remove('mobile');
    }
    let rows    = this.minRows;
    let columns = this.minCols;

    this._unsortedItems.forEach(item => {
      // item.updateItemSize();
      if (!item.notPlaced) {
        rows    = Math.max(rows, item.renderY + item.renderRows);
        columns = Math.max(columns, item.renderX + item.renderCols);
      }
    });

    rows += this.addEmptyRowsCount;
    if (this.renderCols !== columns || this.renderRows !== rows) {
      this.renderCols = Math.min(Math.max(columns, this.minCols), this.maxCols);
      this.renderRows = Math.min(Math.max(rows, this.minRows), this.maxRows);
      // if (this.options.gridSizeChangedCallback) {
      //   this.options.gridSizeChangedCallback(this);
      // }
      this.gridSizeChanged.next({
        cols: this.renderCols,
        rows: this.renderRows
      });
    }
  }

  /**
   * @deprecated
   */
  renderRowHeight: number;
  renderColHeight: number;
  renderRowWidth: number;
  /**
   * @deprecated
   */
  renderColWidth: number;

  rowHeightRatio: number;

  outerMargin: boolean      = false;
  outerMarginLeft: number   = null;
  outerMarginRight: number  = null;
  outerMarginTop: number    = null;
  outerMarginBottom: number = null;

  margin: number = 0;

  private _calculateLayout(): void {
    if (this.compactService) {
      this.compactService.checkCompact(this.compactType);
    }

    // if not auto row and column
    this.setGridDimensions();

    const clientRect = this.element.nativeElement.getBoundingClientRect();

    if (!this.hasPadding) {
      this.renderTileWidth  = (clientRect.width + this.columnGap) / this.cols;
      this.renderTileHeight = (clientRect.height + this.rowGap) / this.rows;
    } else {
      this.renderTileWidth  = (clientRect.width - this.columnGap) / this.cols;
      this.renderTileHeight = (clientRect.height - this.rowGap) / this.rows;
    }

    this._unsortedItems.forEach(item => {
      item.updateItemSize();
    });

    if (this.outerMargin) {
      let marginWidth = -this.margin;
      if (this.outerMarginLeft !== null) {
        marginWidth += this.outerMarginLeft;
        this.el.style.setProperty('padding-left', this.outerMarginLeft + 'px');
      } else {
        marginWidth += this.margin;
        this.el.style.setProperty('padding-left', this.margin + 'px');
      }
      if (this.outerMarginRight !== null) {
        marginWidth += this.outerMarginRight;
        this.el.style.setProperty('padding-right', this.outerMarginRight + 'px');
      } else {
        marginWidth += this.margin;
        this.el.style.setProperty('padding-right', this.margin + 'px');
      }

      this.renderColWidth = (this.renderWidth - marginWidth) / this.renderCols;
      let marginHeight    = -this.margin;

      if (this.outerMarginTop !== null) {
        marginHeight += this.outerMarginTop;
        this.el.style.setProperty('padding-top', this.outerMarginTop + 'px');
      } else {
        marginHeight += this.margin;
        this.el.style.setProperty('padding-top', this.margin + 'px');
      }
      if (this.outerMarginBottom !== null) {
        marginHeight += this.outerMarginBottom;
        this.el.style.setProperty('padding-bottom', this.outerMarginBottom + 'px');
      } else {
        marginHeight += this.margin;
        this.el.style.setProperty('padding-bottom', this.margin + 'px');
      }
      this.renderRowHeight =
        ((this.renderHeight - marginHeight) / this.rows) *
        this.rowHeightRatio;
    } else {
      this.renderColWidth  = (this.renderWidth + this.margin) / this.renderCols;
      this.renderRowHeight =
        ((this.renderHeight + this.margin) / this.rows) *
        this.rowHeightRatio;

      this.el.style.setProperty('padding-left', '0px');
      this.el.style.setProperty('padding-right', '0px');
      this.el.style.setProperty('padding-top', '0px');
      this.el.style.setProperty('padding-bottom', '0px');
    }
    // this.gridRenderer.updateGridster();

    if (this.setGridSize) {
      // this.renderer.addClass(this.el, 'gridSize');
      this.el.classList.add('gridSize');
      if (!this.mobile) {
        // this.renderer.setStyle(
        //   this.el,
        //   'width',
        //   this.columns * this.curColWidth + this.$options.margin + 'px'
        // );
        // this.renderer.setStyle(
        //   this.el,
        //   'height',
        //   this.rows * this.curRowHeight + this.$options.margin + 'px'
        // );
        this.el.style.setProperty('width',
          this.renderCols * this.renderColWidth + this.margin + 'px');
        this.el.style.setProperty('height',
          this.renderRows * this.renderRowHeight + this.margin + 'px');

      }
    } else {
      // this.renderer.removeClass(this.el, 'gridSize');
      // this.renderer.setStyle(this.el, 'width', '');
      // this.renderer.setStyle(this.el, 'height', '');
      this.el.classList.remove('gridSize');
      this.el.style.removeProperty('width');
      this.el.style.removeProperty('height');
    }

    // this.updateGrid();

    this._unsortedItems.forEach(item => {
      // item.setSize();
      // item.drag.toggle();
      // item.resize.toggle();
    });

    // this.resize$.next();
  }

  defaultItemCols: number;
  defaultItemRows: number;

  addItem(item: TriDragGridItemComponent): void {

    this._unsortedItems.add(item);

    // this.calculateLayoutDebounce();

    if (this._dropContainerRef.isDragging()) {
      this._syncItemsWithRef();
    }
  }

  /** Removes an item from the drop list. */
  removeItem(item: TriDragGridItemComponent): void {
    this._unsortedItems.delete(item);
    this.calculateLayout$.next(true);

    if (this._dropContainerRef.isDragging()) {
      this._syncItemsWithRef();
    }
  }


  autoPositionItem(item: TriDragGridItemComponent): void {
    if (this.getNextPossiblePosition(item)) {
      item.notPlaced = false;
      // item.x         = item.renderX;
      // item.y         = item.renderY;
      // itemComponent.itemChanged();
    } else {
      item.notPlaced = true;
      if (ngDevMode) {
        console.warn(`Can't be placed in the bounds of the dashboard!\n${JSON.stringify(item,
          ['cols', 'rows', 'x', 'y'])}`);
      }
    }
  }


  getNextPossiblePosition(newItem: TriDragGridItemComponent,
                          startingFrom: { y?: number, x?: number } = {}/*, dryRun: boolean*/): boolean {
    // this.setGridDimensions();
    let rowsIndex = startingFrom.y || 0;
    let colsIndex;
    for (; rowsIndex < this.renderRows; rowsIndex++) {
      newItem.renderY = rowsIndex;
      colsIndex       = startingFrom.x || 0;
      for (; colsIndex < this.renderCols; colsIndex++) {
        newItem.renderX = colsIndex;
        if (!this.checkCollision(newItem)) {
          return true;
        }
      }
    }
    const canAddToRows    = this.maxRows >= this.renderRows + newItem.renderRows;
    const canAddToColumns = this.maxCols >= this.renderCols + newItem.renderCols;
    const addToRows       = this.renderRows <= this.renderCols && canAddToRows;
    if (!addToRows && canAddToColumns) {
      newItem.renderX = this.renderCols;
      newItem.renderY = 0;
      return true;
    } else if (canAddToRows) {
      newItem.renderY = this.renderRows;
      newItem.renderX = 0;
      return true;
    }
    return false;
  }

  checkCollisionForSwaping(
    item: TriDragGridItemComponent
  ): boolean {
    let collision: any | boolean = false;
    if (/*!collision &&*/ this.checkGridCollision(item)) {
      collision = true;
    }
    if (!collision) {
      const c = this.findItemWithItemForSwapping(item);
      if (c) {
        collision = c;
      }
    }
    return collision;
  }

  findItemWithItemForSwapping(
    item: TriDragGridItemComponent
  ): boolean {
    // let widgetsIndex: number = this.grid.length - 1;
    // let widget: GridsterItemComponentInterface;
    // for (; widgetsIndex > -1; widgetsIndex--) {
    //   widget = this.grid[widgetsIndex];
    //   if (
    //     // widget.$item !== item &&
    //     checkCollisionTwoItemsForSwaping(widget.$item, item)
    //   ) {
    //     return widget;
    //   }
    // }
    return false;
  }

}
