/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Directionality } from '@angular/cdk/bidi';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import {
  ChangeDetectorRef, Component, ElementRef, Inject, Input, NgZone, OnChanges, OnDestroy, OnInit,
  Optional, Self, SimpleChanges, SkipSelf, ViewChild, ViewContainerRef
} from '@angular/core';
import { clamp } from '@gradii/triangle/util';
import { DragDropConfig, TRI_DRAG_CONFIG } from '../directives/config';

import { TriDrag } from '../directives/drag';
import { TRI_DRAG_HANDLE, TriDragHandle } from '../directives/drag-handle';
import { TRI_DROP_CONTAINER } from '../directives/drop-container';
import type { TriDropGridContainer } from '../directives/drop-grid-container';
import { DragDrop } from '../drag-drop';
import { TRI_DRAG_PARENT } from '../drag-parent';

@Component({
  selector : 'tri-drag-grid-item',
  exportAs : 'triDragGridItem',
  template : `
    <div triDragHandle class="tri-drag-grid-item-content" style="width: 100%;height: 100%">
      <ng-content></ng-content>
    </div>
    <!--<tri-drag-resize
      [disabled]="!resizeEnabled"
      [width]="renderWidth" [height]="renderHeight"
      [rowMargin]="dropContainer.rowGap"
      [columnMargin]="dropContainer.columnGap"
      (triDragResizeStarted)="onDragResizeStart($event)"
      (triDragResized)="onDragResize($event)"
      (triDragResizeEnded)="onDragResizeEnd($event)"
    >
    </tri-drag-resize>-->
  `,
  providers: [
    {provide: TRI_DRAG_PARENT, useExisting: TriDragGridItemComponent}
  ],
  host     : {
    '[style.position]' : '"absolute"',
    '[style.display]'  : '_init ? "block": null',
    '[style.width.px]' : '_init ? renderWidth: null',
    '[style.height.px]': '_init ? renderHeight: null'
  },
  styles   : [
    `
      :host {
        box-sizing  : border-box;
        z-index     : 1;
        position    : absolute;
        overflow    : hidden;
        transition  : .3s;
        display     : none;
        user-select : text;
      }

      .tri-drag-grid-item-content {
        background : white;
      }
    `
  ],
  styleUrls      : [`../../style/drag-resize.scss`]
})
export class TriDragGridItemComponent extends TriDrag
  implements OnInit, OnChanges, OnDestroy {

  private lastPositionX: number;
  private lastPositionY: number;

  @Input('triDragGridItemData')
  data: any;

  @Input('triDragGridItemX')
  x: number       = -1;
  renderX: number = -1;

  @Input('triDragGridItemY')
  y: number       = -1;
  renderY: number = -1;

  @Input('triDragGridItemRows')
  rows: number       = 1;
  renderRows: number = 1;

  @Input('triDragGridItemCols')
  cols: number       = 1;
  renderCols: number = 1;

  // itemChanged

  @Input('triDragGridItemLayerIndex')
  layerIndex?: number;
  // dragEnabled?: boolean;
  // resizeEnabled?: boolean;
  // compactEnabled?: boolean;
  @Input('triDragGridItemMinItemCols')
  minItemCols: number = 1;

  @Input('triDragGridItemMaxItemCols')
  maxItemCols: number = 50;

  @Input('triDragGridItemMinItemRows')
  minItemRows: number = 1;

  @Input('triDragGridItemMaxItemRows')
  maxItemRows: number = 50;

  @Input('triDragGridItemMinItemArea')
  minItemArea: number = 1;

  @Input('triDragGridItemMaxItemArea')
  maxItemArea: number = 2500;

  @Input('triDragGridItemDragEnabled')
  dragEnabled: boolean = true;

  @Input('triDragGridItemResizeEnabled')
  resizeEnabled: boolean = false;

  private _compactEnabled: boolean = true;

  @Input('triDragGridItemCompactEnabled')
  get compactEnabled(): boolean {
    return this._compactEnabled;
  }

  set compactEnabled(value: boolean) {
    this._compactEnabled = coerceBooleanProperty(value);
  }

  notPlaced: boolean = false;

  /*private*/ left: number = 0;
  /*private*/ top: number  = 0;

  renderWidth: number  = 100;
  renderHeight: number = 100;

  _init = false;

  constructor(
    @Inject(TRI_DROP_CONTAINER)
    private gridContainer: TriDropGridContainer,
    /** Element that the draggable is attached to. */
    public element: ElementRef<HTMLElement>,
    /** Droppable container that the draggable is a part of. */
    @Inject(TRI_DROP_CONTAINER) @SkipSelf() public dropContainer: TriDropGridContainer,
    protected _ngZone: NgZone,
    protected _viewContainerRef: ViewContainerRef,
    @Optional() @Inject(TRI_DRAG_CONFIG) config: DragDropConfig,
    @Optional() protected _dir: Directionality, dragDrop: DragDrop,
    protected _changeDetectorRef: ChangeDetectorRef,
    @Optional() @Self() @Inject(TRI_DRAG_HANDLE) protected override _selfHandle?: TriDragHandle,
    @Optional() @SkipSelf() @Inject(TRI_DRAG_PARENT) protected override _parentDrag?: TriDrag
  ) {
    super(
      element, dropContainer, _ngZone, _viewContainerRef,
      config, _dir, dragDrop, _changeDetectorRef, _selfHandle, _parentDrag
    );

  }

  _assignDefaults(config: DragDropConfig) {
    super._assignDefaults(config);
    const {
            defaultLayerIndex,
            defaultItemCols,
            defaultItemRows,
            minItemCols, maxItemCols,
            minItemRows, maxItemRows,
            minItemArea, maxItemArea,
          } = config;

    if (defaultLayerIndex) {
      this.layerIndex = defaultLayerIndex;
    }
    if (defaultItemCols) {
      this.cols = defaultItemCols;
    }
    if (defaultItemRows) {
      this.rows = defaultItemRows;
    }
    if (minItemCols) {
      this.minItemCols = minItemCols;
    }
    if (maxItemCols) {
      this.maxItemCols = maxItemCols;
    }
    if (minItemRows) {
      this.minItemRows = minItemRows;
    }
    if (maxItemRows) {
      this.maxItemRows = maxItemRows;
    }
    if (minItemArea) {
      this.minItemArea = minItemArea;
    }
    if (maxItemArea) {
      this.maxItemArea = maxItemArea;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    super.ngOnChanges(changes);

    let autoPositionItem = false;
    if (changes['x']) {
      this.lastPositionX = changes['x'].currentValue;
      this.renderX       = this.x;
      autoPositionItem   = true;
    }
    if (changes['y']) {
      this.lastPositionY = changes['y'].currentValue;
      this.renderY       = this.y;
      autoPositionItem   = true;
    }

    if (changes['cols']) {
      this.renderCols  = Math.max(
        Math.min(this.cols, this.gridContainer.maxCols),
        this.gridContainer.minCols
      );
      autoPositionItem = true;
    }
    if (changes['rows']) {
      this.renderRows  = Math.max(
        Math.min(this.rows, this.gridContainer.maxRows),
        this.gridContainer.minRows
      );
      autoPositionItem = true;
    }

    if (autoPositionItem) {
      this.dropContainer.positionItem(this);
    }
  }

  updateItemSize(): void {
    this._init      = true;
    const container = this.dropContainer;

    const currentColumnWidth  = container.renderTileWidth;
    const currentColumnHeight = container.renderTileHeight;

    const x = clamp(this.renderX, 0, this.maxItemCols - 1);
    const y = clamp(this.renderY, 0, this.maxItemRows - 1);

    if (!container.hasPadding) {
      this.left = x * currentColumnWidth;
      this.top  = y * currentColumnHeight;
    } else {
      this.left = x * currentColumnWidth + container.columnGap;
      this.top  = y * currentColumnHeight + container.rowGap;
    }
    this.renderWidth  = this.renderCols * currentColumnWidth - container.columnGap;
    this.renderHeight = this.renderRows * currentColumnHeight - container.rowGap;

    this._dragRef.setProgramDragPosition({x: this.left, y: this.top});
    this._changeDetectorRef.markForCheck();
  }

  checkItemChanges(item: TriDragGridItemComponent): void {
    if (
      item.renderRows === item.rows &&
      item.renderCols === item.cols &&
      item.renderX === item.x &&
      item.renderY === item.y
    ) {
      return;
    }
    if (this.gridContainer.checkCollision(this)) {
      this.renderX    = item.x || 0;
      this.renderY    = item.y || 0;
      this.renderCols = item.cols || 1;
      this.renderRows = item.rows || 1;
      this.setSize();
    } else {
      this.cols = this.renderCols;
      this.rows = this.renderRows;
      this.x    = this.renderX;
      this.y    = this.renderY;
      this.gridContainer.calculateLayout();
      this.itemChanged();
    }
  }

  setSize(): void {
    this.element.nativeElement.style.display = this.notPlaced ? 'none' : 'block';
    // this.gridster.gridRenderer.updateItem(this.el, this, this.renderer);
    this.updateItemSize();
  }

  itemChanged() {

  }

  dragStarted() {
    // this.pushService = new GridPushService(this.data as unknown as TriDropGridContainer);
  }

  ngOnInit() {
    this.dropContainer.positionItem(this);

    // this.programDragPosition = {x: this.left, y: this.top};
  }

}
