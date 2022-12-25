/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { animate, style, transition, trigger } from '@angular/animations';
import { ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, OnInit, TemplateRef, TrackByFunction } from '@angular/core';
import { isPresent } from '@gradii/nanofn';
import { getter } from '@gradii/nanofn';
import { catchError, EMPTY, filter, finalize, Observable, Subscription, tap } from 'rxjs';
import { DataChangeNotificationService } from './data-change-notification.service';
import { TreeViewNode } from './data-source/tree-view.data-source.node';
import { ExpandStateService } from './expand-state.service';
import { IndexBuilderService } from './index-builder.service';
import { LoadMoreStrategy } from './load-more/load-more-strategy';
import { LoadingNotificationService } from './loading-notification.service';
import { NavigationService } from './navigation/navigation.service';
import { NodeChildrenService } from './node-children.service';
import { TreeViewSize } from './size';
import { TreeItem } from './tree-item.interface';
import { TreeViewLookupService } from './tree-view-lookup.service';
import { isArray } from './utils';

@Component({
  selector  : '[triTreeViewGroup]',
  template  : `
    <ng-template ngFor let-node [ngForOf]="data" let-index="index" [ngForTrackBy]="trackBy">
      <li
        *ngIf="node.isVisible"
        class="tri-tree-view-item"
        triTreeViewItem
        [attr.aria-setsize]="totalNodesCount"
        [node]="node"
        [uid]="node.uid"
        [index]="nodeIndex(index)"
        [parentNode]="parentNode"
        [parentUid]="parentUid"
        [loadOnDemand]="loadOnDemand"
        [checkable]="checkable"
        [isChecked]="node.checkState"
        [isDisabled]="disabled || node.isDisabled"
        [expandable]="expandable && node.hasChildren"
        [isExpanded]="node.isExpanded"
        [selectable]="selectable"
        [isSelected]="node.isSelected"
        [attr.data-treeuid]="node.uid"
      >
        <div class="tri-tree-view-mid">
          <span
            class="tri-tree-view-toggle"
            [triTreeViewLoading]="node.uid"
            (click)="expandNode(node, !node.isExpanded)"
            *ngIf="expandable && node.hasChildren"
          >
            <tri-icon class="tri-icon" [svgIcon]="
            !node.isExpanded ?
             'fill:caret-right' : 'fill:caret-down'">
            </tri-icon>
          </span>
          <tri-checkbox
            *ngIf="checkable"
            [indeterminate]="node.isIndeterminate"
            [checked]="node.isChecked"
            (checkedChange)="node.toggleCheckNode(nodeIndex(index))"
            [attr.tabindex]="-1"
          ></tri-checkbox>
          <span triTreeViewItemContent
                [attr.data-treeindex]="nodeIndex(index)"
                [node]="node"
                [uid]="node.uid"
                [initialSelection]="node.isSelected"
                [isSelected]="node.isSelectedFn"
                class="tri-tree-view-leaf"
                [style.touch-action]="touchActions ? '' : 'none'"
                (selectedNode)="node.selectNode()"
          >
            <span class="tri-tree-view-leaf-text">
              <ng-container [ngSwitch]="hasTemplate">
                <ng-container *ngSwitchCase="true">
                  <ng-template
                    [ngTemplateOutlet]="nodeTemplateRef"
                    [ngTemplateOutletContext]="{
                      $implicit: node,
                      index: nodeIndex(index)
                    }"
                  >
                  </ng-template>
                </ng-container>
                <ng-container *ngSwitchDefault>
                  {{nodeText(node)}}
                </ng-container>
              </ng-container>
            </span>
          </span>
        </div>
        <ul
          *ngIf="node.isExpanded && node.hasChildren"
          triTreeViewGroup
          role="group"
          [fetchChildNodes]="fetchChildren"
          [loadOnDemand]="loadOnDemand"
          [checkable]="checkable"
          [expandable]="expandable"
          [selectable]="selectable"
          [touchActions]="touchActions"
          [dataSource]="dataSource"
          [disabled]="disabled || node.isDisabled"
          [nodeTemplateRef]="nodeTemplateRef"
          [loadMoreButtonTemplateRef]="loadMoreButtonTemplateRef"
          [parentUid]="node.uid"
          [parentNode]="node"
          [textField]="nextFields"
          [loadMoreService]="loadMoreService"
          [@toggle]="true"
          [trackBy]="trackBy"
        >
        </ul>
      </li>
    </ng-template>
    <li
      *ngIf="initialNodesLoaded && moreNodesAvailable"
      class="tri-tree-view-item"
      [class.tri-tree-view-load-more-checkboxes-container]="checkable"
      triTreeViewItem
      role="button"
      [selectable]="false"
      [checkable]="false"
      [expandable]="false"
      uid="_LOAD_MORE_loadMoreButtonIndex"
      [parentNode]="parentNode"
      [parentUid]="parentUid"
      [attr.data-treeindex]="loadMoreButtonIndex"
    >
      <div class="tri-tree-view-mid">
        <span
          *ngIf="loadingMoreNodes"
          class="tri-icon tri-i-loading tri-i-expand"
        >
        </span>
        <span
          class="tri-tree-view-leaf tri-tree-view-load-more-button"
          [attr.data-treeuid]="loadMoreButtonIndex"
          triTreeViewItemContent
        >
          <span class="tri-tree-view-leaf-text">
            <ng-template
              *ngIf="loadMoreButtonTemplateRef"
              [ngTemplateOutlet]="loadMoreButtonTemplateRef"
              [ngTemplateOutletContext]="{
                index: loadMoreButtonIndex
              }"
            >
            </ng-template>
            <ng-container *ngIf="!loadMoreButtonTemplateRef">
                Load more
            </ng-container>
          </span>
        </span>
      </div>
    </li>
  `,
  animations: [
    trigger('toggle', [
      transition('void => *', [
        style({height: 0}),
        animate('0.1s ease-in', style({height: '*'}))
      ]),
      transition('* => void', [
        style({height: '*'}),
        animate('0.1s ease-in', style({height: 0}))
      ])
    ])
  ],
  host      : {
    '[class.tri-tree-view-group]': 'kGroupClass',
    '[attr.role]'                : 'role',
  }
})
export class TreeViewGroupComponent implements OnChanges, OnInit, OnDestroy {
  kGroupClass: boolean;
  role: string;

  @Input()
  checkable: boolean;

  @Input()
  expandable: boolean;

  @Input()
  disabled: boolean;

  @Input()
  selectable: boolean;

  @Input()
  touchActions: boolean;

  @Input()
  loadOnDemand: boolean;

  @Input()
  trackBy: TrackByFunction<TreeViewNode>;

  @Input()
  dataSource: any;

  @Input()
  fetchChildNodes: (node: any, uid: string) => Observable<any[]>;

  @Input()
  textField: string | string[];

  @Input()
  parentNode: TreeViewNode;

  @Input()
  parentUid: string;

  /**
   * @deprecated
   */
  @Input()
  parentIndex: string;

  @Input()
  nodeTemplateRef: TemplateRef<any>;

  @Input()
  loadMoreButtonTemplateRef: TemplateRef<any>;

  @Input()
  loadMoreService: LoadMoreStrategy;

  @Input()
  size: TreeViewSize;

  initialNodesLoaded: boolean;
  loadingMoreNodes: boolean;
  nodesSubscription: any;
  loadMoreNodesSubscription: any;
  singleRecordSubscriptions: any;

  /**
   * @deprecated removeme
   * todo use treeModel children
   */
  get children(): (item: any) => Observable<any[]> {
    return this.dataSource.children;
  }

  /**
   * @deprecated removeme
   * todo use treeModel hasChildren
   */
  get hasChildren(): (item: any) => boolean {
    return this.dataSource?.hasChildren;
  }

  constructor(protected expandService: ExpandStateService,
              protected loadingService: LoadingNotificationService,
              public indexBuilder: IndexBuilderService,
              public treeViewLookupService: TreeViewLookupService,
              public navigationService: NavigationService,
              public nodeChildrenService: NodeChildrenService,
              public dataChangeNotification: DataChangeNotificationService,
              public changeDetectorRef: ChangeDetectorRef) {
    this.kGroupClass               = true;
    this.role                      = 'group';
    this.loadOnDemand              = true;
    this.textField                 = '';
    this.size                      = 'medium';
    this.initialNodesLoaded        = false;
    this.loadingMoreNodes          = false;
    this._data                     = [];
    this.singleRecordSubscriptions = new Subscription();
  }

  _data: TreeViewNode[];

  get data(): TreeViewNode[] {
    if (isPresent(this.pageSize)) {
      const normalizedSizeValue = this.pageSize > 0 ? this.pageSize : 0;
      return this._data.slice(0, normalizedSizeValue);
    }
    return this._data;
  }

  set data(data: TreeViewNode[]) {
    this._data = data;
    this.registerLoadedNodes(this.data);
  }

  get moreNodesAvailable(): boolean {
    if (!isPresent(this.loadMoreService) || this.data.length === 0) {
      return false;
    }
    return this.pageSize < this.totalNodesCount;
  }

  get pageSize(): number {
    if (!isPresent(this.loadMoreService)) {
      return null;
    }
    return this.loadMoreService.getGroupSize(this.parentNode);
  }

  set pageSize(pageSize: number) {
    this.loadMoreService.setGroupSize(this.parentNode, pageSize);
  }

  get loadMoreButtonIndex(): string {
    if (!this.loadMoreService) {
      return null;
    }
    return this.nodeIndex(this.data.length);
  }

  /**
   * Represents the total number of nodes for the current level.
   */
  get totalNodesCount(): number {
    if (!this.loadMoreService) {
      return this.data.length;
    }
    return this.loadMoreService.getTotalNodesCount(this.parentNode, this._data.length);
  }

  get hasTemplate(): boolean {
    return isPresent(this.nodeTemplateRef);
  }

  get nextFields(): string[] {
    if (isArray(this.textField)) {
      return this.textField.length > 1 ? (this.textField as string[]).slice(1) : this.textField as string[];
    }
    return [this.textField as string];
  }

  expandNode(node: TreeViewNode, expand: boolean) {
    node.expandNode(expand);
    if (expand) {
      this.expandService.expand(node);
    } else {
      this.expandService.collapse(node);
    }
  }

  /**
   * todo: removeme
   * @param index
   */
  checkNode(index: string) {
    this.navigationService.checkUid(index);
    this.navigationService.activateUid(index);
  }

  /**
   * @deprecated
   * @param index
   */
  nodeIndex(index: number): string {
    return this.indexBuilder.nodeIndex(index.toString(), this.parentUid);
  }

  nodeText(dataItem: any) {
    const textField: string = isArray(this.textField) ? this.textField[0] : this.textField as string;
    return getter(dataItem, textField);
  }

  ngOnDestroy() {
    if (isPresent(this.nodesSubscription)) {
      this.nodesSubscription.unsubscribe();
    }
    if (isPresent(this.loadMoreNodesSubscription)) {
      this.loadMoreNodesSubscription.unsubscribe();
    }
    this.singleRecordSubscriptions.unsubscribe();
  }

  ngOnInit() {
    this.subscribeToNodesChange();
    this.singleRecordSubscriptions.add(
      this.dataChangeNotification
        .changes
        .subscribe(this.subscribeToNodesChange.bind(this))
    );
    this.singleRecordSubscriptions.add(
      this.navigationService.loadMore
        .pipe(filter(index => index === this.loadMoreButtonIndex))
        .subscribe(this.loadMoreNodes.bind(this)));
  }

  ngOnChanges(changes: any) {
    if (changes.parentUid && this.loadOnDemand) {
      this.setNodeChildren(this.mapToTreeItem(this.data));
    }
  }

  /**
   *
   * @param node
   * @param uid
   */
  fetchChildren(node: TreeViewNode, uid?: string) {
    return node.fetchChildren().pipe(catchError(() => {
      this.loadingService.notifyLoaded(node.uid);
      return EMPTY;
    }), tap(() => this.loadingService.notifyLoaded(node.uid)));
  }

  loadMoreNodes() {
    if (isPresent(this.loadMoreService.loadMoreNodes)) {
      this.fetchMoreNodes();
    } else {
      this.loadMoreLocalNodes();
    }
  }

  loadMoreLocalNodes(): any {
    const initialLoadMoreButtonIndex = this.loadMoreButtonIndex;
    this.pageSize += this.loadMoreService.getInitialPageSize(this.parentNode);
    this.registerLoadedNodes(this.data);
    // forces the new items to be registered before the focus is changed
    this.changeDetectorRef.detectChanges();
    this.reselectItemAt(initialLoadMoreButtonIndex);
  }

  fetchMoreNodes(): any {
    if (this.loadingMoreNodes) {
      return;
    }
    this.loadingMoreNodes = true;
    if (isPresent(this.loadMoreNodesSubscription)) {
      this.loadMoreNodesSubscription.unsubscribe();
    }
    this.loadMoreNodesSubscription = this.loadMoreService
      .loadMoreNodes({
        dataItem: this.parentNode,
        skip    : this.data.length,
        take    : this.loadMoreService.getInitialPageSize(this.parentNode)
      })
      .pipe(finalize(() => this.loadingMoreNodes = false))
      .subscribe(items => {
        if (!(Array.isArray(items) && items.length > 0)) {
          return;
        }
        const initialLoadMoreButtonIndex = this.loadMoreButtonIndex;
        this.pageSize += items.length;
        this.data                        = this.data.concat(items);
        if (this.navigationService.isActive(initialLoadMoreButtonIndex)) {
          // forces the new items to be registered before the focus is changed
          this.changeDetectorRef.detectChanges();
          this.reselectItemAt(initialLoadMoreButtonIndex);
        }
      });
  }

  setNodeChildren(children): any {
    this.treeViewLookupService.registerChildren(this.parentUid, children);
  }

  mapToTreeItem(data: TreeViewNode[]): TreeItem[] {
    if (!this.parentUid) {
      return [];
    }
    return data.map((node, index) => ({node: node, uid: node.uid}));
  }

  emitChildrenLoaded(children): any {
    if (!this.parentUid) {
      return;
    }
    // ignores the registered load-more button
    const contentChildren = children.filter(item => item.dataItem);
    this.nodeChildrenService.childrenLoaded({
      node: this.parentNode,
      uid : this.parentUid
    }, contentChildren);
  }

  subscribeToNodesChange(): any {
    if (this.nodesSubscription) {
      this.nodesSubscription.unsubscribe();
    }
    this.nodesSubscription = this.fetchChildNodes(this.parentNode, this.parentUid)
      .subscribe(data => {
        this.data               = data;
        this.initialNodesLoaded = true;
      });
  }

  reselectItemAt(index): any {
    if (!isPresent(index)) {
      return;
    }
    // make sure the old index is cleared first
    this.navigationService.deactivate();
    this.navigationService.activateUid(index);
  }

  registerLoadedNodes(nodes = []): any {
    const mappedChildren = this.mapToTreeItem(nodes);
    if (this.loadOnDemand) {
      this.setNodeChildren(mappedChildren);
    }
    this.emitChildrenLoaded(mappedChildren);
  }
}
