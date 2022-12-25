/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  HostBinding,
  Input,
  OnDestroy,
  QueryList,
  TemplateRef,
  ViewChildren
} from '@angular/core';
import {
  CompositeFilterDescriptor,
  GroupDescriptor,
  SortDescriptor
} from '@gradii/triangle/data-query';
import { CheckboxColumnComponent } from '../columns/checkbox-column.component';
import { I18nService } from '@gradii/triangle/i18n';
import { isNullOrEmptyString, isPresent, isTruthy } from '@gradii/triangle/util';
import { merge, Observable, of, Subscription } from 'rxjs';
import { filter, map, switchMap, switchMapTo, takeUntil, tap } from 'rxjs/operators';
import { ColumnBase, isCheckboxColumn } from '../columns/column-base';
import { isColumnGroupComponent } from '../columns/column-group.component';
import { ColumnComponent, isColumnComponent } from '../columns/column.component';
import { ColumnReorderService } from '../dragdrop/column-reorder.service';
import { isTargetBefore, offset, position } from '../dragdrop/common';
import { DragHintService } from '../dragdrop/drag-hint.service';
import { DraggableColumnDirective } from '../dragdrop/draggable-column.directive';
import { DropCueService } from '../dragdrop/drop-cue.service';
import { DropTargetDirective } from '../dragdrop/drop-target.directive';
import {
  FilterableSettings,
  hasFilterMenu,
  hasFilterRow,
  hasFilterSimple
} from '../filtering/filterable';
import { hasItems } from '../filtering/utils';
import { columnsToRender, isInSpanColumn, sortColumns } from '../helper/column-common';
import { IdService } from '../helper/id.service';
import { Keys } from '../helper/keys';
import { normalize, SortSettings } from '../helper/sort-settings';
import { SortService } from '../helper/sort.service';
import { DetailTemplateDirective } from '../table-shared/detail-template.directive';
import { and, not, observe } from '../utils';


// @ts-ignore
const mergeObjects = (...args: any[]) => Object.assign.apply(null, [{}].concat(args));

const directions = (initialDirection: any) => initialDirection === 'asc' ? ['asc', 'desc'] : ['desc', 'asc'];

/**
 * @hidden
 */
const isRootLevel = ({parent}: any) => !isTruthy(parent);

const ofColumnType = ({draggable}: any) => ['column', 'columnGroup']
  .indexOf(draggable.context.type) >= 0;

const notSameElement = ({draggable, target}: any) =>
  draggable.element.nativeElement !== target.element.nativeElement;

const inSameParent = (x: any, y: any): boolean => x.parent === y.parent ||
  (isInSpanColumn(y) && inSameParent(x, y.parent));

const sameParent = ({draggable, target}: any) =>
  inSameParent(draggable.context.column, target.context.column);

const lastNonLocked = ({draggable}: any) =>
  !isTruthy(draggable.context.column.locked) &&
  isRootLevel(draggable.context.column) &&
  draggable.context.lastColumn;

const notInSpanColumn = ({draggable}: any) => !isInSpanColumn(draggable.context.column);

const reorderable = ({draggable}: any) => draggable.context.column.reorderable;

const rules = and(
  ofColumnType,
  reorderable,
  notInSpanColumn,
  notSameElement,
  sameParent,
  not(lastNonLocked)
);


@Component({
  selector           : '[tri-grid-header], [triGridHeader]',
  template           : `
    <tr *ngFor="let i of columnLevels; let levelIndex = index">
      <th
        [class.tri-group-cell]="true"
        [class.tri-header]="true"
        *ngFor="let g of groups">
      </th>
      <th
        [class.tri-hierarchy-cell]="true"
        [class.tri-header]="true"
        *ngIf="detailTemplate?.templateRef">
      </th>
      <ng-template ngFor let-column [ngForOf]="columnsForLevel(levelIndex)"
                   let-columnIndex="index">
        <th cdkOverlayOrigin
            #columnAnchor="cdkOverlayOrigin"
            tri-grid-draggable
            [class.tri-header]="true"
            [class.tri-first]="isFirstOnRow(column, columnIndex)"
            *ngIf="!isColumnGroupComponent(column)"
            [ngClass]="column.headerClass"
            [ngStyle]="column.headerStyle"
            [attr.rowspan]="column.rowspan(totalColumnLevels)"
            [attr.colspan]="column.colspan">
          <!--列头过滤器-->
          <tri-data-table-filter-menu
            *ngIf="showFilterMenu && isFilterable(column)"
            [column]="column"
            [filter]="filter"
            [columnOverlayOrigin]="columnAnchor">
          </tri-data-table-filter-menu>
          <tri-data-table-filter-simple
            *ngIf="showFilterSimple && isFilterable(column)"
            [column]="column"
            [filter]="filter"
            [columnOverlayOrigin]="columnAnchor">
          </tri-data-table-filter-simple>

          <!--列头不可排序-->
          <ng-template [ngIf]="!isSortable(column)">
            <ng-template
              [ngTemplateOutlet]="column.headerTemplateRef"
              [ngTemplateOutletContext]="{
                                        columnIndex: lockedColumnsCount + columnIndex,
                                        column: column,
                                        $implicit: column
                                        }">
            </ng-template>
            <ng-template
              [ngIf]="!column.headerTemplateRef">{{column.displayTitle}}</ng-template>
          </ng-template>

          <!--列头排序按钮-->
          <ng-template [ngIf]="isSortable(column)">
            <a href="#" #link class="tri-link"
               (click)="sortColumn(column, $event, link, sortSpan)">
              <ng-template
                [ngTemplateOutlet]="column.headerTemplateRef"
                [ngTemplateOutletContext]="{
                                          columnIndex: columnIndex,
                                          column: column,
                                          $implicit: column}">
              </ng-template>
              <ng-template [ngIf]="!column.headerTemplateRef">
                <span>{{column.displayTitle}}</span></ng-template>
              <span #sortSpan class="tri-data-table-sort-order">
                  <i [ngClass]="sortIcon(column.field)"></i>
                </span>
            </a>
          </ng-template>

          <!--列头多选按钮-->
          <ng-template
            [ngIf]="isCheckboxColumn(column) && !column.headerTemplateRef && column.showSelectAll">
            <tri-checkbox triGridSelectAllCheckbox></tri-checkbox>
          </ng-template>

          <span triGridColumnHandle
                tri-grid-draggable
                class="tri-column-resizer"
                *ngIf="resizable"
                [column]="column"
                [columns]="columns">
           </span>
        </th>
        <!--列头分组按钮-->
        <th *ngIf="isColumnGroupComponent(column)"
            [class.tri-header]="true"
            [class.tri-first]="isFirstOnRow(column, columnIndex)"
            [ngClass]="column.headerClass"
            [ngStyle]="column.headerStyle"
            [attr.rowspan]="column.rowspan(totalColumnLevels)"
            [attr.colspan]="column.colspan">
          <ng-template
            [ngTemplateOutlet]="column.headerTemplateRef"
            [ngTemplateOutletContext]="{
                                      columnIndex: lockedColumnsCount + columnIndex,
                                      column: column,
                                      $implicit: column}">
          </ng-template>
          <ng-template
            [ngIf]="!column.headerTemplateRef">{{column.displayTitle}}</ng-template>
        </th>
      </ng-template>
    </tr>
    <tr triGridFilterRow
        *ngIf="showFilterRow"
        [columns]="leafColumns"
        [filter]="filter"
        [groups]="groups"
        [detailTemplate]="detailTemplate"
    ></tr>
  `,
  styles             : [`
                          .tri-column-resizer {
                            cursor: col-resize;
                            display: block;
                            height: 1000%;
                            position: absolute;
                            top: 0;
                            width: .5em;
                            margin: 0 -0.25em;
                            z-index: 100;
                          }
                        `]
})
export class HeaderComponent implements OnDestroy, AfterViewInit {
  @Input() totalColumnLevels: number;
  @Input() columns: Array<ColumnBase | any> | QueryList<any | ColumnBase> = [];
  @Input() groups: Array<GroupDescriptor> = [];
  @Input() detailTemplate: DetailTemplateDirective;
  @Input() scrollable: boolean;
  @Input() filterable: FilterableSettings;
  @Input() sort: Array<SortDescriptor> = new Array<SortDescriptor>();
  @Input() filter: CompositeFilterDescriptor;
  @Input() sortable: SortSettings = false;
  @Input() groupable: boolean = false;
  @Input() lockedColumnsCount: number = 0;
  @Input() resizable: boolean = false;
  @Input() reorderable: boolean = false;
  @Input() columnMenu: boolean = false;
  @Input() columnMenuTemplate: TemplateRef<any>;
  @Input() totalColumnsCount: number = 0;
  sortedFields: any = {};
  @ViewChildren(DropTargetDirective) dropTargets: QueryList<DropTargetDirective> = new QueryList<DropTargetDirective>();
  private subscription: Subscription = new Subscription();
  private targetSubscription: Subscription;

  constructor(
    // private popupService: SinglePopupService,
    private hint: DragHintService,
    private cue: DropCueService,
    private reorderService: ColumnReorderService,
    private idService: IdService,
    private sortService: SortService,
    private localization: I18nService,
    private cd: ChangeDetectorRef
  ) {
  }

  @HostBinding('class.k-grid-header') get headerClass(): boolean {
    return !this.scrollable;
  }

  get sortableLabel(): string {
    return this.localization.translate('sortable');
  }

  // Number of unlocked columns in the next table, if any
  get unlockedColumnsCount(): number {
    return this.totalColumnsCount - this.lockedColumnsCount - this.columns.length;
  }

  get showFilterMenu(): boolean {
    return !this.columnMenu && hasFilterMenu(this.filterable);
  }

  get showFilterSimple() {
    return hasFilterSimple(this.filterable);
  }

  get showFilterRow(): boolean {
    return hasFilterRow(this.filterable);
  }

  get columnLevels(): Array<number> {
    return new Array((this.totalColumnLevels || 0) + 1);
  }

  get leafColumns(): ColumnBase[] {
    return columnsToRender(this.columns || []).filter(x => !isColumnGroupComponent(x));
  }

  sortColumn(column: ColumnComponent, event: any, link: any, icon: any) {
    const target = event ? event.target : null;
    if (column.headerTemplateRef && target !== link && target !== icon) {
      return false;
    }
    this.sortService.sort(this.toggleSort(column));
    // prevent default
    return false;
  }

  onHeaderKeydown(column: ColumnComponent, args: KeyboardEvent): void {
    if (!this.sortable || args.defaultPrevented || column.sortable === false) {
      return;
    }

    if (args.keyCode === Keys.enter) {
      this.sortService.sort(this.toggleSort(column));
    }
  }

  showSortNumbering(column: ColumnComponent): boolean {
    const {showIndexes} = normalize(this.sortable);
    return showIndexes
      && this.sort
      && this.sort.filter(({dir}) => isPresent(dir)).length > 1
      && this.sortOrder(column.field) > 0;
  }

  sortOrder(field: string): number {
    return this.sort
        .filter(({dir}) => isPresent(dir))
        .findIndex(x => x.field === field)
      + 1;
  }

  sortIcon(field: string): any {
    const state = this.sortDescriptor(field);
    return {
      'anticon'           : isPresent(state.dir),
      'tri-i-sort-desc-sm': state.dir === 'desc',
      'tri-i-sort-asc-sm' : state.dir === 'asc',
      'anticon-arrow-down': state.dir === 'desc',
      'anticon-arrow-up'  : state.dir === 'asc'
    };
  }

  sortState(column: ColumnComponent): string {
    if (this.isSortable(column)) {
      const state = this.sortDescriptor(column.field);
      if (state.dir === 'asc') {
        return 'ascending';
      }
      if (state.dir === 'desc') {
        return 'descending';
      }
    }
    return null;
  }

  sortStatus(column: ColumnComponent): string {
    if (!this.sortedFields[column.field] || !this.isSortable(column)) {
      return null;
    }

    let msg = 'sortedDefault';
    const state = this.sortDescriptor(column.field);

    if (state.dir === 'asc') {
      msg = 'sortedAscending';
    } else if (state.dir === 'desc') {
      msg = 'sortedDescending';
    }

    return this.localization.translate(msg);
  }

  toggleSort(column: ColumnComponent): Array<SortDescriptor> {
    const {allowUnsort, mode, initialDirection} = normalize(this.sortable, column.sortable);
    const descriptor = this.toggleDirection(column.field, allowUnsort, initialDirection);

    if (mode === 'single') {
      return [descriptor];
    }

    return [...this.sort.filter(desc => desc.field !== column.field), descriptor];
  }

  ngAfterViewInit() {
    this.subscription.add(
      observe(this.dropTargets)
        .subscribe(this.attachTargets.bind(this))
    );
  }

  ngOnChanges(changes: any): void {
    const sortChange = changes.sort;
    if (sortChange && !sortChange.isFirstChange()) {
      sortChange.currentValue.forEach((change: any) => {
        this.sortedFields[change.field] = true;
      });
    }
  }

  ngOnInit(): void {
    this.subscription.add(
      this.localization.localeChange
        .subscribe(() => this.cd.markForCheck())
    );
  }

  ngOnDestroy() {
    if (this.targetSubscription) {
      this.targetSubscription.unsubscribe();
    }

    // if (this.popupService) {
    //   this.popupService.destroy();
    // }

    this.subscription.unsubscribe();
  }

  selectAllCheckboxId(): string {
    return this.idService.selectAllCheckboxId();
  }

  isFirstOnRow(column: ColumnComponent, index: number): boolean {
    const isTailing = (c: any): boolean => c &&
      (this.columnsForLevel(c.level).indexOf(c) > 0 || isTailing(c.parent));

    return index === 0 && !this.groups.length && !this.detailTemplate && isTailing(column.parent);
  }

  leafColumnIndex(column: ColumnComponent): number {
    return this.leafColumns.indexOf(column);
  }

  showColumnMenu(column: any): boolean {
    return this.columnMenu && column.columnMenu &&
      (this.columnMenuTemplate || column.columnMenuTemplates.length || hasItems(this.columnMenu, column));
  }

  isFilterable(column: ColumnBase): boolean {
    return !isNullOrEmptyString((column as ColumnComponent).field) &&
      (column as ColumnComponent).filterable === true;
  }

  canDrop(draggable: DraggableColumnDirective, target: DropTargetDirective): boolean {
    return this.reorderable && rules({draggable, target});
  }

  shouldActivate(column: ColumnBase): boolean {
    const canReorder = this.reorderable && column.reorderable;

    if (!canReorder && !isColumnComponent(column)) {
      return false;
    }

    const groupable = this.groupable && isColumnComponent(column) && column.groupable !== false;

    return groupable || canReorder;
  }

  isSortable(column: ColumnComponent): boolean {
    return !isNullOrEmptyString(column.field)
      && isTruthy(this.sortable) && isTruthy(column.sortable);
  }

  isCheckboxColumn(column: any): column is CheckboxColumnComponent {
    return isCheckboxColumn(column) && !column.templateRef;
  }

  columnsForLevel(level: number): Array<ColumnBase | any> {
    const columns = this.columns ? this.columns.filter(column => column.level === level) : [];

    return sortColumns(columnsToRender(columns));
  }

  isColumnGroupComponent(column: ColumnBase): boolean {
    return isColumnGroupComponent(column);
  }

  protected toggleDirection(field: string, allowUnsort: boolean, initialDirection: 'asc' | 'desc'): SortDescriptor {
    const descriptor = this.sortDescriptor(field);
    const [first, second] = directions(initialDirection);
    let dir = first;

    if (descriptor.dir === first) {
      dir = second;
    } else if (descriptor.dir === second && allowUnsort) {
      dir = undefined;
    }

    return <SortDescriptor>{dir, field};
  }

  private sortDescriptor(field: string): SortDescriptor {
    return this.sort.find(item => item.field === field) || <SortDescriptor>{field};
  }

  private attachTargets(): void {
    if (this.targetSubscription) {
      this.targetSubscription.unsubscribe();
    }

    this.targetSubscription = new Subscription();

    const enterStream = merge(...this.dropTargets.map(target => target.enter));
    const leaveStream = merge(...this.dropTargets.map(target => target.leave));
    const dropStream = merge(...this.dropTargets.map(target => target.drop));

    this.targetSubscription.add(
      enterStream.pipe(
        tap(({target, draggable}: any) => {
          if (draggable.context.type === 'groupIndicator') {
            return;
          }

          const targetLocked = isTruthy(target.context.column.isLocked);
          const draggableLocked = isTruthy(draggable.context.column.isLocked);

          if (this.lockedColumnsCount > 0 || targetLocked || draggableLocked) {
            this.hint.toggleLock(targetLocked);
          }
        }),
        filter(({draggable, target}) => this.canDrop(draggable, target)),
        switchMap(this.trackMove.bind(this, leaveStream, dropStream)),
        map((e: any) => mergeObjects(e, {before: this.calculateBefore(e)})),
        map(this.normalizeTarget.bind(this)),
        tap(this.enter.bind(this)),
        switchMapTo(
          dropStream.pipe(takeUntil(
            leaveStream.pipe(tap(this.leave.bind(this)))
          )),
          (outerArgs, _) => outerArgs
        )
      )
        .subscribe(this.drop.bind(this))
    );
  }

  private normalizeTarget(e: any): Object {
    let target = e.target;

    const parent = target.context.column.parent;

    if (parent && parent.isSpanColumn) {
      const arr = this.dropTargets.toArray();
      const firstSpan = arr.find(t => t.context.column.parent === parent);
      const index = arr.indexOf(firstSpan);
      const adjust = e.before ? 0 : parent.childColumns.length - 1;
      target = arr[index + adjust];
    }

    return mergeObjects(e, {target});
  }

  private trackMove(leaveStream: Observable<any>, dropStream: Observable<any>, e: any): Observable<any> {
    const column = e.target.context.column;
    const levelColumns = this.columnsForLevel(column.level);
    const index = levelColumns.indexOf(column);
    const isFirst = (column.locked ? index === levelColumns.length - 1 : index === 0);
    const changed = e.draggable.context.column.isLocked !== column.isLocked;

    if (changed && isFirst) {
      return e.draggable.drag
        .pipe(
          takeUntil(leaveStream),
          takeUntil(dropStream),
          map(({mouseEvent}: { mouseEvent: MouseEvent }) =>
            mergeObjects({changeContainer: true}, e, {mouseEvent})
          )
        );
    }

    return of(e);
  }

  private calculateBefore({draggable, target, mouseEvent, changeContainer = false}: any): boolean {
    const targetElement = target.element.nativeElement;

    let before = false;

    if (changeContainer) {
      const {left} = offset(targetElement);
      const halfWidth = targetElement.offsetWidth / 2;
      const middle = left + halfWidth;

      before = middle > mouseEvent.pageX;
    } else {
      before = isTargetBefore(
        draggable.element.nativeElement,
        targetElement
      );
    }

    return before;
  }

  private enter({target, before}: any): void {
    this.hint.enable();

    this.cue.position(position(target.element.nativeElement, before));
  }

  private leave(): void {
    this.hint.disable();
    this.cue.hide();
  }

  private drop({draggable, target, before}: any): void {
    this.reorderService.reorder({
      before,
      source: draggable.context.column,
      target: target.context.column
    });
  }
}
