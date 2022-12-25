/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { CdkOverlayOrigin, ConnectedPosition } from '@angular/cdk/overlay';
import { Component, HostBinding, Input } from '@angular/core';
import { POSITION_MAP_LTR } from '@gradii/triangle/core';
import { CompositeFilterDescriptor, FilterDescriptor } from '@gradii/triangle/data-query';
import { isNullOrEmptyString } from '@gradii/triangle/util';
import { ColumnComponent } from '../../columns/column.component';
import { extractFormat } from '../../utils';
import { BaseFilterCellComponent, filtersByField } from '../base-filter-cell.component';
import { FilterService } from '../filter.service';

@Component({
  selector           : 'tri-data-table-filter-menu',
  template           : `
    <a [ngClass]="{'tri-data-table-filter':true, 'tri-state-active': hasFilters}"
       (click)="toggle($event)"
       href="#"
       title="Filter">
      <i class="anticon anticon-filter"></i>
    </a>
    <ng-template
      cdkConnectedOverlay
      cdkConnectedOverlayHasBackdrop
      cdkConnectedOverlayBackdropClass="cdk-overlay-transparent-backdrop"
      [cdkConnectedOverlayOrigin]="origin"
      [cdkConnectedOverlayOpen]="_open"
      [cdkConnectedOverlayPositions]="_positions"
      (backdropClick)="closeMenu()"
      (detach)="closeMenu()">
      <tri-card class="tri-card-compact">
        <tri-data-table-filter-menu-container
          [column]="column"
          [filter]="filter"
          (close)="close()">
        </tri-data-table-filter-menu-container>
      </tri-card>
    </ng-template>
  `
})
export class FilterMenuComponent extends BaseFilterCellComponent {
  _open: boolean = false;
  _positions: ConnectedPosition[] = [
      POSITION_MAP_LTR['bottomLeft'],
      POSITION_MAP_LTR['bottomRight'],
      POSITION_MAP_LTR['topLeft'],
      POSITION_MAP_LTR['topRight'],
  ];

  @Input('columnOverlayOrigin') origin: CdkOverlayOrigin;
  @Input() column: ColumnComponent;
  @Input() filter: CompositeFilterDescriptor;

  constructor(protected filterService: FilterService) {
    super(filterService);
  }

  @HostBinding('class.tri-filtercell')
  get hostClasses(): boolean {
    return false;
  }

  get currentFilter(): FilterDescriptor {
    return this.filterByField(this.column.field);
  }

  get columnFormat() {
    return this.column && !isNullOrEmptyString(this.column.format) ? extractFormat(this.column.format) : 'd';
  }

  get hasFilters(): boolean {
    return filtersByField(this.filter, this.column!.field).length > 0;
  }

  toggle(e: Event) {
    e.preventDefault();
    this._open = !this._open;
  }

  close(): void {
    // this.popupService.destroy();
    this._open = false;
  }

  closeMenu() {
    this._open = false;
  }
}
