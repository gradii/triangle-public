/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { BooleanInput, coerceBooleanProperty } from "@angular/cdk/coercion";
import {
  AfterContentChecked,
  AfterContentInit,
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ContentChild,
  ContentChildren,
  ElementRef,
  EventEmitter,
  forwardRef,
  Input,
  isDevMode,
  NgZone,
  OnChanges,
  OnDestroy,
  Output,
  QueryList,
  Renderer2,
  Self,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation,
} from "@angular/core";
import { UntypedFormControl, UntypedFormGroup } from "@angular/forms";
import { isIterable } from "@gradii/nanofn";
import {
  CompositeFilterDescriptor,
  GroupDescriptor,
  GroupResult,
  SortDescriptor,
} from "@gradii/triangle/data-query";
import { TRI_INTERNAL_DATA_TABLE } from "./data-table.types";
import {
  coerceToBoolean,
  isArray,
  isBoolean,
  isDate,
  isFunction,
  isNumber,
  isObject,
  isPresent,
} from "@gradii/triangle/util";
import { merge } from "rxjs";
import { filter, map, take } from "rxjs/operators";
import { CELL_CONTEXT, EMPTY_CELL_CONTEXT } from "./cell-context";
import { ColumnResizingService } from "./column-resize/column-resizing.service";
import { ColumnBase } from "./columns/column-base";
import { isColumnGroupComponent } from "./columns/column-group.component";
import { ColumnList } from "./columns/column-list";
import { ColumnComponent } from "./columns/column.component";
import { ColumnsContainer } from "./columns/columns-container";
import {
  DataResultIterator,
  GridDataResult,
} from "./data-collection/data-result-iterator";
import { DataCollection } from "./data-collection/data.collection";
import { NoRecordsTemplateDirective } from "./directive/no-records-template.directive";
import { ColumnReorderService } from "./dragdrop/column-reorder.service";
import { DragHintService } from "./dragdrop/drag-hint.service";
import { DropCueService } from "./dragdrop/drop-cue.service";
import { AddEvent } from "./event/add-event-args.interface";
import { CancelEvent } from "./event/cancel-event-args.interface";
import {
  DataStateChangeEvent,
  PageChangeEvent,
} from "./event/change-event-args.interface";
import { EditEvent } from "./event/edit-event-args.interface";
import { RemoveEvent } from "./event/remove-event-args.interface";
import { SaveEvent } from "./event/save-event-args.interface";
import { FilterService } from "./filtering/filter.service";
import { GroupInfoService } from "./grouping/group-info.service";
import { GroupableSettings } from "./grouping/group-settings";
import { GroupsService } from "./grouping/groups.service";
import { expandColumns } from "./helper/column-common";
import { IdService } from "./helper/id.service";
import { ScrollMode } from "./helper/scrollmode";
import { SortSettings } from "./helper/sort-settings";
import { SortService } from "./helper/sort.service";
import { ListComponent } from "./list.component";
import { RowClassFn, RowSelectedFn } from "./row-class";
import { syncRowsHeight } from "./row-sync";
import { SelectableSettings } from "./selection/selectable-settings";
import { Selection } from "./selection/selection-default";
import {
  SelectionEvent,
  SelectionService,
} from "./selection/selection.service";
import { BrowserSupportService } from "./service/browser-support.service";
import { ChangeNotificationService } from "./service/change-notification.service";
import { DetailsService } from "./service/details.service";
import { DomEventsService } from "./service/dom-events.service";
import { EditService } from "./service/edit.service";
import { ResponsiveService } from "./service/responsive.service";
import { ScrollSyncService } from "./service/scroll-sync.service";
import { SuspendService } from "./service/suspend.service";

import { DetailTemplateDirective } from "./table-shared/detail-template.directive";
import { ToolbarTemplateDirective } from "./table-shared/toolbar-template.directive";
import { anyChanged, isUniversal } from "./utils";

const createControl = (source: any) => (acc: any, key: string) => {
  acc[key] = new UntypedFormControl(source[key]);
  return acc;
};

const fieldMapFnObjectFactory = (obj: any) => {
  return function (field: any): string {
    for (const [key, val] of Object.entries(obj)) {
      if (field === key) {
        return val as string;
      }
    }
    return null;
  };
};
export type fieldMapFn = (fieldKey: string) => string;
export type fieldFilterMapFn = (
  fieldKey: string
) => "text" | "numeric" | "boolean" | "date" | string;

/**
 * ```html
 * <ng-container triGridLocalizedMessages
 * i18n-groupPanelEmpty="nz.grid.groupPanelEmpty|The label visible in the Grid group panel when it is empty"
 * groupPanelEmpty="Drag a column header and drop it here to group by that column"
 * i18n-noRecords="nz.grid.noRecords|The label visible in the Grid when there are no records"
 * noRecords="No records available."
 * i18n-pagerFirstPage="nz.grid.pagerFirstPage|The label for the first page button in Grid pager"
 * pagerFirstPage="Go to the first page"
 * i18n-pagerPreviousPage="nz.grid.pagerPreviousPage|The label for the previous page button in Grid pager"
 * pagerPreviousPage="Go to the previous page"
 * i18n-pagerNextPage="nz.grid.pagerNextPage|The label for the next page button in Grid pager"
 * pagerNextPage="Go to the next page"
 * i18n-pagerLastPage="nz.grid.pagerLastPage|The label for the last page button in Grid pager"
 * pagerLastPage="Go to the last page"
 * i18n-pagerPage="nz.grid.pagerPage|The label before the current page number in the Grid pager"
 * pagerPage="Page"
 * i18n-pagerOf="nz.grid.pagerOf|The label before the total pages number in the Grid pager"
 * pagerOf="of"
 * i18n-pagerItems="nz.grid.pagerItems|The label after the total pages number in the Grid pager"
 * pagerItems="items"
 * i18n-pagerItemsPerPage="nz.grid.pagerItemsPerPage|The label for the page size chooser in the Grid pager"
 * pagerItemsPerPage="items per page"
 * i18n-filterEqOperator="nz.grid.filterEqOperator|The text of the equal filter operator"
 * filterEqOperator="Is equal to"
 * i18n-filterNotEqOperator="nz.grid.filterNotEqOperator|The text of the not equal filter operator"
 * filterNotEqOperator="Is not equal to"
 * i18n-filterIsNullOperator="nz.grid.filterIsNullOperator|The text of the is null filter operator"
 * filterIsNullOperator="Is null"
 * i18n-filterIsNotNullOperator="nz.grid.filterIsNotNullOperator|The text of the is not null filter operator"
 * filterIsNotNullOperator="Is not null"
 * i18n-filterIsEmptyOperator="nz.grid.filterIsEmptyOperator|The text of the is empty filter operator"
 * filterIsEmptyOperator="Is empty"
 * i18n-filterIsNotEmptyOperator="nz.grid.filterIsNotEmptyOperator|The text of the is not empty filter operator"
 * filterIsNotEmptyOperator="Is not empty"
 * i18n-filterStartsWithOperator="nz.grid.filterStartsWithOperator|The text of the starts with filter operator"
 * filterStartsWithOperator="Starts with"
 * i18n-filterContainsOperator="nz.grid.filterContainsOperator|The text of the contains filter operator"
 * filterContainsOperator="Contains"
 * i18n-filterNotContainsOperator="nz.grid.filterNotContainsOperator|The text of the does not contain filter operator"
 * filterNotContainsOperator="Does not contain"
 * i18n-filterEndsWithOperator="nz.grid.filterEndsWithOperator|The text of the ends with filter operator"
 * filterEndsWithOperator="Ends with"
 * i18n-filterGteOperator="nz.grid.filterGteOperator|The text of the greater than or equal filter operator"
 * filterGteOperator="Is greater than or equal to"
 * i18n-filterGtOperator="nz.grid.filterGtOperator|The text of the greater than filter operator"
 * filterGtOperator="Is greater than"
 * i18n-filterLteOperator="nz.grid.filterLteOperator|The text of the less than or equal filter operator"
 * filterLteOperator="Is less than or equal to"
 * i18n-filterLtOperator="nz.grid.filterLtOperator|The text of the less than filter operator"
 * filterLtOperator="Is less than"
 * i18n-filterIsTrue="nz.grid.filterIsTrue|The text of the IsTrue boolean filter option"
 * filterIsTrue="Is True"
 * i18n-filterIsFalse="nz.grid.filterIsFalse|The text of the IsFalse boolean filter option"
 * filterIsFalse="Is False"
 * i18n-filterBooleanAll="nz.grid.filterBooleanAll|The text of the (All) boolean filter option"
 * filterBooleanAll="(All)"
 * i18n-filterAfterOrEqualOperator="nz.grid.filterAfterOrEqualOperator|The text of the after or equal date filter operator"
 * filterAfterOrEqualOperator="Is after or equal to"
 * i18n-filterAfterOperator="nz.grid.filterAfterOperator|The text of the after date filter operator"
 * filterAfterOperator="Is after"
 * i18n-filterBeforeOperator="nz.grid.filterBeforeOperator|The text of the before date filter operator"
 * filterBeforeOperator="Is before"
 * i18n-filterBeforeOrEqualOperator="nz.grid.filterBeforeOrEqualOperator|The text of the before or equal date filter operator"
 * filterBeforeOrEqualOperator="Is before or equal to"
 * >
 * </ng-container>
 * ```
 */
@Component({
  selector: "tri-data-table",
  exportAs: "triDataTable",
  // changeDetection    : ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  providers: [
    BrowserSupportService,
    SelectionService,
    DetailsService,
    GroupsService,
    GroupInfoService,
    ChangeNotificationService,
    EditService,
    SuspendService,
    FilterService,
    ResponsiveService,
    ScrollSyncService,
    DomEventsService,
    {
      provide: CELL_CONTEXT,
      useValue: EMPTY_CELL_CONTEXT,
    },
    ColumnResizingService,
    DragHintService,
    DropCueService,
    ColumnReorderService,
    IdService,
    SortService,
    {
      provide: TRI_INTERNAL_DATA_TABLE,
      useExisting: forwardRef(() => DataTableComponent),
    },
  ],
  host: {
    "[class.tri-data-table-wrapper]": "true",
    "[attr.dir]": "direction",
    "[style.height.px]": "height",
  },
  template: `
    <tri-data-table-toolbar *ngIf="showTopToolbar"></tri-data-table-toolbar>
    <div
      class="tri-data-table tri-widget tri-table-large"
      [class.tri-data-table-lockedcolumns]="lockedLeafColumns.length > 0"
      [class.tri-data-table-virtual]="isVirtual"
    >
      <tri-data-table-group-panel
        class="tri-table-title"
        *ngIf="showGroupPanel"
        [text]="_groupable?.emptyText"
        [groups]="group"
        (change)="groupChange.emit($event)"
      >
      </tri-data-table-group-panel>
      <ng-template [ngIf]="isScrollable">
        <div
          class="tri-data-table-header tri-data-table-thead"
          [style.padding]="headerPadding"
        >
          <div
            class="tri-data-table-header tri-data-table-header-locked"
            #lockedHeader
            *ngIf="isLocked"
            [style.width.px]="lockedWidth"
          >
            <table>
              <colgroup
                triGridColGroup
                [columns]="lockedLeafColumns"
                [groups]="group"
                [detailTemplate]="detailTemplate"
              ></colgroup>
              <thead
                triGridHeader
                [scrollable]="true"
                [resizable]="resizable"
                [columns]="lockedColumns"
                [totalColumnLevels]="totalColumnLevels"
                [sort]="sort"
                [groups]="group"
                [filter]="filter"
                [filterable]="filterable"
                [groupable]="showGroupPanel"
                [sortable]="sortable"
                [detailTemplate]="detailTemplate"
              ></thead>
            </table>
          </div>
          <div
            class="tri-data-table-header-wrap"
            #header
            [triGridResizableContainer]="lockedLeafColumns.length"
            [lockedWidth]="lockedWidth + scrollbarWidth + 3"
          >
            <table [style.width.px]="nonLockedWidth">
              <colgroup
                triGridColGroup
                [columns]="nonLockedLeafColumns"
                [groups]="isLocked ? [] : group"
                [detailTemplate]="detailTemplate"
              ></colgroup>
              <thead
                triGridHeader
                [scrollable]="true"
                [resizable]="resizable"
                [columns]="nonLockedColumns"
                [totalColumnLevels]="totalColumnLevels"
                [sort]="sort"
                [filter]="filter"
                [filterable]="filterable"
                [groupable]="showGroupPanel"
                [groups]="isLocked ? [] : group"
                [sortable]="sortable"
                [lockedColumnsCount]="lockedLeafColumns.length"
                [detailTemplate]="detailTemplate"
              ></thead>
            </table>
          </div>
        </div>
        <tri-data-table-list
          tri-grid-selectable
          [data]="view"
          [rowData]="view"
          [rowHeight]="rowHeight"
          [detailRowHeight]="detailRowHeight"
          [total]="isVirtual ? view.total : pageSize"
          [skip]="pageIndex"
          [take]="pageSize"
          [groups]="group"
          [groupable]="groupable"
          [columns]="columnsContainer"
          [selectable]="selectable"
          [detailTemplate]="detailTemplate"
          [noRecordsTemplate]="noRecordsTemplate"
          (pageChange)="notifyPageChange('list', $event)"
          [rowClass]="rowClass"
        >
        </tri-data-table-list>
        <div
          *ngIf="showFooter"
          class="tri-table-footer"
          [style.paddingRight.px]="scrollbarWidth"
        >
          <div
            *ngIf="lockedLeafColumns.length"
            class="tri-table-footer-locked"
            [style.width.px]="lockedWidth"
          >
            <table>
              <colgroup
                triGridColGroup
                [columns]="lockedLeafColumns"
                [groups]="group"
                [detailTemplate]="detailTemplate"
              ></colgroup>
              <tfoot
                triGridFooter
                [scrollable]="true"
                [groups]="group"
                [columns]="lockedLeafColumns"
                [detailTemplate]="detailTemplate"
              ></tfoot>
            </table>
          </div>
          <div
            #footer
            class="tri-table-footer-wrap"
            [triGridResizableContainer]="lockedLeafColumns.length"
            [lockedWidth]="lockedWidth + scrollbarWidth + 3"
          >
            <table [style.width.px]="nonLockedWidth">
              <colgroup
                triGridColGroup
                [columns]="nonLockedLeafColumns"
                [groups]="isLocked ? [] : group"
                [detailTemplate]="detailTemplate"
              ></colgroup>
              <tfoot
                triGridFooter
                [scrollable]="true"
                [groups]="isLocked ? [] : group"
                [columns]="nonLockedLeafColumns"
                [lockedColumnsCount]="lockedLeafColumns.length"
                [detailTemplate]="detailTemplate"
              ></tfoot>
            </table>
          </div>
        </div>
      </ng-template>
      <ng-template [ngIf]="!isScrollable">
        <table>
          <colgroup
            triGridColGroup
            [columns]="leafColumns"
            [groups]="group"
            [detailTemplate]="detailTemplate"
          ></colgroup>
          <thead
            triGridHeader
            [scrollable]="false"
            [resizable]="resizable"
            [columns]="visibleColumns"
            [totalColumnLevels]="totalColumnLevels"
            [groups]="group"
            [groupable]="showGroupPanel"
            [sort]="sort"
            [sortable]="sortable"
            [filter]="filter"
            [filterable]="filterable"
            [detailTemplate]="detailTemplate"
          ></thead>
          <tbody
            triGridTableBody
            [groups]="group"
            [data]="view"
            [skip]="pageIndex"
            [columns]="leafColumns"
            [selectable]="selectable"
            [noRecordsText]="''"
            [detailTemplate]="detailTemplate"
            [rowClass]="rowClass"
          ></tbody>
          <tfoot
            triGridFooter
            *ngIf="showFooter"
            [scrollable]="false"
            [groups]="group"
            [columns]="leafColumns"
            [detailTemplate]="detailTemplate"
          ></tfoot>
        </table>
      </ng-template>
    </div>
    <div
      style="margin: 4rem;text-align: center;font-size: medium;"
      *ngIf="!view || (view.length == 0 && !loading)"
    >
      没有数据
    </div>
    <tri-spin
      style="position:absolute;width:100%;"
      *ngIf="loading"
      [spinning]="loading"
      [size]="'large'"
    ></tri-spin>
    <tri-pagination
      class="tri-data-table-pagination"
      *ngIf="showPager"
      [simple]="pageSimple"
      [pageIndex]="pageIndex"
      [pageSize]="pageSize"
      [total]="view.total"
      [showTotal]="pageShowTotal"
      [showSizeChanger]="pageShowSizeChanger"
      [showQuickJumper]="pageShowQuickJumper"
      (pageChange)="notifyPageChange('pager', $event)"
    >
    </tri-pagination>
    <tri-data-table-toolbar *ngIf="showBottomToolbar"></tri-data-table-toolbar>
  `,
  styleUrls: [`../style/data-table.scss`, `../style/pagination.scss`],
})
export class DataTableComponent
  implements
    OnChanges,
    AfterViewInit,
    AfterContentChecked,
    AfterContentInit,
    OnDestroy
{
  direction = "ltr";
  cachedWindowWidth;
  defaultSelection;
  selectionSubscription;
  stateChangeSubscription;
  groupExpandCollapseSubscription;
  detailsServiceSubscription;
  editServiceSubscription;
  filterSubscription;
  sortSubscription;
  columnsChangeSubscription;
  resizeSubscription;
  orientationSubscription;
  columnsContainerChangeSubscription;
  _RowSelected;
  _hasGeneratedColumn: boolean;
  @Input() loading = false;
  @Input() height: number;
  @Output() filterChange: EventEmitter<CompositeFilterDescriptor> =
    new EventEmitter();
  @Output() pageChange: EventEmitter<PageChangeEvent> = new EventEmitter();
  @Output() groupChange: EventEmitter<GroupDescriptor[]> = new EventEmitter();
  @Output() sortChange: EventEmitter<SortDescriptor[]> = new EventEmitter();
  @Output() selectionChange: EventEmitter<SelectionEvent> = new EventEmitter();
  @Output() dataStateChange: EventEmitter<DataStateChangeEvent> =
    new EventEmitter();
  @Output() groupExpand: EventEmitter<{ group: GroupResult }> =
    new EventEmitter();
  @Output() groupCollapse: EventEmitter<{ group: GroupResult }> =
    new EventEmitter();
  @Output() detailExpand: EventEmitter<{ index: number; dataItem: any }> =
    new EventEmitter();
  @Output() detailCollapse: EventEmitter<{ index: number; dataItem: any }> =
    new EventEmitter();
  @Output() autoGenerateColumnsChange = new EventEmitter();
  @Output() edit: EventEmitter<EditEvent> = new EventEmitter();
  @Output() cancel: EventEmitter<CancelEvent> = new EventEmitter();
  @Output() save: EventEmitter<SaveEvent> = new EventEmitter();
  @Output() remove: EventEmitter<RemoveEvent> = new EventEmitter();
  @Output() add: EventEmitter<AddEvent> = new EventEmitter();
  @ContentChildren(ColumnBase) columns: QueryList<ColumnBase>;
  @ContentChild(DetailTemplateDirective, { static: false })
  detailTemplate: DetailTemplateDirective;
  @ContentChildren(NoRecordsTemplateDirective)
  noRecordsTemplate: NoRecordsTemplateDirective;
  // pagerTemplate: PagerTemplateDirective;
  @ContentChild(ToolbarTemplateDirective, { static: false })
  toolbarTemplate: ToolbarTemplateDirective;
  @ViewChild("lockedHeader", { static: false }) lockedHeader: any;
  @ViewChild("header", { static: false }) header: any;
  @ViewChild("footer", { static: false }) footer: any;

  // _cv: CollectionView = new CollectionView();
  // _rows: RowCollection = new RowCollection(24);
  @ViewChild(ListComponent, { static: false }) list: ListComponent;
  scrollbarWidth: number;
  columnList: ColumnList;
  columnsContainer: ColumnsContainer;
  view: DataCollection<any>;
  selectionDirective = false;
  showGroupFooters: boolean;

  constructor(
    supportService: BrowserSupportService,
    @Self() private selectionService: SelectionService,
    private wrapper: ElementRef,
    @Self() private groupInfoService: GroupInfoService,
    @Self() private groupsService: GroupsService,
    @Self() private changeNotification: ChangeNotificationService,
    @Self() private detailsService: DetailsService,
    @Self() private editService: EditService,
    @Self() private filterService: FilterService,
    @Self() private sortService: SortService,
    private responsiveService: ResponsiveService,
    private renderer: Renderer2,
    private ngZone: NgZone,
    private scrollSyncService: ScrollSyncService,
    private cdr: ChangeDetectorRef
  ) {
    this.columns = new QueryList<ColumnBase>();
    this.columnsContainer = new ColumnsContainer(() =>
      this.columnList.filter(
        (column) => !this.isHidden(column) && this.matchesMedia(column)
      )
    );
    // this.view = new DataCollection(new DataResultIterator(this._data, this._group, this.skip, this.childItemsPath));
    this._sort = [];
    this._group = [];
    this._data = [];
    this.cachedWindowWidth = 0;
    this._rowClass = () => null;
    this.scrollbarWidth = supportService.scrollbarWidth;
    this.groupInfoService.registerColumnsContainer(() => this.columnList);
    if (selectionService) {
      this.selectionSubscription = selectionService.changes
        // .pipe(
        //   tap(() => this.cdr.markForCheck())
        // )
        .subscribe((event) => {
          this.selectionChange.emit(event);
        });
    }
    this.groupExpandCollapseSubscription = groupsService.changes
      .pipe(
        filter((_a) => {
          const dataItem = _a.dataItem;
          return isPresent(dataItem);
        })
        // tap(() => this.cdr.markForCheck())
      )
      .subscribe((_a) => {
        const expand = _a.expand;
        const group = _a.dataItem;
        return !expand
          ? this.groupExpand.emit({ group })
          : this.groupCollapse.emit({ group });
      });
    this.detailsServiceSubscription = detailsService.changes
      .pipe(
        filter(({ dataItem }) => {
          return isPresent(dataItem);
        })
        // tap(() => this.cdr.markForCheck())
      )
      .subscribe(({ expand, dataItem, index }) => {
        return expand
          ? this.detailExpand.emit({
              dataItem,
              index,
            })
          : this.detailCollapse.emit({ dataItem, index });
      });
    this.filterSubscription = this.filterService.changes
      // .pipe(
      // tap(() => this.cdr.markForCheck())
      // )
      .subscribe((x) => {
        this.filterChange.emit(x);
      });
    this.sortSubscription = this.sortService.changes.subscribe((x) => {
      this.sortChange.emit(x);
    });
    this.attachStateChangesEmitter();
    this.attachEditHandlers();
    this.columnsContainerChangeSubscription = this.columnsContainer.changes
      .pipe(
        filter(
          () => this.totalColumnLevels > 0 && this.lockedColumns.length > 0
        )
        // tap(() => this.cdr.markForCheck())
      )
      .subscribe(this.columnsContainerChange.bind(this));
    this.columnList = new ColumnList(this.columns);
  }

  _sort: SortDescriptor[];

  @Input()
  get sort(): SortDescriptor[] {
    return this._sort;
  }

  set sort(value) {
    if (isArray(value)) {
      this._sort = value;
      // this.cdr.markForCheck();
    }
  }

  _group: GroupDescriptor[];

  @Input()
  get group(): GroupDescriptor[] {
    return this._group;
  }

  set group(value) {
    if (isArray(value)) {
      this._group = value;
      // this.cdr.markForCheck();
    }
  }

  _pageSimple = true;

  @Input("page.simple")
  get pageSimple(): boolean {
    return this._pageSimple;
  }

  set pageSimple(value: boolean) {
    this._pageSimple = value;
    // this.cdr.markForCheck();
  }

  _pageShowTotal = true;

  @Input("page.showTotal")
  get pageShowTotal(): boolean {
    return this._pageShowTotal;
  }

  set pageShowTotal(value: boolean) {
    this._pageShowTotal = value;
    // this.cdr.markForCheck();
  }

  _pageShowSizeChanger = true;

  @Input("page.showSizeChanger")
  get pageShowSizeChanger(): boolean {
    return this._pageShowSizeChanger;
  }

  set pageShowSizeChanger(value: boolean) {
    this._pageShowSizeChanger = value;
    // this.cdr.markForCheck();
  }

  _pageShowQuickJumper = true;

  @Input("page.showQuickJumper")
  get pageShowQuickJumper(): boolean {
    return this._pageShowQuickJumper;
  }

  set pageShowQuickJumper(value: boolean) {
    this._pageShowQuickJumper = value;
    // this.cdr.markForCheck();
  }

  _pageSize: number;

  @Input()
  get pageSize(): number {
    return this._pageSize;
  }

  set pageSize(value: number) {
    this._pageSize = value;
    // this.cdr.markForCheck();
  }

  _pageIndex = 0;

  @Input()
  get pageIndex(): number {
    return this._pageIndex;
  }

  set pageIndex(value: number) {
    this._pageIndex = value;
    // this.cdr.markForCheck();
  }

  _rowHeight: number;

  @Input()
  get rowHeight(): number {
    return this._rowHeight;
  }

  set rowHeight(value: number) {
    this._rowHeight = value;
    // this.cdr.markForCheck();
  }

  _detailRowHeight: number;

  @Input()
  get detailRowHeight(): number {
    return this._detailRowHeight;
  }

  set detailRowHeight(value: number) {
    this._detailRowHeight = value;
    // this.cdr.markForCheck();
  }

  _scrollable: ScrollMode = "scrollable";

  @Input()
  get scrollable(): ScrollMode {
    return this._scrollable;
  }

  set scrollable(value: ScrollMode) {
    this._scrollable = value;
    // this.cdr.markForCheck();
  }

  _selectable: boolean | SelectableSettings = false;

  @Input()
  get selectable(): boolean | SelectableSettings {
    return this._selectable;
  }

  set selectable(value: boolean | SelectableSettings) {
    this._selectable = coerceBooleanProperty(value);
    // this.cdr.markForCheck();
  }

  _filter: CompositeFilterDescriptor = { logic: "and", filters: [] };

  @Input()
  get filter(): CompositeFilterDescriptor {
    return this._filter;
  }

  set filter(value: CompositeFilterDescriptor) {
    this._filter = value;
    // this.cdr.markForCheck();
  }

  _filterable: boolean | "menu" | "simple" = false;

  @Input()
  get filterable() {
    return this._filterable;
  }

  set filterable(value) {
    this._filterable = value;
    // this.cdr.markForCheck();
  }

  _resizable: boolean = false;

  @Input()
  get resizable() {
    return this._resizable;
  }

  set resizable(value) {
    this._resizable = coerceBooleanProperty(value);
    // this.cdr.markForCheck();
  }

  _sortable: SortSettings = false;

  @Input()
  get sortable(): SortSettings {
    return this._sortable;
  }

  set sortable(value: SortSettings) {
    this._sortable = value;
    // this.cdr.markForCheck();
  }

  _pageable: boolean = false;

  @Input()
  get pageable(): boolean {
    return this._pageable;
  }

  set pageable(value: boolean) {
    this._pageable = value;
    // this.cdr.markForCheck();
  }

  _groupable: GroupableSettings = { enabled: false, showFooter: false };

  @Input()
  get groupable(): GroupableSettings | boolean {
    return this._groupable;
  }

  set groupable(value: GroupableSettings | boolean) {
    if (isBoolean(value)) {
      this._groupable.enabled = value;
    } else {
      Object.assign(this._groupable, value);
    }
    // this.cdr.markForCheck();
  }

  _autoGenerateColumns: boolean;

  @Input()
  get autoGenerateColumns(): boolean {
    return this._autoGenerateColumns;
  }

  set autoGenerateColumns(value: boolean) {
    this._autoGenerateColumns = coerceBooleanProperty(value);
    // this.cdr.markForCheck();
  }

  _fieldMap: fieldMapFn | object;

  @Input()
  get fieldMap(): fieldMapFn | object {
    return this._fieldMap;
  }

  set fieldMap(value: fieldMapFn | object) {
    this._fieldMap = value;
    // this.cdr.markForCheck();
  }

  _fieldFilterMap: fieldFilterMapFn | object;

  @Input()
  get fieldFilterMap(): fieldFilterMapFn | object {
    return this._fieldFilterMap;
  }

  set fieldFilterMap(value: fieldFilterMapFn | object) {
    this._fieldFilterMap = value;
    // this.cdr.markForCheck();
  }

  // todo
  // @ContentChild(PagerTemplateDirective, { static: false })

  _childItemsPath: string;

  @Input()
  get childItemsPath(): string {
    return this._childItemsPath;
  }

  set childItemsPath(value: string) {
    this._childItemsPath = value;
    // this.cdr.markForCheck();
  }

  _showGroups: boolean;

  @Input()
  get showGroups(): boolean {
    return this._showGroups;
  }

  set showGroups(value: boolean) {
    this._showGroups = value;
    // this.cdr.markForCheck();
  }

  _data: any[] | GridDataResult;

  @Input()
  get data(): any[] | GridDataResult {
    return this._data;
  }

  set data(value: any[] | GridDataResult) {
    this.dataSource = value;
    // this.cdr.markForCheck();
  }

  _rowClass;

  @Input()
  get rowClass(): RowClassFn {
    return this._rowClass;
  }

  set rowClass(fn) {
    if (isFunction(fn)) {
      this._rowClass = fn;
    }
  }

  @Input()
  get dataSource(): any[] | GridDataResult {
    return this._data;
  }

  set dataSource(value: any[] | GridDataResult) {
    if (isArray(value) || isIterable(value)) {
      if (this._data != value) {
        this._data = value;
        this.view = new DataCollection(
          new DataResultIterator(
            value /*, this._group, this._skip*/,
            this._childItemsPath
          )
        );

        // this._bindRow();
        // this._rows.iter = Iterable.defer(() => this._bindRow()).memoize();
        // this.cdr.markForCheck();
      }
    }
  }

  get showTopToolbar(): boolean {
    return (
      this.toolbarTemplate &&
      ["top", "both"].includes(this.toolbarTemplate.position)
    );
  }

  get showBottomToolbar(): boolean {
    return (
      this.toolbarTemplate &&
      ["bottom", "both"].includes(this.toolbarTemplate.position)
    );
  }

  get isLocked(): boolean {
    return this.lockedLeafColumns.length > 0;
  }

  get showPager(): boolean {
    return (
      !this.isVirtual &&
      this._pageable !== false &&
      !this._childItemsPath &&
      // first page not show pager
      !(this._pageIndex == 0 && this.view.length == 0)
    );
  }

  get showGroupPanel(): boolean {
    return (
      this._groupable && (<GroupableSettings>this._groupable).enabled !== false
    );
  }

  @Input()
  get rowSelected(): RowSelectedFn {
    return this._RowSelected;
  }

  set rowSelected(fn) {
    if (isFunction(fn)) {
      this._RowSelected = fn;
    }
  }

  // get showGroupFooters(): boolean {
  //   return columnsToRender(this.columnList.toArray()).filter(column => column.groupFooterTemplateRef).length > 0;
  // }

  get headerPadding(): any {
    const padding = `${this.scrollbarWidth}px`;
    const right = padding;
    const left = 0;
    return `0 ${right} 0 ${left}`;
  }

  get showFooter(): boolean {
    return (
      this.columnList.filter((column) => column.footerTemplateRef).length > 0
    );
  }

  get isVirtual(): boolean {
    return this._scrollable === "virtual";
  }

  get isScrollable(): boolean {
    return this._scrollable !== "none";
  }

  get visibleColumns(): QueryList<ColumnBase> {
    return this.columnsContainer.allColumns;
  }

  get lockedColumns(): QueryList<ColumnBase> {
    return this.columnsContainer.lockedColumns;
  }

  get nonLockedColumns(): QueryList<ColumnBase> {
    return this.columnsContainer.nonLockedColumns;
  }

  get lockedLeafColumns(): QueryList<ColumnBase> {
    return this.columnsContainer.lockedLeafColumns;
  }

  get nonLockedLeafColumns(): QueryList<ColumnBase> {
    return this.columnsContainer.nonLockedLeafColumns;
  }

  get leafColumns(): QueryList<ColumnBase> {
    return this.columnsContainer.leafColumns;
  }

  get totalColumnLevels(): number {
    return this.columnsContainer.totalLevels;
  }

  get lockedWidth(): number {
    const groupCellsWidth = this.group.length * 30; // this should be the value of group-cell inside the theme!
    return expandColumns(this.lockedLeafColumns.toArray()).reduce<number>(
      (prev, curr) => prev + (curr.width || 0),
      groupCellsWidth
    );
  }

  get nonLockedWidth(): number {
    if (this.lockedLeafColumns.length) {
      return expandColumns(this.nonLockedLeafColumns.toArray()).reduce(
        (prev, curr) => prev + (curr.width || 0),
        0
      );
    }
    return undefined;
  }

  get selectableSettings() {
    if (this.selectionService) {
      return this.selectionService.options;
    }
    return undefined;
  }

  _cvCollectionChanged() {}

  expandRow(index) {
    if (!this.detailsService.isExpanded(index)) {
      this.detailsService.toggleRow(index, null);
    }
  }

  collapseRow(index) {
    if (this.detailsService.isExpanded(index)) {
      this.detailsService.toggleRow(index, null);
    }
  }

  expandGroup(index) {
    if (!this.groupsService.isExpanded(index)) {
      this.groupsService.toggleRow(index, null);
    }
  }

  collapseGroup(index) {
    if (this.groupsService.isExpanded(index)) {
      this.groupsService.toggleRow(index, null);
    }
  }

  // ngOnInit() {
  //   this.view = new DataCollection(new DataResultIterator(this._data/*, this._group, this._skip*/, this._childItemsPath));
  // }

  onDataChange() {
    this._runAutoGenerateColumns();
    this.changeNotification.notify();
    if (isPresent(this.defaultSelection)) {
      this.defaultSelection.reset();
    }
    this.initSelectionService();
  }

  initView() {}

  ngOnChanges(changes: SimpleChanges) {
    if (anyChanged(["data", "dataSource"], changes)) {
      this.onDataChange();
    }
    if (
      this.lockedLeafColumns.length &&
      anyChanged(["pageIndex", "pageSize", "sort", "group"], changes)
    ) {
      this.changeNotification.notify();
    }
  }

  ngAfterViewInit() {
    const resizeCheck = this.resizeCheck.bind(this);
    this.resizeSubscription = this.renderer.listen(
      "window",
      "resize",
      resizeCheck
    );
    this.orientationSubscription = this.renderer.listen(
      "window",
      "orientationchange",
      resizeCheck
    );
    this.attachScrollSync();
  }

  ngAfterContentChecked() {
    this.columnsContainer.refresh();
    this.verifySettings();
    this.initSelectionService();
  }

  ngAfterContentInit() {
    this._runAutoGenerateColumns();
    this.columnList = new ColumnList(this.columns);
    this.columnsChangeSubscription = this.columns.changes.subscribe(() =>
      this.verifySettings()
    );
  }

  ngOnDestroy() {
    if (this.selectionSubscription) {
      this.selectionSubscription.unsubscribe();
    }
    if (this.stateChangeSubscription) {
      this.stateChangeSubscription.unsubscribe();
    }
    if (this.groupExpandCollapseSubscription) {
      this.groupExpandCollapseSubscription.unsubscribe();
    }
    if (this.detailsServiceSubscription) {
      this.detailsServiceSubscription.unsubscribe();
    }
    if (this.editServiceSubscription) {
      this.editServiceSubscription.unsubscribe();
    }
    if (this.filterSubscription) {
      this.filterSubscription.unsubscribe();
    }
    if (this.sortSubscription) {
      this.sortSubscription.unsubscribe();
    }
    if (this.columnsChangeSubscription) {
      this.columnsChangeSubscription.unsubscribe();
    }
    if (this.resizeSubscription) {
      this.resizeSubscription();
    }
    if (this.orientationSubscription) {
      this.orientationSubscription();
    }
    if (this.columnsContainerChangeSubscription) {
      this.columnsContainerChangeSubscription.unsubscribe();
    }
    if (this.scrollSyncService) {
      this.scrollSyncService.destroy();
    }
    //    if (this.documentClickSubscription) {
    //      this.documentClickSubscription();
    //    }
    //    if (this.windowBlurSubscription) {
    //      this.windowBlurSubscription();
    //    }
    if (this.defaultSelection) {
      this.defaultSelection.destroy();
    }
    //    if (this.cellClickSubscription) {
    //      this.cellClickSubscription.unsubscribe();
    //    }
    //    if (this.footerChangeSubscription) {
    //      this.footerChangeSubscription.unsubscribe();
    //    }
    //    this.ngZone = null;
    //    if (this.columnResizingSubscription) {
    //      this.columnResizingSubscription.unsubscribe();
    //    }
  }

  attachScrollSync() {
    if (isUniversal()) {
      return;
    }
    if (this.header) {
      this.scrollSyncService.registerEmitter(
        this.header.nativeElement,
        "header"
      );
    }
    if (this.footer) {
      this.scrollSyncService.registerEmitter(
        this.footer.nativeElement,
        "footer"
      );
    }
  }

  closeAll() {
    this.editService.closeAll();
  }

  editRow(index: number, group?: any) {
    this.editService.editRow(index, group);
  }

  closeRow(index: number) {
    this.editService.close(index);
  }

  addRow(group: any) {
    const isFormGroup = group instanceof UntypedFormGroup;
    if (!isFormGroup) {
      const fields = Object.keys(group).reduce(createControl(group), {});
      group = new UntypedFormGroup(fields);
    }
    this.editService.addRow(group);
  }

  // todo
  editCell(rowIndex, column, group) {
    const instance = this.columnInstance(column);
    this.editService.editRow(rowIndex, group);
    //    this.focusEditElement('.ant-data-table-edit-cell');
  }

  // todo
  closeCell() {
    this.editService.close();
  }

  //  autoFitColumn (column) {
  //    this.columnResizingService.autoFit(column);
  //  }

  //  autoFitColumns (columns) {
  //    if (columns === void 0) {
  //      columns = this.columns;
  //    }
  //    columns.forEach(this.autoFitColumn.bind(this));
  //  };

  // todo
  cancelCell() {
    this.editService.close();
  }

  //  focusEditElement(){}

  notifyPageChange(source: any, event: any) {
    if (source === "list" && !this.isVirtual) {
      return;
    }
    this._pageIndex = event.pageIndex;
    this._pageSize = event.pageSize;
    this.pageChange.emit(event);
  }

  //  setEditFocus (element) {
  //    if (element) {
  //      var focusable = findFocusable(element);
  //      if (focusable) {
  //        focusable.focus();
  //        return true;
  //      }
  //    }
  //  }

  initSelectionService() {
    if (!this.selectionDirective && !isPresent(this.defaultSelection)) {
      this.defaultSelection = new Selection(this);
    }
    this.selectionService.init({
      rowSelected: this.rowSelected,
      selectable: this._selectable,
      view: this.view,
    });
    if (!this.selectionDirective && !this.selectableSettings.enabled) {
      this.defaultSelection.reset();
    }
  }

  columnInstance(column: any) {
    let instance;
    if (typeof column === "number") {
      instance = this.columnList.filter(function (item) {
        return !item.isColumnGroup && !item.hidden;
      })[column];
    } else if (typeof column === "string") {
      instance = this.columnList.filter(function (item) {
        return (item as ColumnComponent).field === column;
      })[0];
    } else {
      instance = column;
    }
    if (!instance && isDevMode()) {
      throw new Error("Invalid column " + column);
    }
    return instance;
  }

  verifySettings() {
    if (isDevMode()) {
      if (this.lockedLeafColumns.length && this.detailTemplate) {
        throw new Error(
          "Having both detail template and locked columns is not supported"
        );
      }
      if (this.lockedLeafColumns.length && !this.nonLockedLeafColumns.length) {
        throw new Error("There should be at least one non locked column");
      }
      if (
        this.lockedLeafColumns.length &&
        expandColumns(this.columnList.toArray()).filter((x) => !x.width).length
      ) {
        throw new Error(
          "Locked columns feature requires all columns to have width set"
        );
      }
      if (this.lockedLeafColumns.length && !this.isScrollable) {
        throw new Error(
          "Locked columns are only supported when scrolling is enabled"
        );
      }
      if (
        this.columnList
          .filter(isColumnGroupComponent)
          .filter((x: any) => x.children.length < 2).length
      ) {
        throw new Error(
          "ColumnGroupComponent should contain ColumnComponent or CommandColumnComponent"
        );
      }
      if (
        this.columnList.filter(
          (x) => x.locked && x.parent && !x.parent.isLocked
        ).length
      ) {
        throw new Error(
          "Locked child columns require their parent columns to be locked."
        );
      }
      if ((this._rowHeight || this._detailRowHeight) && !this.isVirtual) {
        throw new Error(
          "Row height and detail row height settings requires virtual scrolling mode to be enabled."
        );
      }
    }
  }

  _runAutoGenerateColumns() {
    if (!this.view) {
      return;
    }
    // check field define column
    const fieldColumns: ColumnBase[] = [];
    const otherColumns: ColumnBase[] = [];

    this.columns.forEach((column) => {
      if (column instanceof ColumnComponent) {
        fieldColumns.push(column);
      }
      otherColumns.push(column);
    });

    const order = ["start", "middle", "end"];
    if (
      this.view.length &&
      (!this.columns.length || this._autoGenerateColumns) &&
      !this._hasGeneratedColumn
    ) {
      let keys;
      if (isObject(this._fieldMap)) {
        keys = Object.keys(this._fieldMap);
      } else {
        keys = Object.keys(this.view.at(0));
      }
      this.columns.reset(
        keys
          .map((field) => {
            const column = new ColumnComponent();
            column.field = field;
            if (isFunction(this._fieldMap)) {
              column.title = (this._fieldMap as fieldMapFn)(field);
            } else if (isObject(this._fieldMap)) {
              column.title = fieldMapFnObjectFactory(this._fieldMap)(field);
            }
            if (isFunction(this._fieldMap)) {
              column.filter = (this._fieldFilterMap as fieldFilterMapFn)(field);
            } else if (isObject(this._fieldFilterMap)) {
              column.filter = fieldMapFnObjectFactory(this._fieldFilterMap)(
                field
              );
            } else if (this.view.length > 0) {
              const data = this.view.at(0);
              column.filter = ((field, _data) => {
                if (isNumber(_data)) {
                  return "numeric";
                } else if (isBoolean(_data)) {
                  return "boolean";
                } else if (isDate(_data)) {
                  return "date";
                } else {
                  return "text";
                }
              })(field, data[field]);
            }

            return column;
          })
          .concat(otherColumns)
          .sort((a: ColumnBase, b: ColumnBase) => {
            let Pa = a.autoGenerateColumnPosition;
            let Pb = b.autoGenerateColumnPosition;
            if (!order.includes(Pa)) {
              Pa = "middle";
            }
            if (!order.includes(Pb)) {
              Pb = "middle";
            }
            return order.indexOf(Pa) - order.indexOf(Pb);
          })
      );
      this._hasGeneratedColumn = true;

      this.autoGenerateColumnsChange.emit(this.columns.toArray());
    }
  }

  attachStateChangesEmitter() {
    this.stateChangeSubscription = merge(
      this.pageChange.pipe(
        map((x) => ({
          filter: this._filter,
          group: this.group,
          skip: x.skip,
          sort: this.sort,
          take: x.take,
        }))
      ),
      this.sortChange.pipe(
        map((sort) => ({
          filter: this._filter,
          group: this.group,
          skip: this._pageIndex,
          sort,
          take: this._pageSize,
        }))
      ),
      this.groupChange.pipe(
        map((group) => ({
          filter: this._filter,
          group,
          skip: this._pageIndex,
          sort: this.sort,
          take: this._pageSize,
        }))
      ),
      this.filterChange.pipe(
        map((filter) => ({
          filter,
          group: this.group,
          skip: 0,
          sort: this.sort,
          take: this._pageSize,
        }))
      )
    ).subscribe((x) => this.dataStateChange.emit(x));
  }

  attachEditHandlers() {
    if (!this.editService) {
      return;
    }
    this.editServiceSubscription = this.editService.changes.subscribe(
      this.emitCRUDEvent.bind(this)
    );
  }

  emitCRUDEvent({ action, rowIndex, formGroup, isNew }) {
    let dataItem;
    const row = this.view.at(rowIndex);
    if (isPresent(row)) {
      dataItem = row.dataItem;
    }
    if (action !== "add" && !row) {
      dataItem = formGroup.value;
    }
    const args = {
      dataItem,
      formGroup,
      isNew,
      rowIndex,
      sender: this,
    };
    switch (action) {
      case "add":
        this.add.emit(args);
        break;
      case "cancel":
        this.cancel.emit(args);
        break;
      case "edit":
        this.edit.emit(args);
        break;
      case "remove":
        this.remove.emit(args);
        break;
      case "save":
        this.save.emit(args);
        break;
      default:
        break;
    }
  }

  isHidden(c: ColumnBase) {
    return c.hidden || (c.parent && this.isHidden(c.parent));
  }

  matchesMedia(c: ColumnBase) {
    const matches = this.responsiveService.matchesMedia(c.media);
    return matches && (!c.parent || this.matchesMedia(c.parent));
  }

  resizeCheck() {
    if (window.innerWidth !== this.cachedWindowWidth) {
      this.cachedWindowWidth = window.innerWidth;
      this.columnsContainer.refresh();
      this.verifySettings();
    }
  }

  columnsContainerChange() {
    this.ngZone.onStable.pipe(take(1)).subscribe(() => {
      if (this.lockedHeader) {
        syncRowsHeight(
          this.lockedHeader.nativeElement.children[0],
          this.header.nativeElement.children[0]
        );
      }
    });
  }

  resetGroupsState() {}

  expandGroupChildren(groupIndex: number) {}

  static ngAcceptInputType_resizable: BooleanInput;
  static ngAcceptInputType_selectable: BooleanInput;
  static ngAcceptInputType_autoGenerateColumns: BooleanInput;
}
