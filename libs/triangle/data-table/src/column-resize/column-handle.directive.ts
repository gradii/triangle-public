/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import {
  ChangeDetectorRef,
  Directive,
  ElementRef,
  Host,
  HostBinding,
  HostListener,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  QueryList
} from '@angular/core';
import { I18nService } from '@gradii/triangle/i18n';
import { isBlank, isPresent, isTruthy } from '@gradii/triangle/util';

import { of, Subscription } from 'rxjs';
import { delay, filter, map, switchMap, take, takeUntil, tap } from 'rxjs/operators';

import { ColumnBase } from '../columns/column-base';
import { columnsToRender, expandColumns, leafColumns } from '../helper/column-common';
import { DraggableDirective } from '../table-shared/draggable.directive';
import { ColumnResizeAction } from './column-resize.interface';

import { ColumnResizingService } from './column-resizing.service';

// TODO
// tslint:disable:rxjs-no-unsafe-takeuntil

/**
 * @hidden
 */
const fromPercentage = (value, percent) => {
  const sign = percent < 0 ? -1 : 1;
  return Math.ceil((Math.abs(percent) / 100) * value) * sign;
};

/**
 * @hidden
 */
const toPercentage = (value, whole) => (value / whole) * 100;

/**
 * @hidden
 */
const headerWidth = (handle: ElementRef) => handle.nativeElement.parentElement.offsetWidth;

/**
 * @hidden
 */
const allLeafColumns = columns => expandColumns(columns)
  .filter(c => !c.isColumnGroup);

/**
 * @hidden
 */
const stopPropagation = ({originalEvent: event}) => {
  event.stopPropagation();
  event.preventDefault();
};

/**
 * @hidden
 */
const createMoveStream = (service, draggable: DraggableDirective) => mouseDown =>
  draggable.tri.drag.pipe(
    takeUntil(draggable.tri.release.pipe(tap(() => service.end()))),
    map(({pageX}) => ({
      originalX: mouseDown.pageX,
      pageX
    }))
  );

/**
 * @hidden
 */
const preventOnDblClick = release => mouseDown =>
  of(mouseDown).pipe(delay(150), takeUntil(release));

/**
 * @hidden
 */
const isInSpanColumn = column => !!(column.parent && column.parent.isSpanColumn);

/**
 * @hidden
 *
 * Calculates the column index. If the column is stated in `SpanColumn`,
 * the index for all child columns equals the index of the first child.
 */
const indexOf = (target, list) => {
  let index = 0;
  let ignore = 0;
  let skip = 0;

  while (index < list.length) {
    const current = list[index];
    const isParentSpanColumn = isInSpanColumn(current);

    if (current === target) {
      break;
    }

    if ((ignore-- <= 0) && isParentSpanColumn) {
      ignore = current.parent.childColumns.length - 1;
      skip += ignore;
    }

    index++;
  }

  return index - skip;
};

/**
 * @hidden
 */
@Directive({
  selector: '[triGridColumnHandle], [tri-grid-column-handle]'
})
export class ColumnHandleDirective implements OnInit, OnDestroy {

  @Input() columns: Array<ColumnBase | any> | QueryList<any> = [];

  @Input() column: ColumnBase;
  private originalWidth: number;
  private subscriptions: Subscription = new Subscription();
  private rtl: boolean = false;

  constructor(
    @Host() public draggable: DraggableDirective,
    private element: ElementRef,
    private service: ColumnResizingService,
    private zone: NgZone,
    private cdr: ChangeDetectorRef,
    private localization: I18nService
  ) {
  }

  @HostBinding('style.display')
  get visible(): string {
    return this.column.resizable ? 'block' : 'none';
  }

  @HostBinding('style.left')
  get leftStyle(): number | null {
    return isTruthy(this.rtl) ? 0 : null;
  }

  @HostBinding('style.right')
  get rightStyle(): number | null {
    return isTruthy(this.rtl) ? null : 0;
  }

  @HostListener('dblclick')
  autoFit(): void {
    const allLeafs = allLeafColumns(this.columns);
    const currentLeafs = leafColumns([this.column]).filter(column => isTruthy(column.resizable));

    const columnInfo = currentLeafs.map(column => {
      const isParentSpan = isInSpanColumn(column);
      const isLastInSpan = isParentSpan ? column.parent.childColumns.last === column : false;
      const index = indexOf(column, allLeafs);

      return {
        column,
        headerIndex: this.columnsForLevel(column.level).indexOf(column),
        index,
        isLastInSpan,
        isParentSpan,
        level      : column.level
      };
    });

    currentLeafs.forEach(column => column.width = 0);

    this.service.measureColumns(columnInfo);
  }

  ngOnInit(): void {
    const service = this.service.changes.pipe(
      filter(() => this.column.resizable),
      filter(e => isPresent(e.columns.find(column => column === this.column)))
    );

    this.subscriptions.add(
      service.pipe(filter(e => e.type === 'start'))
        .subscribe(this.initState.bind(this))
    );

    this.subscriptions.add(
      service.pipe(filter(e => e.type === 'resizeColumn'))
        .subscribe(this.resize.bind(this))
    );

    this.subscriptions.add(
      this.service.changes.pipe(
        filter(e => e.type === 'start'),
        filter(this.shouldUpdate.bind(this)),
        take(1) // on first resize only
      ).subscribe(this.initColumnWidth.bind(this))
    );

    this.subscriptions.add(
      this.zone.runOutsideAngular(() =>
        this.draggable.tri.press.pipe(
          tap(stopPropagation),
          tap(() => this.service.start(this.column)),
          switchMap(preventOnDblClick(this.draggable.tri.release)),
          switchMap(createMoveStream(this.service, this.draggable))
        )
          .subscribe(({pageX, originalX}) => {
            const delta = pageX - originalX;
            const percent = toPercentage(delta, this.originalWidth);

            this.service.resizeColumns(percent);
          })
      )
    );

    this.subscriptions.add(
      service.pipe(filter(e => e.type === 'autoFitComplete'))
        .subscribe(this.sizeToFit.bind(this))
    );

    this.subscriptions.add(
      service.pipe(filter(e => e.type === 'triggerAutoFit'))
        .subscribe(this.autoFit.bind(this))
    );

    // this.subscriptions.add(
    //     this.localization.changes.subscribe(({ rtl }) => this.rtl = rtl)
    // );
  }

  ngOnDestroy(): void {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }
  }

  private shouldUpdate(): boolean {
    return !allLeafColumns(this.columns)
      .map(column => column.width)
      .some(isBlank);
  }

  private initColumnWidth(): void {
    this.column.width = headerWidth(this.element);
  }

  private initState(): void {
    this.originalWidth = headerWidth(this.element);

    this.service.resizedColumn({
      column  : this.column,
      oldWidth: this.originalWidth
    });
  }

  private resize({deltaPercent}: ColumnResizeAction): void {
    let delta = fromPercentage(this.originalWidth, deltaPercent);

    if (isTruthy(this.rtl)) {
      delta *= -1;
    }

    const newWidth = Math.max(
      this.originalWidth + delta,
      this.column.minResizableWidth
    );

    const tableDelta = newWidth > this.column.minResizableWidth ?
      delta : this.column.minResizableWidth - this.originalWidth;

    this.updateWidth(this.column, newWidth);

    this.service.resizeTable(tableDelta);
  }

  private sizeToFit({columns, widths}: ColumnResizeAction): void {
    const index = columns.indexOf(this.column);
    const width = Math.max(...widths.map(w => w[index])) + 1; // add 1px for IE
    const tableDelta = width - this.originalWidth;

    this.updateWidth(this.column, width);

    this.service.resizeTable(tableDelta);
  }

  private updateWidth(column: ColumnBase, width: number): void {
    column.width = width;

    this.cdr.markForCheck(); // force CD cycle
  }

  private columnsForLevel(level: number): Array<ColumnBase> {
    return columnsToRender(this.columns ? this.columns.filter(column => column.level === level) : []);
  }
}
