/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Component, Input, OnChanges, QueryList, SimpleChanges } from '@angular/core';
import { GroupDescriptor } from '@gradii/triangle/data-query';
import { DataCollection } from '../data-collection/data.collection';
import { isPresent } from '@gradii/triangle/util';
import {
  ColumnBase,
  isCheckboxColumn,
  isHierarchyColumn,
  isSpanColumn
} from '../columns/column-base';
import { GroupFooterItem, GroupItem, Item } from '../data-collection/data.iterators';
import { NoRecordsTemplateDirective } from '../directive/no-records-template.directive';
import { GroupsService } from '../grouping/groups.service';
import { columnsSpan, columnsToRender } from '../helper/column-common';
import { RowClassFn } from '../row-class';
import { GroupRow } from '../row-column/group-row';
import { Row } from '../row-column/row';
import { SelectableSettings } from '../selection/selectable-settings';
import { ChangeNotificationService } from '../service/change-notification.service';
import { DetailsService } from '../service/details.service';
import { EditService } from '../service/edit.service';
import { DetailTemplateDirective } from '../table-shared/detail-template.directive';
import { isChanged } from '../utils';

@Component({
  selector: '[tri-grid-table-body], [triGridTableBody]',
  template: `

    <!--新元素-->
    <ng-template [ngIf]="editService.hasNewItem">
      <tr class="tri-data-table-add-row tri-data-table-edit-row tri-table-row">
        <ng-template [ngIf]="!skipGroupDecoration">
          <td [class.tri-group-cell]="true" *ngFor="let g of groups"></td>
        </ng-template>
        <td [class.tri-hierarchy-cell]="true"
            *ngIf="detailTemplate?.templateRef">
        </td>
        <td
          triGridCell
          [rowIndex]="-1"
          [isNew]="true"
          [column]="column"
          [dataItem]="newDataItem"
          [ngClass]="column.cssClass"
          [ngStyle]="column.style"
          [attr.colspan]="column.colspan"
          *ngFor="let column of columns; let columnIndex = index">
          <ng-template
            [ngTemplateOutlet]="column.templateRef"
            [ngTemplateOutletContext]="{
                        dataItem: newDataItem,
                        column: column,
                        columnIndex: columnIndex,
                        rowIndex: -1,
                        isNew: true,
                        $implicit: newDataItem | valueOf: column.field: column.format
                        }">
          </ng-template>
          <ng-template
            [ngIf]="isBoundColumn(column)">{{newDataItem | valueOf: column.field: column.format}}
          </ng-template>

        </td>
      </tr>
    </ng-template>

    <!--无数据-->
    <tr *ngIf="rowData?.length === 0 || rowData == null" class="tri-data-table-norecords">
      <td [attr.colspan]="colSpan">
        <ng-template [ngTemplateOutlet]="noRecordsTemplate?.templateRef">
        </ng-template>
        <!--<ng-template [ngIf]="!noRecordsTemplate?.templateRef">-->
        <!--{{noRecordsText}}-->
        <!--</ng-template>-->
      </td>
    </tr>

    <ng-template ngFor
                 [ngForOf]="rowData"
                 [ngForTrackBy]="trackByFn"
                 let-rowItem>

      <!--行分组头-->
      <tr *ngIf="isGroup(rowItem)"
          triGridGroupHeader
          [columns]="columns"
          [groups]="groups"
          [rowItem]="rowItem"
          [hasDetails]="!!detailTemplate?.templateRef"
          [skipGroupDecoration]="skipGroupDecoration">
      </tr>

      <!--行分组元素-->
      <tr
        *ngIf="isDataItem(rowItem)&&isVisible(rowItem)"
        [ngClass]="rowClass({ dataItem: rowItem.dataItem, index: rowItem.index })"
        [class.tri-alt]="isOdd(rowItem)"
        [class.tri-master-row]="detailTemplate?.templateRef"
        [class.tri-data-table-edit-row]="editService.isEdited(rowItem.index)"
        [triGridSelectable]="isSelectable()"
        [index]="rowItem.index">
        <ng-template [ngIf]="!skipGroupDecoration">
          <td [class.tri-group-cell]="true" *ngFor="let g of groups"></td>
        </ng-template>

        <!--首列-->
        <td [class.tri-hierarchy-cell]="true"
            *ngIf="detailTemplate?.templateRef">
          <i class="anticon"
             *ngIf="detailTemplate.showDetailButton"
             [ngClass]="detailButtonStyles(rowItem.index)"
             tabindex="-1" (click)="toggleRow(rowItem.index, rowItem.dataItem)"></i>
        </td>

        <!--非首列-->
        <td
          triGridCell
          [rowIndex]="rowItem.index"
          [column]="column"
          [dataItem]="rowItem.dataItem"
          [ngClass]="column.cssClass"
          [ngStyle]="column.style"
          [attr.colspan]="column.colspan"
          *ngFor="let column of columns; let columnIndex = index">
          <ng-template
            [ngTemplateOutlet]="column.templateRef"
            [ngTemplateOutletContext]="{
                        dataItem: rowItem.dataItem,
                        column: column,
                        columnIndex: lockedColumnsCount + columnIndex,
                        rowIndex: rowItem.index,
                        $implicit: rowItem.dataItem | valueOf: column.field: column.format
                        }">
          </ng-template>

          <ng-template [ngIf]="isCheckboxColumn(column)">
            <tri-checkbox [triGridSelectionCheckbox]="rowItem.index"></tri-checkbox>
          </ng-template>

          <ng-template [ngIf]="isSpanColumn(column)">
            <ng-template ngFor let-childColumn [ngForOf]="childColumns(column)">
              {{rowItem.dataItem | valueOf: childColumn.field: childColumn.format}}
            </ng-template>
          </ng-template>

          <ng-template [ngIf]="isHierarchyColumn(column)">
            <span
              [style.paddingLeft.px]="isHierarchyColumn(column)?rowItem.level*column.spanLevel:null">
              <i *ngIf="rowItem.hasChildren"
                 class="anticon"
                 style="cursor: pointer;user-select: none"
                 [class.anticon-caret-right]="rowItem.isCollapsed"
                 [class.anticon-caret-down]="!rowItem.isCollapsed"
                 (click)="$event.stopPropagation();toggleHierarchyRow(rowItem)"
              ></i>
              <i *ngIf="!rowItem.hasChildren" class="anticon" style="width: 12px; height: 12px"></i>
            </span>
          </ng-template>

          <ng-template
            [ngIf]="isBoundColumn(column)">{{rowItem.dataItem | valueOf: column.field: column.format}}</ng-template>
        </td>
      </tr>

      <!--行详情-->
      <tr *ngIf="isDataItem(rowItem) &&
                 isInExpandedGroup(rowItem) &&
                 detailTemplate?.templateRef &&
                 isDetailExpanded(rowItem.index)"
          [class.tri-detail-row]="true"
          [class.tri-alt]="isOdd(rowItem)">
        <td [class.tri-group-cell]="true" *ngFor="let g of groups"></td>
        <td [class.tri-hierarchy-cell]="true"></td>
        <td [class.tri-detail-cell]="true"
            [attr.colspan]="columnsSpan">
          <ng-template
            [ngTemplateOutlet]="detailTemplate?.templateRef"
            [ngTemplateOutletContext]="{
                        dataItem: rowItem.dataItem,
                        rowIndex: rowItem.index,
                        $implicit: rowItem.dataItem
            }">
          </ng-template>
        </td>
      </tr>
      <tr
        *ngIf="isFooter(rowItem) && (isInExpandedGroup(rowItem) || (showGroupFooters && isParentGroupExpanded(rowItem)))"
        [class.tri-group-footer]="true">
        <ng-template [ngIf]="!skipGroupDecoration">
          <td [class.tri-group-cell]="true" *ngFor="let g of groups"></td>
        </ng-template>
        <td [class.tri-hierarchy-cell]="true"
            *ngIf="detailTemplate?.templateRef">
        </td>
        <td
          *ngFor="let column of footerColumns;">
          <ng-template
            [ngTemplateOutlet]="column.groupFooterTemplateRef"
            [ngTemplateOutletContext]="{
                group: rowItem.dataItem,
                field: column.field,
                column: column,
                $implicit: rowItem.dataItem?.aggregates
            }">
          </ng-template>
        </td>
      </tr>
    </ng-template>
  `
})
export class TableBodyComponent implements OnChanges {
  detailsService: DetailsService;
  groupsService: GroupsService;
  editService: EditService;
  @Input() columns: Array<any | ColumnBase> | QueryList<any | ColumnBase>;
  @Input() groups: GroupDescriptor[];
  @Input() detailTemplate: DetailTemplateDirective;
  @Input() noRecordsTemplate: NoRecordsTemplateDirective;
  @Input() data: Array<GroupItem | Item | GroupFooterItem | any> | DataCollection<any>;
  @Input() rowData: Array<Row | GroupRow | any> | DataCollection<any>;
  @Input() skip: number;
  @Input() selectable: boolean | SelectableSettings;
  @Input() noRecordsText: string;
  @Input() skipGroupDecoration: boolean;
  @Input() showGroupFooters: boolean;
  @Input() lockedColumnsCount: number;
  @Input() rowClass: RowClassFn;
  private changeNotification;

  constructor(detailsService: DetailsService,
              groupsService: GroupsService,
              changeNotification: ChangeNotificationService,
              editService: EditService) {
    this.detailsService = detailsService;
    this.groupsService = groupsService;
    this.changeNotification = changeNotification;
    this.editService = editService;
    this.columns = [];
    this.groups = [];
    this.skip = 0;
    this.noRecordsText = '没有记录';
    this.skipGroupDecoration = false;
    this.showGroupFooters = false;
    this.lockedColumnsCount = 0;
    this.rowClass = () => null;
  }

  get newDataItem() {
    return this.editService.newDataItem;
  }

  get columnsSpan() {
    return columnsSpan(this.columns as Array<any>);
  }

  get colSpan() {
    return this.columnsSpan + this.groups.length + (isPresent(this.detailTemplate) ? 1 : 0);
  }

  get footerColumns(): ColumnBase[] | any[] {
    return columnsToRender(this.columns);
  }

  toggleRow(index: number, dataItem: any) {
    this.detailsService.toggleRow(index, dataItem);
    return false;
  }

  trackByFn(_: any, item: any) {
    return item.data ? item.data : item;
  }

  isDetailExpanded(index: number) {
    return this.detailsService.isExpanded(index);
  }

  detailButtonStyles(index: number) {
    const expanded = this.isDetailExpanded(index);
    return {'anticon-minus-square': expanded, 'anticon-plus-square': !expanded};
  }

  isGroup(item: any) {
    // return item.type === 'group';
    return item instanceof GroupRow;
  }

  isDataItem(item: any) {
    // return !this.isGroup(item) && !this.isFooter(item);
    return item instanceof Row && !(item instanceof GroupRow);
  }

  isVisible(item: Row | GroupRow) {
    return item.isVisible;
  }

  isFooter(item: any) {
    return item.type === 'footer';
  }

  isInExpandedGroup(item: any) {
    return this.groupsService.isInExpandedGroup(item.groupIndex, false);
  }

  isParentGroupExpanded(item: any) {
    return this.groupsService.isInExpandedGroup(item.index /*|| item.groupIndex*/);
  }

  isOdd(item: any) {
    return item.index % 2 === 0;
  }

  toggleHierarchyRow(item: Row | GroupRow) {
    item.isCollapsed = !item.isCollapsed;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (isChanged('columns', changes, false)) {
      this.changeNotification.notify();
    }
  }

  isSpanColumn(column: any) {
    return isSpanColumn(column) && !column.templateRef;
  }

  childColumns(column: any): Array<ColumnBase | any> {
    return columnsToRender([column]);
  }

  isBoundColumn(column: any) {
    return column.field && !column.templateRef;
  }

  isCheckboxColumn(column: any) {
    return isCheckboxColumn(column) && !column.templateRef;
  }

  isHierarchyColumn(column: any) {
    return isHierarchyColumn(column) && !column.templateRef;
  }

  isSelectable(): boolean {
    return this.selectable && (this.selectable as SelectableSettings).enabled !== false;
  }

  isSelectableSingle(): boolean {
    return this.isSelectable() && (this.selectable as SelectableSettings).mode === 'single';
  }

  isSelectableMultiple(): boolean {
    return this.isSelectable() && (this.selectable as SelectableSettings).mode === 'multiple';
  }
}
