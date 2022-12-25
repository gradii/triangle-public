/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostBinding,
  Input,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  ViewChildren
} from '@angular/core';
import { GroupDescriptor } from '@gradii/triangle/data-query';
import { I18nService } from '@gradii/triangle/i18n';
import { isNullOrEmptyString } from '@gradii/triangle/util';
import { from, merge, Subscription } from 'rxjs';
import { filter, switchMapTo, takeUntil, tap } from 'rxjs/operators';
import { isTargetBefore, position } from '../dragdrop/common';
import { DragAndDropContext } from '../dragdrop/context-types';
import { DragHintService } from '../dragdrop/drag-hint.service';
import { DropCueService } from '../dragdrop/drop-cue.service';

import { DropTargetDirective } from '../dragdrop/drop-target.directive';

import { and, Condition, observe, or } from '../utils';

import { GroupInfoService } from './group-info.service';

type DropCondition = Condition<{
  field: string;
  groups: GroupDescriptor[];
  target: DragAndDropContext;
}>;

const withoutField: DropCondition = ({field}) => isNullOrEmptyString(field);
const alreadyGrouped: DropCondition = ({groups, field}) => groups.some(group => group.field === field);
const overSameTarget: DropCondition = ({target, field}) => target.field === field;
const overLastTarget: DropCondition = ({target}) => target.lastTarget;
const isLastGroup: DropCondition = ({groups, field}) =>
  groups.map(group => group.field).indexOf(field) === groups.length - 1;

const isNotGroupable = (groupsService: GroupInfoService) => ({field}) => !groupsService.isGroupable(field);

const columnRules = (groupService: GroupInfoService) => or(
  withoutField,
  alreadyGrouped,
  isNotGroupable(groupService)
);

const indicatorRules = or(
  overSameTarget,
  and(
    overLastTarget,
    isLastGroup
  )
);

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector       : 'tri-data-table-group-panel',
  template       : `
    <ng-template [ngIf]="groups.length === 0">
      <div
        class="tri-indicator-container"
        [context]="{
            type: 'groupIndicator',
            lastTarget: true
        }"
        triDropTarget>
        {{ text }}
      </div>
    </ng-template>
    <div *ngFor="let group of groups"
         class="tri-indicator-container"
         [context]="{
            type: 'columnGroup',
            field: group.field
         }"
         triDropTarget>
      <div
        [triDraggableColumn]="true"
        [context]="{
                    field: group.field,
                    type: 'groupIndicator',
                    hint:  groupInfoService.groupTitle(group)
                }"
        triGroupIndicator
        triGridDraggable
        [group]="group"
        (directionChange)="directionChange($event)"
        (remove)="remove($event)">
      </div>
    </div>
    <div class="tri-indicator-container"
         *ngIf="groups.length !== 0"
         [context]="{
                type: 'groupIndicator',
                lastTarget: true
            }"
         triDropTarget>&nbsp;
    </div>
  `
})
export class GroupPanelComponent implements OnDestroy, OnInit {

  @Output() change: EventEmitter<GroupDescriptor[]> = new EventEmitter<GroupDescriptor[]>();
  @Input() groups: GroupDescriptor[] = [];
  @ViewChildren(DropTargetDirective) dropTargets: QueryList<DropTargetDirective> = new QueryList<DropTargetDirective>();
  private emptyText: string;
  private subscription: Subscription = new Subscription();
  private targetSubscription: Subscription;

  constructor(
    private hint: DragHintService,
    private cue: DropCueService,
    public groupInfoService: GroupInfoService,
    private localization: I18nService,
    private cd: ChangeDetectorRef
  ) {
  }

  @HostBinding('class.tri-grouping-header')
  @HostBinding('class.tri-grouping-header-flex')
  get groupHeaderClass(): boolean {
    return true;
  }

  get text(): string {
    return this.emptyText ? this.emptyText : this.localization.translate('groupPanelEmpty');
  }

  @Input()
  set text(value: string) {
    this.emptyText = value;
  }

  ngAfterViewInit(): void {
    this.subscription.add(
      observe(this.dropTargets)
        .subscribe(this.attachTargets.bind(this))
    );
  }

  ngOnInit(): void {
    this.subscription.add(
      this.localization.localeChange.subscribe(() => this.cd.markForCheck())
    );
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    if (this.targetSubscription) {
      this.targetSubscription.unsubscribe();
    }
  }

  directionChange(group: GroupDescriptor): void {
    const index = this.groups.findIndex(x => x.field === group.field);
    const groups = [...this.groups.slice(0, index), group, ...this.groups.slice(index + 1)];

    this.change.emit(groups);
  }

  insert(field: string, index: number): void {
    const groups = this.groups.filter(x => x.field !== field);

    if (groups.length || this.groups.length === 0) {
      this.change.emit([...groups.slice(0, index), {field: field}, ...groups.slice(index)]);
    }
  }

  remove(group: GroupDescriptor): void {
    this.change.emit(this.groups.filter(x => x.field !== group.field));
  }

  canDrop(draggable: DragAndDropContext, target: DragAndDropContext): boolean {
    const isIndicator = draggable.type === 'groupIndicator';
    const rules = isIndicator
      ? indicatorRules
      : columnRules(this.groupInfoService);

    return !rules({
      field : draggable.field,
      groups: this.groups,
      target
    });
  }

  private attachTargets(): void {
    if (this.targetSubscription) {
      this.targetSubscription.unsubscribe();
    }

    this.targetSubscription = new Subscription();

    const enterStream = this.dropTargets
      .reduce((acc, target) => merge(acc, target.enter), from([]));

    const leaveStream = this.dropTargets
      .reduce((acc, target) => merge(acc, target.leave), from([]));

    const dropStream = this.dropTargets
      .reduce((acc, target) => merge(acc, target.drop), from([]));

    this.targetSubscription.add(
      enterStream.pipe(
        tap(_ => this.hint.removeLock()),
        filter(({draggable, target}) => this.canDrop(draggable.context, target.context)),
        tap(this.enter.bind(this)),
        switchMapTo(
          dropStream.pipe(takeUntil(leaveStream.pipe(tap(this.leave.bind(this)))))
        )
      ).subscribe(this.drop.bind(this))
    );
  }

  private enter({draggable, target}: any): void {
    this.hint.enable();

    const before = target.context.lastTarget || isTargetBefore(
      draggable.element.nativeElement,
      target.element.nativeElement
    );

    this.cue.position(position(target.element.nativeElement, before));
  }

  private leave(): void {
    this.hint.disable();
    this.cue.hide();
  }

  private drop({target, draggable}: any): void {
    const field = draggable.context.field;
    const index = this.dropTargets.toArray().indexOf(target);

    this.insert(field, index);
  }
}
