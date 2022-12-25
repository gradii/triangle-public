/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import {
  Directive, EventEmitter, Inject, NgZone, OnDestroy, OnInit, Optional, Output, Self, SkipSelf
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TRI_DROP_CONTAINER } from '../directives/drop-container';
import { TriDropGridContainer } from '../directives/drop-grid-container';
import { TriResize } from '../directives/resize';
import { AnchorPosition, OffsetPoint, Point, ResizeRef } from '../drag-drop-ref/resize-ref';
import { getMutableClientRect } from '../utils/client-rect';
import { TriDragGridItemComponent } from './drag-grid-item.component';
import { GridPushResizeService } from './grid-push-resize.service';
import { GridPushService } from './grid-push.service';


interface ResizingEvent {
  source: ResizeRef;
  pointerPosition: { x: number, y: number };
  event: MouseEvent | TouchEvent;
  distance: OffsetPoint;
  delta: { x: -1 | 0 | 1, y: -1 | 0 | 1 };
  resizeAnchorPosition: AnchorPosition;
}

@Directive({
  selector: 'tri-drag-grid-item[triResize]'
})
export class GridResizeDirective implements OnInit, OnDestroy {

  pushService: GridPushService;
  pushResizeService: GridPushResizeService;

  itemBackup: number[] = [];

  _initialClientRect: ClientRect;
  cachedRenderPosition: {
    // initialClientRect: ClientRect,
    x: number, y: number,
    renderX: number, renderY: number,
    renderWidth: number, renderHeight: number
  };

  destroy$ = new Subject();

  @Output('triGridResizeStarted')
  resizeStarted = new EventEmitter<ResizingEvent>();

  @Output('triGridResizeResizing')
  resizeResizing = new EventEmitter<ResizingEvent>();

  @Output('triGridResizeResized')
  resizeResized = new EventEmitter<any>();


  constructor(
    private _ngZone: NgZone,
    @Inject(TRI_DROP_CONTAINER) @SkipSelf() public dropContainer: TriDropGridContainer,
    @Optional() @Self() private item: TriDragGridItemComponent,
    @Optional() @Self() private resize: TriResize,
  ) {

    if (item && resize) {
      console.log('inited');

      this.pushService       = new GridPushService(this.dropContainer._dropContainerRef);
      this.pushResizeService = new GridPushResizeService(this.dropContainer._dropContainerRef);
    }
  }

  newPosition: number;
  minHeight: number;
  minWidth: number;

  previewRect: {
    posX: number, posY: number,
    width: number, height: number
  };

  placeholderRect: {
    posX: number, posY: number,
    width: number, height: number
  };

  private _setItemSize() {
    this.resize._resizeRef._previewRef?.applyTransform(
      this.previewRect.posX - this.cachedRenderPosition.x + this._initialClientRect.left,
      this.previewRect.posY - this.cachedRenderPosition.y + this._initialClientRect.top,
    );

    this.resize._resizeRef._previewRef?.applySize(
      this.previewRect.width, this.previewRect.height
    );

    this.resize._resizeRef.getPlaceholderElement().style.transform =
      `translate(${this.placeholderRect.posX}px, ${this.placeholderRect.posY}px)`;

    this.resize._resizeRef.getPlaceholderElement().style.width  = `${this.placeholderRect.width}px`;
    this.resize._resizeRef.getPlaceholderElement().style.height = `${this.placeholderRect.height}px`;
  }

  private handleNorth = (evt: ResizingEvent): void => {
    const {offsetY} = evt.distance;

    let y      = this.cachedRenderPosition.y + offsetY;
    let height = this.cachedRenderPosition.renderHeight - offsetY;
    if (this.minHeight > height) {
      height = this.minHeight;
      y      = this.cachedRenderPosition.y + this.cachedRenderPosition.renderHeight - this.minHeight;
    }
    this.newPosition = this.dropContainer.pixelsToPositionY(
      y/* - (this.dropContainer.rowGap /!*+ snapGap*!/)*/,
      Math.floor);


    this.previewRect.posY   = y;
    this.previewRect.height = height;

    if (this.item.renderY !== this.newPosition) {
      this.itemBackup[1] = this.item.renderY;
      this.itemBackup[3] = this.item.renderRows;
      this.item.renderRows +=
        this.item.renderY - this.newPosition;
      this.item.renderY  = this.newPosition;

      this.pushResizeService.pushItems(
        this.item._dragRef, 'fromSouth',
        this.dropContainer.disablePushResizeItems
      );
      this.pushService.pushItems(
        this.item._dragRef, 'fromSouth',
        this.dropContainer.disablePushOnResize
      );

      this.placeholderRect.posY   = this.dropContainer.positionYToPixels(this.item.renderY);
      this.placeholderRect.height = this.item.renderRows * this.dropContainer.renderTileHeight - this.dropContainer.rowGap;

      if (this.dropContainer.checkCollision(this.item)) {
        this.item.renderY    = this.itemBackup[1];
        this.item.renderRows = this.itemBackup[3];

        this.placeholderRect.posY   = this.previewRect.posY =
          this.dropContainer.positionYToPixels(this.item.renderY);
        this.placeholderRect.height = this.previewRect.height =
          this.item.renderRows * this.dropContainer.renderTileHeight - this.dropContainer.rowGap;

      } else {
      }

      this.pushResizeService.checkPushBack();
      this.pushService.checkPushBack();
    }
    // this._setItemTop(top);
    // this._setItemHeight(height);
    this._setItemSize();
  };

  private handleWest = (evt: ResizingEvent): void => {
    const {offsetX} = evt.distance;

    let x     = this.cachedRenderPosition.x + offsetX;
    let width = this.cachedRenderPosition.renderWidth - offsetX;
    if (this.minWidth > width) {
      width = this.minWidth;
      x     = this.cachedRenderPosition.x + this.cachedRenderPosition.renderWidth - this.minWidth;
    }

    this.newPosition = this.dropContainer.pixelsToPositionX(
      x/* - (this.dropContainer.rowGap /!*+ snapGap*!/)*/,
      Math.floor);


    this.previewRect.posX  = x;
    this.previewRect.width = width;

    this.placeholderRect.posX  = this.dropContainer.positionXToPixels(this.item.renderX);
    this.placeholderRect.width = this.item.renderCols * this.dropContainer.renderTileWidth - this.dropContainer.columnGap;

    if (this.item.renderX !== this.newPosition) {
      this.itemBackup[0] = this.item.renderX;
      this.itemBackup[2] = this.item.renderCols;
      this.item.renderCols +=
        this.item.renderX - this.newPosition;
      this.item.renderX  = this.newPosition;

      this.pushResizeService.pushItems(
        this.item._dragRef, 'fromEast',
        this.dropContainer.disablePushResizeItems
      );
      this.pushService.pushItems(
        this.item._dragRef, 'fromEast',
        this.dropContainer.disablePushOnResize
      );

      if (this.dropContainer.checkCollision(this.item)) {
        this.item.renderX    = this.itemBackup[0];
        this.item.renderCols = this.itemBackup[2];

        this.placeholderRect.posX  = this.previewRect.posX =
          this.dropContainer.positionXToPixels(this.item.renderX);
        this.placeholderRect.width = this.previewRect.width =
          this.item.renderCols * this.dropContainer.renderTileWidth - this.dropContainer.columnGap;
      }

      this.pushResizeService.checkPushBack();
      this.pushService.checkPushBack();
    }
    // this._setItemLeft(this.left);
    // this._setItemWidth(this.width);
    this._setItemSize();
  };

  private handleSouth = (evt: ResizingEvent): void => {
    const {offsetY2} = evt.distance;

    let height = this.cachedRenderPosition.renderHeight + offsetY2;
    if (this.minHeight > height) {
      height = this.minHeight;
    }
    const y2         = this.cachedRenderPosition.y + height;
    this.newPosition = this.dropContainer.pixelsToPositionY(
      y2 + this.dropContainer.rowGap/* - (this.dropContainer.rowGap /!*+ snapGap*!/)*/,
      Math.ceil);

    this.previewRect.height     = height;
    this.placeholderRect.height = this.item.renderRows * this.dropContainer.renderTileHeight - this.dropContainer.rowGap;

    if (
      this.item.renderY + this.item.renderRows !==
      this.newPosition
    ) {
      this.itemBackup[3]   = this.item.renderRows;
      this.item.renderRows =
        this.newPosition - this.item.renderY;

      this.pushResizeService.pushItems(
        this.item._dragRef, 'fromNorth',
        this.dropContainer.disablePushResizeItems
      );
      this.pushService.pushItems(
        this.item._dragRef, 'fromNorth',
        this.dropContainer.disablePushOnResize
      );

      if (this.dropContainer.checkCollision(this.item)) {
        this.item.renderRows = this.itemBackup[3];

        this.placeholderRect.height = this.previewRect.height =
          this.item.renderRows * this.dropContainer.renderTileHeight - this.dropContainer.rowGap;

      }

      this.pushResizeService.checkPushBack();
      this.pushService.checkPushBack();
    }
    // this._setItemHeight(this.height);

    this._setItemSize();
    // this.resize._resizeRef._previewRef?.applySize(
    //   this.previewRect.width, this.previewRect.height
    // );
    // this.resize._resizeRef.getPlaceholderElement().style.height = `${this.placeholderRect.height}px`;
  };

  private handleEast = (evt: ResizingEvent): void => {
    const {offsetX2} = evt.distance;

    let width = this.cachedRenderPosition.renderWidth + offsetX2;
    if (this.minWidth > width) {
      width = this.minWidth;
    }
    const x2         = this.cachedRenderPosition.x + width;
    this.newPosition = this.dropContainer.pixelsToPositionX(
      x2 + this.dropContainer.columnGap/* - (this.dropContainer.rowGap /!*+ snapGap*!/)*/,
      Math.ceil);

    this.previewRect.width     = width;
    this.placeholderRect.width = this.item.renderCols * this.dropContainer.renderTileWidth - this.dropContainer.columnGap;

    if (
      this.item.renderX + this.item.renderCols !==
      this.newPosition
    ) {
      this.itemBackup[2]   = this.item.renderCols;
      this.item.renderCols =
        this.newPosition - this.item.renderX;

      this.pushResizeService.pushItems(
        this.item._dragRef, 'fromWest',
        this.dropContainer.disablePushResizeItems
      );
      this.pushService.pushItems(
        this.item._dragRef, 'fromWest',
        this.dropContainer.disablePushOnResize
      );

      if (this.dropContainer.checkCollision(this.item)) {
        this.item.renderCols = this.itemBackup[2];

        this.placeholderRect.width = this.previewRect.width =
          this.item.renderCols * this.dropContainer.renderTileWidth - this.dropContainer.columnGap;
      }

      this.pushResizeService.checkPushBack();
      this.pushService.checkPushBack();
    }

    this._setItemSize();
    // this.resize._resizeRef._previewRef?.applySize(
    //   this.previewRect.width, this.previewRect.height
    // );
    // this.resize._resizeRef.getPlaceholderElement().style.width = `${this.placeholderRect.width}px`;
  };

  private handleNorthWest = (e: ResizingEvent): void => {
    this.handleNorth(e);
    this.handleWest(e);
  };

  private handleNorthEast = (e: ResizingEvent): void => {
    this.handleNorth(e);
    this.handleEast(e);
  };

  private handleSouthWest = (e: ResizingEvent): void => {
    this.handleSouth(e);
    this.handleWest(e);
  };

  private handleSouthEast = (e: ResizingEvent): void => {
    this.handleSouth(e);
    this.handleEast(e);
  };

  ngOnInit() {
    this.resize._resizeRef.beforeStarted.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this._initialClientRect = getMutableClientRect(this.item.element.nativeElement);

      this.cachedRenderPosition = {
        x           : this.item.left,
        y           : this.item.top,
        renderX     : this.item.renderX,
        renderY     : this.item.renderY,
        renderWidth : this.item.renderWidth,
        renderHeight: this.item.renderHeight
      };

      this.previewRect = {
        posX : this.item.left, posY: this.item.top,
        width: this.item.renderWidth, height: this.item.renderHeight
      };


      this.placeholderRect = {
        posX : this.item.left, posY: this.item.top,
        width: this.item.renderWidth, height: this.item.renderHeight
      };


    });
    this.resize._resizeRef.started.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {

      this.minHeight = this.item.minItemRows * this.dropContainer.renderTileHeight - this.dropContainer.rowGap;
      this.minWidth  = this.item.minItemCols * this.dropContainer.renderTileWidth - this.dropContainer.columnGap;
    });

    this.resize._resizeRef.resizing.pipe(
      takeUntil(this.destroy$)
    ).subscribe((evt: ResizingEvent) => {
      const {resizeAnchorPosition: anchorPosition} = evt;

      if (anchorPosition === 'north') {
        this.handleNorth(evt);
      } else if (anchorPosition === 'south') {
        this.handleSouth(evt);
      } else if (anchorPosition === 'west') {
        this.handleWest(evt);
      } else if (anchorPosition === 'east') {
        this.handleEast(evt);
      } else if (anchorPosition === 'westNorth') {
        this.handleNorthWest(evt);
      } else if (anchorPosition === 'westSouth') {
        this.handleSouthWest(evt);
      } else if (anchorPosition === 'eastNorth') {
        this.handleNorthEast(evt);
      } else if (anchorPosition === 'eastSouth') {
        this.handleSouthEast(evt);
      }
    });

    this.resize._resizeRef.resized.pipe(
      takeUntil(this.destroy$)
    ).subscribe((evt) => {
      // const {item} = evt;
      this._ngZone.run(() => {

        this.resizeResized.next({
          elementPositionX       : evt.elementPositionX,
          elementPositionY       : evt.elementPositionY,
          item                   : evt.item,
          distance               : evt.distance,
          dropPoint              : evt.dropPoint,
          elementRelativePosition: evt.elementRelativePosition,

          x   : this.item.renderX, y: this.item.renderY,
          cols: this.item.renderCols, rows: this.item.renderRows
        });

        this.dropContainer.itemsResized.next([
          {
            resizeItem: this,
            item      : this.item,
            x         : this.item.renderX, y: this.item.renderY,
            cols      : this.item.renderCols, rows: this.item.renderRows
          }
        ]);
      });
      this.item.updateItemSize();
    });
  }

  ngOnDestroy() {
    this.destroy$.complete();
  }
}
