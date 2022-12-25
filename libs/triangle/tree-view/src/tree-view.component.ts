/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Directionality } from '@angular/cdk/bidi';
import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';
import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component, ContentChild, ElementRef, EventEmitter, forwardRef, Input, isDevMode,
  NgZone, OnChanges, OnDestroy, OnInit, Output, Renderer2, SimpleChanges, TrackByFunction, ViewChild, ViewContainerRef,
  ViewEncapsulation
} from '@angular/core';
import { isPresent } from '@gradii/nanofn';
import { BehaviorSubject, EMPTY, fromEvent, merge, Subscription, tap } from 'rxjs';
import { DataBoundComponent } from './data-bound-component';
import { DataChangeNotificationService } from './data-change-notification.service';
import { TreeViewCheckEvent } from './data-source/tree-view-check-model';
import { TreeViewExpandEvent } from './data-source/tree-view-expand-model';
import { TreeViewSelectEvent } from './data-source/tree-view-selectable-model';
import { TreeViewBaseControl } from './data-source/tree-view.base-control';
import { TreeViewDataSource } from './data-source/tree-view.data-source';
import { TreeViewNode } from './data-source/tree-view.data-source.node';
import { trackBy } from './default-callbacks';
import {
  EditService, TreeItemAddRemoveArgs, TreeItemDragEvent, TreeItemDragStartEvent, TreeItemDropEvent
} from './drag-and-drop/models';
import { ExpandStateService } from './expand-state.service';
import { ExpandableComponent } from './expandable-component';
import { FilterState } from './filter-state.interface';
import { isObserved } from './helper/is-observed';
import { IndexBuilderService } from './index-builder.service';
import { LoadMoreButtonTemplateDirective } from './load-more/load-more-button-template.directive';
import { LoadMoreStrategy } from './load-more/load-more-strategy';
import { LoadingNotificationService } from './loading-notification.service';
import { NavigationService } from './navigation/navigation.service';
import { NodeChildrenService } from './node-children.service';
import { NodeClickEvent } from './node-click-event.interface';
import { NodeTemplateDirective } from './node-template.directive';
import { SelectionMode } from './selection/selection-mode';
import { SelectionService } from './selection/selection.service';
import { TreeViewSize } from './size';
import { TreeItemLookup } from './tree-item-lookup.interface';
import { TreeItem } from './tree-item.interface';
import { TreeViewLookupService } from './tree-view-lookup.service';
import {
  buildTreeItem, closestNode, focusableNode, getSizeClass, hasParent, isContent, isFocusable, isLoadMoreButton, match, nodeId,
  nodeIndex
} from './utils';


/* tslint:disable:member-ordering */
@Component({
  selector       : 'tri-tree-view',
  exportAs       : 'triTreeView',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.Default,
  template       : `
    <span
      class="tri-tree-view-filter"
      *ngIf="filterable"
    >
      <tri-input-group>
        <input triInput
               [size]="size"
               [value]="filter"
               ngModel
               (ngModelChange)="onFilterChange($event)"
               [placeholder]="filterInputPlaceholder"/>
          <tri-icon *triInputGroupPrefix svgIcon="outline:search"></tri-icon>
      </tri-input-group>
    </span>
    <ul class="tri-tree-view-lines"
        triTreeViewGroup
        role="group"
        [size]="size"
        [loadOnDemand]="loadOnDemand"
        [checkable]="checkable"
        [expandable]="expandable"
        [selectable]="selectable"
        [touchActions]="touchActions"
        [nodeTemplateRef]="nodeTemplateRef?.templateRef"
        [loadMoreButtonTemplateRef]="loadMoreButtonTemplateRef?.templateRef"
        [textField]="textField"
        [dataSource]="dataSource"
        [fetchChildNodes]="fetchNodes"
        [loadMoreService]="loadMoreStrategy"
        [trackBy]="trackBy"
    >
    </ul>
    <ng-container #assetsContainer></ng-container>
  `,
  providers      : [
    ExpandStateService,
    IndexBuilderService,
    TreeViewLookupService,
    LoadingNotificationService,
    NodeChildrenService,
    NavigationService,
    SelectionService,
    DataChangeNotificationService,
    // LocalizationService,
    // {
    //   provide : L10N_PREFIX,
    //   useValue: 'kendo.tree-view'
    // },
    {
      provide    : DataBoundComponent,
      useExisting: forwardRef(() => TreeViewComponent)
    },
    {
      provide    : ExpandableComponent,
      useExisting: forwardRef(() => TreeViewComponent)
    }
  ],
  styleUrls      : ['../style/tree-view.scss'],
  host           : {
    '[class.tri-tree-view]': 'classNames',
    '[attr.role]'          : 'role',
    '[attr.dir]'           : 'direction',
    '[@.disabled]'         : 'animate'
  }
})
export class TreeViewComponent implements OnChanges, OnInit, OnDestroy, DataBoundComponent {
  viewChanges = new BehaviorSubject({
    start: 0,
    end  : Number.POSITIVE_INFINITY
  });

  // treeViewDataSourceModel: TreeViewDataSourceModel = new TreeViewDataSourceModel();

  fetchNodes = () => {
    if (this._dataSource) {
      return this._dataSource.connect(this.viewChanges/* this.treeViewDataSourceModel*/).pipe(
        tap((nodes) => {
          this.registerLookupItems(nodes);
        })
      );
    } else {
      return EMPTY;
    }
  };

  @ViewChild('assetsContainer', {read: ViewContainerRef, static: true})
  assetsContainer: ViewContainerRef;

  @ContentChild(NodeTemplateDirective, {static: false})
  nodeTemplateQuery: NodeTemplateDirective;

  @ContentChild(LoadMoreButtonTemplateDirective, {static: false})
  loadMoreButtonTemplateQuery: LoadMoreButtonTemplateDirective;

  @Input()
  treeControl: TreeViewBaseControl;

  @Input()
  textField: string;

  /**
   * The hint which is displayed when the component is empty.
   */
  @Input()
  filterInputPlaceholder = '';
  /** @hidden */
  // this.fetchNodes = () => this._dataSource;

  /**
   * Fires when the children of the expanded node are loaded.
   */
  @Output()
  childrenLoaded: EventEmitter<{ children: TreeItem[]; item: TreeItem; }> = new EventEmitter();

  /**
   * Fires when the user blurs the component.
   */
  @Output('blur')
  onBlur = new EventEmitter();

  /**
   * Fires when the user focuses the component.
   */
  @Output('focus')
  onFocus = new EventEmitter();

  /**
   * Fires when the user expands a TreeView node.
   */
  @Output()
  expand: EventEmitter<TreeItem> = new EventEmitter();

  /**
   * Fires when the user collapses a TreeView node.
   */
  @Output()
  collapse: EventEmitter<TreeItem> = new EventEmitter();

  /**
   * Fires just before the dragging of the node starts ([see example]({% slug draganddrop_tree-view %}#toc-setup)). This event is preventable.
   * If you prevent the event default, no drag hint will be created and the subsequent drag-related events will not be fired.
   */
  @Output()
  nodeDragStart: EventEmitter<TreeItemDragStartEvent> = new EventEmitter();

  /**
   * Fires when an item is being dragged ([see example]({% slug draganddrop_tree-view %}#toc-setup)).
   */
  @Output()
  nodeDrag: EventEmitter<TreeItemDragEvent> = new EventEmitter();

  /**
   * Emits when the built-in filtering mechanism in the data-binding directives updates the node's visibility.
   * Used for the built-in auto-expand functionalities of the component and available for custom implementations.
   */
  @Output()
  filterStateChange: EventEmitter<FilterState> = new EventEmitter();

  /**
   * Fires on the target TreeView when a dragged item is dropped ([see example]({% slug draganddrop_tree-view %}#toc-setup)).
   * This event is preventable. If you prevent the event default (`event.preventDefualt()`) or invalidate its state (`event.setValid(false)`),
   * the `addItem` and `removeItem` events will not be triggered.
   *
   * Both operations cancel the default drop operation, but the indication to the user is different. `event.setValid(false)` indicates that the operation was
   * unsuccessful by animating the drag clue to its original position. `event.preventDefault()` simply removes the clue, as if it has been dropped successfully.
   * As a general rule, use `preventDefault` to manually handle the add and remove operations, and `setValid(false)` to indicate the operation was unsuccessful.
   */
  @Output()
  nodeDrop: EventEmitter<TreeItemDropEvent> = new EventEmitter();

  /**
   * Fires on the source TreeView after the dragged item has been dropped ([see example]({% slug draganddrop_tree-view %}#toc-setup)).
   */
  @Output()
  nodeDragEnd: EventEmitter<TreeItemDragEvent> = new EventEmitter();

  /**
   * Fires after a dragged item is dropped ([see example]({% slug draganddrop_tree-view %}#toc-setup)).
   * Called on the TreeView where the item is dropped.
   */
  @Output()
  addItem: EventEmitter<TreeItemAddRemoveArgs> = new EventEmitter();

  /**
   * Fires after a dragged item is dropped ([see example]({% slug draganddrop_tree-view %}#toc-setup)).
   * Called on the TreeView from where the item is dragged.
   */
  @Output()
  removeItem: EventEmitter<TreeItemAddRemoveArgs> = new EventEmitter();

  @Output()
  expandedKeysChange: EventEmitter<string[]> = new EventEmitter();

  /**
   * Fires when the user selects a TreeView node checkbox
   */
  @Output()
  checkedChange: EventEmitter<TreeItemLookup> = new EventEmitter();

  /**
   * Fires all selected keys when the user selects a TreeView node
   */
  @Output()
  checkedKeysChange: EventEmitter<string[]> = new EventEmitter();

  /**
   * Fires when the user selects a TreeView node
   */
  @Output()
  selectionChange: EventEmitter<TreeItem> = new EventEmitter();

  /**
   * Fires all selected keys when the user selects a TreeView node
   */
  @Output()
  selectedKeysChange: EventEmitter<string[]> = new EventEmitter();

  /**
   * Fires when the value of the built-in filter input element changes.
   */
  @Output()
  filterChange: EventEmitter<string> = new EventEmitter();

  /**
   * Fires when the user clicks a TreeView node.
   */
  @Output()
  nodeClick: EventEmitter<NodeClickEvent> = new EventEmitter();

  /**
   * Fires when the user double clicks a TreeView node.
   */
  @Output()
  nodeDblClick: EventEmitter<NodeClickEvent> = new EventEmitter();

  /**
   * A function that defines how to track node changes.
   * By default, the TreeView tracks the nodes by data item object reference.
   *
   * @example
   * ```ts
   *  @Component({
   *      selector: 'my-app',
   *      template: `
   *          <tri-tree-view
   *              [nodes]="data"
   *              textField="text"
   *              [trackBy]="trackBy"
   *          >
   *          </tri-tree-view>
   *      `
   *  })
   *  export class AppComponent {
   *      public data: any[] = [
   *          { text: "Furniture" },
   *          { text: "Decor" }
   *      ];
   *
   *      public trackBy(index: number, item: any): any {
   *          return item.text;
   *      }
   *  }
   * ```
   */
  @Input()
  trackBy: TrackByFunction<object> = trackBy;

  // /**
  //  * A function which determines if a specific node is disabled.
  //  */
  // @Input()
  // isDisabled: (item: object, index: string) => boolean = isDisabled;
  //
  // /**
  //  * A callback which determines whether a TreeView node should be rendered as hidden. The utility .k-display-none class is used to hide the nodes.
  //  * Useful for custom filtering implementations.
  //  */
  // @Input()
  // isVisible: (item: object, index: string) => boolean = isVisible;


  /**
   * Determines whether the TreeView keyboard navigable is enabled.
   */
  @Input()
  navigable: boolean = true;

  /**
   * Indicates whether the child nodes will be fetched on node expand or will be initially prefetched.
   */
  @Input()
  loadOnDemand: boolean = true;

  @Input()
  filterable: boolean = false;

  /**
   * Sets an initial value of the built-in input element used for filtering.
   */
  @Input()
  filter: string = '';

  touchActions = true;
  isActive     = false;
  // this._dataSource      = new BehaviorSubject([]);

  subscriptions = new Subscription();
  checkOnClickSubscription: Subscription;
  hostDomSubscriptions: Subscription;

  loadMoreStrategy: LoadMoreStrategy;
  editService: EditService;

  _dataSource: TreeViewDataSource;


  // localization: any;
  classNames: boolean = true;
  role: string        = 'tree';

  constructor(public element: ElementRef<HTMLElement>,
              public changeDetectorRef: ChangeDetectorRef,
              public expandService: ExpandStateService,
              public navigationService: NavigationService,
              public nodeChildrenService: NodeChildrenService,
              public selectionService: SelectionService,
              public treeViewLookupService: TreeViewLookupService,
              public ngZone: NgZone,
              public renderer: Renderer2,
              public dataChangeNotification: DataChangeNotificationService,
              protected directionality: Directionality
              /*localization: LocalizationService*/) {

  }

  _animate = true;

  /**
   * Determines whether the content animation is enabled.
   */
  @Input()
  get animate(): boolean {
    return this._animate;
  }

  set animate(value: boolean) {
    this._animate = coerceBooleanProperty(value);
  }

  static ngAcceptInputType_expandable: BooleanInput;
  _expandable = true;

  @Input()
  get expandable(): boolean {
    return this._expandable;
  }

  set expandable(value: boolean) {
    this._expandable = coerceBooleanProperty(value);
  }

  @Input()
  expandedBy: string;

  @Input()
  expandedKeys: any[];

  static ngAcceptInputType_checkable: BooleanInput;
  private _checkable: boolean = false;

  @Input()
  get checkable(): boolean {
    return this._checkable;
  }

  set checkable(value: boolean) {
    this._checkable = coerceBooleanProperty(value);
  }

  @Input()
  checkParents: boolean = false;

  @Input()
  checkChildren: boolean = false;

  static ngAcceptInputType_checkOnClick: BooleanInput;
  private _checkOnClick: boolean = true;

  @Input()
  get checkOnClick(): boolean {
    return this._checkOnClick;
  }

  set checkOnClick(value: boolean) {
    this._checkOnClick = coerceBooleanProperty(value);
  }

  static ngAcceptInputType_selectable: BooleanInput;
  private _selectable: boolean = false;

  @Input()
  get selectable(): boolean {
    return this._selectable;
  }

  set selectable(value: boolean) {
    this._selectable = coerceBooleanProperty(value);
  }

  private _selectMode: SelectionMode = 'single';

  @Input()
  get selectMode(): SelectionMode {
    return this._selectMode;
  }

  set selectMode(selectMode: SelectionMode) {
    this._selectMode = selectMode;
  }

  @Input()
  selectedBy: string | ((context: TreeViewNode) => any);

  @Input()
  selectedKeys: string[];

  @Input()
  checkedBy: string | ((context: TreeViewNode) => any);

  @Input()
  checkedKeys: string[];

  _nodeTemplateRef: any;

  @Input('nodeTemplate')
  get nodeTemplateRef(): NodeTemplateDirective {
    return this._nodeTemplateRef || this.nodeTemplateQuery;
  }

  /**
   * @hidden
   *
   * Defines the template for each node.
   * Takes precedence over nested templates in the TreeView tag.
   */
  set nodeTemplateRef(template: NodeTemplateDirective) {
    this._nodeTemplateRef = template;
  }

  _loadMoreButtonTemplateRef: any;

  /**
   * @hidden
   *
   * Defines the template for each load-more button.
   * Takes precedence over nested templates in the TreeView tag.
   */
  @Input('loadMoreButtonTemplate')
  get loadMoreButtonTemplateRef(): LoadMoreButtonTemplateDirective {
    return this._loadMoreButtonTemplateRef || this.loadMoreButtonTemplateQuery;
  }

  set loadMoreButtonTemplateRef(template: LoadMoreButtonTemplateDirective) {
    this._loadMoreButtonTemplateRef = template;
  }

  _size: TreeViewSize = 'medium';

  @Input()
  get size(): TreeViewSize {
    return this._size;
  }

  /**
   * Sets the size of the component.
   *
   * The possible values are:
   * * `'small'`
   * * `'medium'` (default)
   * * `'large'`
   * * `null`
   *
   */
  set size(size: TreeViewSize) {
    this.renderer.removeClass(this.element.nativeElement, getSizeClass('tree-view', this.size));
    if (size) {
      this.renderer.addClass(this.element.nativeElement, getSizeClass('tree-view', size));
    }
    this._size = size;
  }

  /** @hidden */get direction(): string {
    return this.directionality.value;
  }

  /**
   * The nodes which will be displayed by the TreeView
   * ([see example]({% slug databinding_tree-view %})).
   */
  @Input()
  get dataSource(): TreeViewDataSource {
    // return this._dataSource.value;
    return this._dataSource;
  }

  set dataSource(value: TreeViewDataSource) {
    // this._dataSource.next(value || []);
    this._dataSource = value;
    // this.children    = value.children;
    // this.hasChildren = value.hasChildren;
    this.dataChangeNotification.notify();
  }

  _eventBusSubscription: Subscription;

  ngOnChanges(changes: SimpleChanges) {
    this.navigationService.navigable = Boolean(this.navigable);


    if (changes['treeControl']) {
      if (this._eventBusSubscription) {
        this._eventBusSubscription.unsubscribe();
        this._eventBusSubscription = null;
      }
      this.ngZone.runOutsideAngular(() => {
        this._eventBusSubscription = this.treeControl.eventBus.subscribe((event) => {
          this.ngZone.run(() => {
            if (event instanceof TreeViewSelectEvent) {
              if (this.selectedKeysChange.observed) {
                this.selectedKeysChange.emit(Array.from(event.selectedKeys.values()));
              }
            } else if (event instanceof TreeViewCheckEvent) {
              if (this.checkedKeysChange.observed) {
                this.checkedKeysChange.emit(Array.from(event.checkedKeys.values()));
              }
            } else if (event instanceof TreeViewExpandEvent) {
              if (this.expandedKeysChange.observed) {
                this.expandedKeysChange.emit(Array.from(event.expandedKeys.values()));
              }
            }
          });
        });
      });
    }

    if (changes['treeControl'] && changes['textField']) {
      this.treeControl.filterModel.filterKey = this.textField;
    }

    if (changes['expandedBy']) {
      this.treeControl.expandModel.expandedBy = this.expandedBy;
    }

    if (changes['expandedKeys']) {
      this.treeControl.expandModel.setExpandKeys(this.expandedKeys);
    }

    if (changes['selectable']) {
      this.treeControl.selectModel.selectable = this.selectable;
    }

    if (changes['selectMode']) {
      this.treeControl.selectModel.selectionMode = this.selectMode;
    }

    if (changes['selectedBy']) {
      this.treeControl.selectModel.selectedBy = this.selectedBy;
    }

    if (changes['selectedKeys']) {
      this.treeControl.selectModel.selectedKeys = new Set(this.selectedKeys);
    }

    if (changes['checkable'] || changes['checkOnClick']) {
      if (this.checkOnClickSubscription) {
        this.checkOnClickSubscription.unsubscribe();
        this.checkOnClickSubscription = null;
      }
      if (this._checkOnClick) {
        this.checkOnClickSubscription = this.nodeClick.subscribe(args => {
          if (args.type === 'click') {
            const lookup = this.itemLookup(args.item.uid);
            this.treeControl.checkModel.toggleCheckNode(lookup.item.node);
          }
        });
      }
    }

    if (changes['checkedBy']) {
      this.treeControl.checkModel.checkedBy = this.checkedBy;
      this.treeControl.checkAllNode();
    }

    if (changes['checkedKeys']) {
      this.treeControl.checkModel.setCheckedKeys(this.checkedKeys);
      this.treeControl.checkAllNode();
    }

    if(changes['checkParents']) {
      this.treeControl.checkModel.checkParents = this.checkParents;
      this.treeControl.checkAllNode();
    }

    if(changes['checkChildren']) {
      this.treeControl.checkModel.checkChildren = this.checkChildren;
      this.treeControl.checkAllNode();
    }
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    this.hostDomSubscriptions.unsubscribe();
    if (this.checkOnClickSubscription) {
      this.checkOnClickSubscription.unsubscribe();
    }
  }

  ngOnInit() {
    if (!this.treeControl || !this.dataSource) {
      throw new Error(`If you notice that this.treeControl is not defined please know that 
the Tree View requires \`treeControl\` Input to be set before other inputs.
the treeControl and dataSource is required for tree view. 
      `);
    }

    this.subscriptions.add(this.nodeChildrenService
      .changes
      .subscribe((x) => this.childrenLoaded.emit(x)));
    this.subscriptions.add(this.expandService.changes
      .subscribe(({uid, dataItem, expand}) => expand
        ? this.expand.emit({uid, node: dataItem})
        : this.collapse.emit({uid, node: dataItem})
      )
    );
    /**
     * @deprecated
     */
    this.subscriptions.add(this.navigationService.checks
      .subscribe((x: string) => this.checkedChange.emit(this.treeViewLookupService.itemLookup(x))));

    /**
     * @deprecated
     */
    this.subscriptions.add(this.selectionService.changes
      .subscribe((x) => {
        if (this.selectable) {
          this.ngZone.run(() => {
            this.selectionChange.emit(x);
          });
        }
      }));
    if (this.element) {
      this.ngZone.runOutsideAngular(() => {
        this.attachDomHandlers();
      });
    }
    if (this.size) {
      this.renderer.addClass(this.element.nativeElement, getSizeClass('tree-view', this.size));
    }
  }

  /**
   * Blurs the focused TreeView item.
   */
  blur() {
    const target = focusableNode(this.element);
    if (document.activeElement === target) {
      target.blur();
    }
  }

  /**
   * Focuses the first focusable item in the TreeView component if no hierarchical index is provided.
   *
   * @example
   * ```ts
   * import { Component } from '@angular/core';
   *
   *  @Component({
   *      selector: 'my-app',
   *      template: `
   *      <button (click)="tree-view.focus('1')">Focuses the second node</button>
   *      <tri-tree-view
   *          #tree-view
   *          [nodes]="data"
   *          textField="text"
   *      >
   *      </tri-tree-view>
   *  `
   *  })
   *  export class AppComponent {
   *      public data: any[] = [
   *          { text: "Furniture" },
   *          { text: "Decor" }
   *      ];
   *  }
   * ```
   */
  focus(index: string) {
    const focusIndex = index || nodeIndex(this.navigationService.focusableItem);
    this.navigationService.activateUid(focusIndex);
    const target = focusableNode(this.element);
    if (target) {
      target.focus();
    }
  }

  /**
   * Based on the specified index, returns the TreeItemLookup node.
   *
   * @param uid - The index of the node.
   * @returns {TreeItemLookup} - The item that was searched (looked up).
   */
  itemLookup(uid: string): TreeItemLookup {
    return this.treeViewLookupService.itemLookup(uid);
  }

  rebindChildren() {
    this.dataChangeNotification.notify();
  }

  expandNode(item: TreeViewNode, index?: string) {
    this.expandService.expand(/*index, */item);
  }

  /**
   * Triggers the `collapse` event for the provided node.
   */
  collapseNode(item: TreeViewNode, index?: string) {
    this.expandService.collapse(/*index, */item);
  }

  onFilterChange(filterTerm: string) {
    this.filterChange.emit(filterTerm);
    this.treeControl?.filterModel.handleFilterChange(filterTerm);
  }

  /**
   * Gets the current page size of the checked data item children collection
   *
   * > Since the root nodes collection is not associated with any parent data item, pass `null` as `dataItem` param to get its page size.
   *
   * @param dataItem {any} - The parent data item of the targeted collection.
   * @returns {number} - The page size of the checked data item children collection.
   */
  getNodePageSize(dataItem: any) {
    this.verifyLoadMoreService();
    return this.loadMoreStrategy.getGroupSize(dataItem);
  }

  /**
   * Sets the page size of the targeted data item children collection
   *
   * > Since the root nodes collection is not associated with any parent data item, pass `null` as `dataItem` param to target its page size.
   *
   * @param dataItem {any} - The parent data item of the targeted collection.
   * @param pageSize {number} - The new page size.
   */
  setNodePageSize(dataItem: any, pageSize: number) {
    this.verifyLoadMoreService();
    this.loadMoreStrategy.setGroupSize(dataItem, pageSize);
  }

  /**
   * @hidden
   *
   * Clears the current TreeViewLookupService node map and re-registers all nodes anew.
   * Child nodes are acquired through the provided `children` callback.
   */
  preloadChildNodes() {
    // this.treeViewLookupService.reset();
    // this.registerLookupItems(this.dataSource);
  }

  attachDomHandlers(): any {
    const element = this.element.nativeElement;

    this.hostDomSubscriptions = merge(
      merge(
        fromEvent<MouseEvent>(element, 'contextmenu'),
        fromEvent<MouseEvent>(element, 'click'),
        fromEvent<MouseEvent>(element, 'dblclick'),
      ).pipe(tap((event: MouseEvent) => this.clickHandler(event))),
      fromEvent<FocusEvent>(element, 'focusin').pipe(tap((event: FocusEvent) => this.focusHandler(event))),
      fromEvent<FocusEvent>(element, 'focusout').pipe(tap((event: FocusEvent) => this.blurHandler(event))),
      fromEvent<KeyboardEvent>(element, 'keydown').pipe(tap((event: KeyboardEvent) => this.keydownHandler(event))),
    ).subscribe();
  }

  focusHandler(e): void {
    let focusItem;
    if (match(e.target, '.tri-tree-view-item')) {
      focusItem = e.target;
    } else if (!isFocusable(e.target)) { // with compliments to IE
      focusItem = closestNode(e.target);
    }
    if (focusItem) {
      this.navigationService.activateUid(nodeId(e.target));
      if (!this.isActive && isObserved(this.onFocus)) {
        this.ngZone.run(() => {
          this.onFocus.emit();
        });
      }
      this.isActive = true;
    }
  }

  blurHandler(e: FocusEvent): void {
    if (this.isActive && match(e.target, '.tri-tree-view-item') &&
      (!e.relatedTarget || !match(e.relatedTarget, '.tri-tree-view-item') || !hasParent(
        e.relatedTarget, this.element.nativeElement))) {
      this.navigationService.deactivate();
      this.isActive = false;
      if (isObserved(this.onBlur)) {
        this.ngZone.run(() => {
          this.onBlur.emit();
        });
      }
    }
  }

  clickHandler(e: MouseEvent): void {
    const target = e.target;
    if ((e.type === 'contextmenu' && !isObserved(this.nodeClick)) ||
      (
        e.type === 'click' &&
        !isObserved(this.nodeClick) &&
        // !hasObservers(this.selectionChange) &&
        !this.selectable &&
        !isLoadMoreButton(target)
      ) || (
        e.type === 'dblclick' &&
        !isObserved(this.nodeDblClick)
      ) || isFocusable(target) || (
        !isContent(target) &&
        !isLoadMoreButton(target)
      ) || !hasParent(target, this.element.nativeElement)
    ) {
      return;
    }
    const uid = nodeId(closestNode(target));
    // the disabled check is probably not needed due to the k-disabled styles
    if (!uid || this.navigationService.isDisabled(uid)) {
      return;
    }
    this.ngZone.run(() => {
      // record this value before emitting selectionChange (`this.navigationService.selectIndex`), as the tree-view state may be changed on its emission
      const lookup = this.treeViewLookupService.itemLookup(uid);
      if (e.type === 'click') {
        const loadMoreButton = this.navigationService.model.findNode(uid).loadMoreButton;
        if (loadMoreButton) {
          this.navigationService.notifyLoadMore(uid);
          return;
        } else {
          this.navigationService.selectUid(uid);
        }
      }
      const eventData: NodeClickEvent = {
        item         : lookup.item,
        originalEvent: e,
        type         : e.type
      };
      if (e.type === 'dblclick') {
        this.nodeDblClick.emit(eventData);
      } else {
        this.nodeClick.emit(eventData);
      }
    });
  }

  keydownHandler(e: KeyboardEvent): any {
    if (this.isActive && this.navigable) {
      this.ngZone.run(() => {
        this.navigationService.move(e);
      });
    }
  }

  verifyLoadMoreService(): any {
    if (isDevMode() && !isPresent(this.loadMoreStrategy)) {
      throw new Error(
        `To use the TreeView paging functionality, you need to assign the \`kendoTreeViewLoadMore\` directive.`);
    }
  }

  registerLookupItems(data: any[], parentItem = null): any {
    if (!isPresent(data) || data.length === 0) {
      return;
    }
    const parentUid = parentItem ? parentItem.uid : null;
    const treeItems = data.map((node) => buildTreeItem(node, node.uid, parentUid));
    if (isPresent(parentItem)) {
      this.treeViewLookupService.registerChildren(parentUid, treeItems);
    }
    treeItems.forEach(item => {
      this.treeViewLookupService.registerItem(item, parentItem);
      // if (this.hasChildren(item.dataItem)) {
      //   this.children(item.dataItem)
      //     .subscribe(children => this.registerLookupItems(children, item));
      // }
    });
  }
}
