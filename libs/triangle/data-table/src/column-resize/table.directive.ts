/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import {
  ChangeDetectorRef,
  Directive,
  ElementRef,
  HostBinding,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  Renderer2
} from '@angular/core';

import { Observable, Subscription } from 'rxjs';
import { bufferCount, filter, map, switchMap, tap } from 'rxjs/operators';

import { resizableColumns } from '../helper/column-common';
import { AutoFitInfo, AutoFitObservable, ColumnResizeAction } from './column-resize.interface';

import { ColumnResizingService } from './column-resizing.service';

/**
 * @hidden
 */
const columnsToResize = ({columns}: ColumnResizeAction) =>
  Math.max(1, resizableColumns(columns).length - 1);

/**
 * @hidden
 */
const row = selector => element => element.querySelector(selector);

/**
 * @hidden
 */
const headerRow = index => element => element.querySelectorAll('thead>tr')[index];

/**
 * @hidden
 */
const cell = (index, selector = 'td') => element =>
  element.querySelectorAll(`${selector}:not(.k-group-cell):not(.k-hierarchy-cell)`)[index];

/**
 * @hidden
 */
const offsetWidth = element => element.offsetWidth;

/**
 * @hidden
 */
const pipe = (...fns) => data => fns.reduce((state, fn) => state ? fn(state) : 0, data);

/**
 * @hidden
 */
@Directive({
  selector: 'table' // tslint:disable-line:directive-selector
})
export class TableDirective implements OnInit, OnDestroy {

  @Input() locked: boolean = false;
  private originalWidth: number;
  private firstResize: boolean = false;
  private subscription: Subscription;
  private autoFitSubscription: Function;

  constructor(
    private element: ElementRef,
    private renderer: Renderer2,
    private service: ColumnResizingService,
    private zone: NgZone,
    private cdr: ChangeDetectorRef
  ) {
  }

  @HostBinding('style.min-width')
  get minWidth(): number | null {
    return this.firstResize ? 0 : null;
  }

  ngOnInit(): void {
    const obs = this.service
      .changes.pipe(filter(e => this.locked === e.locked));

    this.subscription = obs.pipe(
      filter(e => e.type === 'start'),
      tap(this.initState.bind(this)),
      map(columnsToResize),
      switchMap((take: number) =>
        obs.pipe(
          filter(e => e.type === 'resizeTable'),
          map(e => e.delta),
          bufferCount(take)
        )
      )
    ).subscribe(this.resize.bind(this));

    this.autoFitSubscription = this.service
      .registerTable(this.autoFitObservable.bind(this));
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    this.autoFitSubscription();
  }

  private initState(): void {
    this.firstResize = true;
    this.originalWidth = offsetWidth(this.element.nativeElement);
  }

  private resize(deltas: number[]): void {
    const delta = deltas.reduce((sum, item) => sum + item, 0);

    this.updateWidth(this.originalWidth + delta);
  }

  private updateWidth(width: number): void {
    this.renderer.setStyle(this.element.nativeElement, 'width', width + 'px');

    this.cdr.detectChanges(); // force CD cycle
  }

  private autoFitObservable(columnInfo: Array<AutoFitInfo>): AutoFitObservable {
    return Observable.create(observer => {
      this.zone.runOutsideAngular(() => {
        this.renderer.addClass(this.element.nativeElement, 'k-autofitting');

        this.cdr.detectChanges(); // force CD cycle

        const widths = columnInfo.map(this.measureColumn.bind(this));

        this.renderer.removeClass(this.element.nativeElement, 'k-autofitting');

        observer.next(widths);
      });
    });
  }

  private measureColumn(info: AutoFitInfo): number {
    const dom = this.element.nativeElement;

    const header = pipe(
      headerRow(info.level),
      cell(info.headerIndex, 'th'),
      offsetWidth
    )(dom);

    let data = 0;
    if (!info.isParentSpan || (info.isParentSpan && info.isLastInSpan)) {
      data = pipe(
        row('tbody>tr:not(.k-grouping-row)'),
        cell(info.index),
        offsetWidth
      )(dom);
    }

    const footer = pipe(
      row('tfoot>tr'),
      cell(info.index),
      offsetWidth
    )(dom);

    return Math.max(header, data, footer);
  }
}
