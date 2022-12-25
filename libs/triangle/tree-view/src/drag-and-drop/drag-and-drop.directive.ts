/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { AfterContentInit, ContentChild, Directive, ElementRef, Input, NgZone, OnDestroy } from '@angular/core';
import { isPresent } from '@gradii/nanofn';
import { Draggable } from '@gradii/triangle/draggable';
import { isObserved } from '../helper/is-observed';
import { TreeViewComponent } from '../tree-view.component';
import { closestWithMatch, isContent } from '../utils';
import {
  getContainerOffset, getDropAction, getDropPosition, getDropTarget, treeItemFromEventTarget
} from './drag-and-drop-utils';
import { DragClueTemplateDirective } from './drag-clue/drag-clue-template.directive';
import { DragClueService } from './drag-clue/drag-clue.service';
import { DropHintTemplateDirective } from './drop-hint/drop-hint-template.directive';
import { DropHintService } from './drop-hint/drop-hint.service';
import { DropPosition, TreeItemDragStartEvent, TreeItemDropEvent } from './models';

const DEFAULT_SCROLL_SETTINGS = {
  enabled : true,
  step    : 1,
  interval: 1
};

@Directive({
  selector : '[triTreeViewDragAndDrop]',
  providers: [
    DragClueService,
    DropHintService
  ],
  host     : {
    '[style.user-select]': 'userSelectStyle'
  }
})
export class DragAndDropDirective implements AfterContentInit, OnDestroy {

  @ContentChild(DragClueTemplateDirective, {static: false})
  dragClueTemplate: DragClueTemplateDirective;
  @ContentChild(DropHintTemplateDirective, {static: false})
  dropHintTemplate: DropHintTemplateDirective;

  draggable: Draggable;
  default;
  draggedItem: HTMLElement;
  pendingDragStartEvent: PointerEvent;

  /**
   * Specifies whether the `removeItem` event will be fired after an item is dropped when the `ctrl` key is pressed.
   * If enabled, the `removeItem` event will not be fired on the source TreeView
   * ([see example]({% slug draganddrop_treeview %}#toc-multiple-treeviews)).
   *
   */
  @Input()
  allowCopy = false;

  /**
   * Specifes the TreeViewComponent instances into which dragged items from the current TreeViewComponent can be dropped
   */
  @Input()
  dropZoneTreeViews: TreeViewComponent[] = [];

  /**
   * Specifies the distance in pixels from the initial item pointerdown event, before the dragging is initiated.
   * The `nodeDragStart` and all consequent TreeView drag events will not be fired until the actual dragging begins.
   *
   * @default 5
   */
  @Input()
  startDragAfter = 5;

  /**
   * Controlls the auto-scrolling behavior during drag-and-drop ([see example]({% slug draganddrop_treeview %}#toc-auto-scrolling)).
   * Enbaled by default. To turn the auto-scrolling off, set this prop to `false`.
   *
   * By default, the scrolling will be performed by 1 pixel at every 1 millisecond, when the dragged item reaches the top or the bottom of the scrollable container.
   * The `step` and `interval` can be overridden by providing a `DragAndDropScrollSettings` object to this prop.
   *
   */
  @Input()
  autoScroll      = true;

  /**
   * @hidden
   */
  userSelectStyle = 'none';
  /**
   * Describes the offset of the parent element if the latter has the `transform` CSS prop applied.
   * Transformed parents create new stacking context and the fixed children must be position based on the transformed parent.
   * https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Positioning/Understanding_z_index/The_stacking_context
   */
  containerOffset = {top: 0, left: 0};

  constructor(public element: ElementRef<HTMLElement>,public zone: NgZone,public treeview: TreeViewComponent,
              public dragClueService: DragClueService,public dropHintService: DropHintService) {
    this.treeview.touchActions = false;
  }

  get scrollSettings(): any {
    const userProvidedSettings = typeof this.autoScroll === 'boolean' ?
      {enabled: this.autoScroll} :
      this.autoScroll;
    return Object.assign({}, DEFAULT_SCROLL_SETTINGS, userProvidedSettings);
  }

  ngAfterContentInit() {
    this.initalizeDraggable();
    this.dragClueService.initialize(this.treeview.assetsContainer,
      this.dragClueTemplate && this.dragClueTemplate.templateRef);
    this.dropHintService.initialize(this.treeview.assetsContainer,
      this.dropHintTemplate && this.dropHintTemplate.templateRef);
  }

  ngOnDestroy() {
    this.draggable.destroy();
  }

  /**
   * @hidden
   */
  handlePress({originalEvent}) {
    if (!isContent(originalEvent.target)) {
      return;
    }
    // store the drag target on press, show it only when it's actually dragged
    this.draggedItem           = closestWithMatch(originalEvent.target, '.tri-tree-view-leaf');
    // record the current pointer down coords - copared to the `startDragAfter` value to calculate whether to initiate dragging
    this.pendingDragStartEvent = originalEvent;
  }

  /**
   * @hidden
   */
  handleDrag({originalEvent, clientX, clientY}) {
    if (this.shouldInitiateDragStart({clientX, clientY})) {
      this.initiateDragStart();
    }
    if (!isPresent(this.draggedItem) || isPresent(this.pendingDragStartEvent)) {
      return;
    }
    const dropTarget = getDropTarget(originalEvent);
    if (isObserved(this.treeview.nodeDrag)) {
      this.zone.run(() => this.notifyDrag(originalEvent, dropTarget));
    }
    const targetTreeView  = this.getTargetTreeView(dropTarget);
    const dropPosition    = getDropPosition(this.draggedItem, dropTarget, clientY, targetTreeView,
      this.containerOffset);
    const dropHintAnchor  = closestWithMatch(dropTarget, '.tri-treeview-mid');
    const dropAction      = getDropAction(dropPosition, dropTarget);
    const sourceItem      = treeItemFromEventTarget(this.treeview, this.draggedItem);
    const destinationItem = treeItemFromEventTarget(targetTreeView, dropTarget);
    this.updateDropHintState(dropPosition, dropHintAnchor, dropAction, sourceItem, destinationItem);
    this.updateDragClueState(dropAction, clientX, clientY, sourceItem, destinationItem);
    if (this.scrollSettings.enabled) {
      this.dragClueService.scrollIntoView(this.scrollSettings);
    }
  }

  /**
   * @hidden
   */
  handleRelease({originalEvent, clientY}) {
    if (this.scrollSettings.enabled) {
      this.dragClueService.cancelScroll();
    }
    if (!isPresent(this.draggedItem) || isPresent(this.pendingDragStartEvent)) {
      this.pendingDragStartEvent = null;
      this.draggedItem           = null;
      return;
    }
    const dropTarget      = getDropTarget(originalEvent);
    const sourceTree      = this.treeview;
    const destinationTree = this.getTargetTreeView(dropTarget);
    const dropPosition    = getDropPosition(this.draggedItem, dropTarget, clientY,
      this.getTargetTreeView(dropTarget), this.containerOffset);
    const sourceItem      = treeItemFromEventTarget(sourceTree, this.draggedItem);
    const destinationItem = treeItemFromEventTarget(destinationTree, dropTarget);
    if (isPresent(destinationItem) && isPresent(dropPosition)) {
      this.zone.run(() => this.notifyDrop({
        sourceItem,
        destinationItem,
        dropPosition,
        sourceTree,
        destinationTree
      }, originalEvent));
    } else {
      this.dragClueService.animateDragClueToElementPosition(this.draggedItem);
    }
    if (isObserved(this.treeview.nodeDragEnd)) {
      this.zone.run(() => this.notifyDragEnd({sourceItem, destinationItem, originalEvent}));
    }
    this.dropHintService.hide();
    this.draggedItem = null;
  }

  updateDropHintState(dropPosition, dropHintAnchor, dropAction, sourceItem, destinationItem): any {
    if (!isPresent(dropHintAnchor) || dropPosition === DropPosition.Over || !isPresent(
      dropPosition)) {
      this.dropHintService.hide();
      return;
    }
    const anchorViewPortCoords = dropHintAnchor.getBoundingClientRect();
    const insertBefore         = dropPosition === DropPosition.Before;
    const top                  = insertBefore ? anchorViewPortCoords.top : (anchorViewPortCoords.top + anchorViewPortCoords.height);
    this.dropHintService.updateDropHintData(dropAction, sourceItem, destinationItem);
    // clear any possible container offset created by parent elements with `transform` css property set
    this.dropHintService.move(anchorViewPortCoords.left - this.containerOffset.left,
      top - this.containerOffset.top);
    this.dropHintService.show();
  }

  updateDragClueState(dropAction, clientX, clientY, sourceItem, destinationItem): any {
    // clear any possible container offset created by parent elements with `transform` css property set
    this.dragClueService.move(clientX - this.containerOffset.left,
      clientY - this.containerOffset.top);
    this.dragClueService.updateDragClueData(dropAction, sourceItem, destinationItem);
    this.dragClueService.show();
  }

  initalizeDraggable(): any {
    this.draggable = new Draggable({
      press  : this.handlePress.bind(this),
      drag   : this.handleDrag.bind(this),
      release: this.handleRelease.bind(this)
    });
    this.zone.runOutsideAngular(() => this.draggable.bindTo(this.element.nativeElement));
  }

  notifyDragStart(originalEvent, dropTarget): any {
    const sourceItem = treeItemFromEventTarget(this.treeview, dropTarget);
    const event      = new TreeItemDragStartEvent({sourceItem, originalEvent});
    this.treeview.nodeDragStart.emit(event);
    return event;
  }

  notifyDrag(originalEvent, dropTarget): any {
    const dragEvent = {
      sourceItem     : treeItemFromEventTarget(this.treeview, this.draggedItem),
      destinationItem: treeItemFromEventTarget(this.getTargetTreeView(dropTarget), dropTarget),
      originalEvent
    };
    this.treeview.nodeDrag.emit(dragEvent);
  }

  notifyDrop(args, originalEvent): any {
    const event = new TreeItemDropEvent(args, originalEvent);
    args.destinationTree.nodeDrop.emit(event);
    // disable the animations on drop and restore them afterwards (if they were initially turned on)
    this.disableAnimationsForNextTick(args.destinationTree);
    if (args.sourceTree !== args.destinationTree) {
      this.disableAnimationsForNextTick(args.sourceTree);
    }
    if (!event.isDefaultPrevented() && event.isValid) {
      this.dragClueService.hide();
      // order matters in a flat data binding scenario (first add, then remove)
      args.destinationTree.addItem.emit(args);
      if (!(originalEvent.ctrlKey && this.allowCopy)) {
        args.sourceTree.removeItem.emit(args);
      }
    } else if (event.isDefaultPrevented()) {
      // directly hide the clue if the default is prevented
      this.dragClueService.hide();
    } else if (!event.isValid) {
      // animate the clue back to the source item position if marked as invalid
      this.dragClueService.animateDragClueToElementPosition(this.draggedItem);
    }
  }

  notifyDragEnd(dragEndEvent): any {
    this.treeview.nodeDragEnd.emit(dragEndEvent);
  }

  getTargetTreeView(dropTarget): any {
    const treeViewTagName = this.treeview.element.nativeElement.tagName;
    const targetTreeView  = closestWithMatch(dropTarget, treeViewTagName);
    return [this.treeview, ...this.dropZoneTreeViews].find(
      treeView => isPresent(treeView) && treeView.element.nativeElement === targetTreeView);
  }

  disableAnimationsForNextTick(treeView): any {
    // the treeView.animate getter returns `true` when the animations are turned off
    // confusing, but seems on purpose (the `animate` prop sets the value of the @.disabled host-bound attribute)
    if (treeView.animate) {
      return;
    }
    treeView.animate = false;
    this.zone.runOutsideAngular(() => setTimeout(() => treeView.animate = true));
  }

  shouldInitiateDragStart(currentPointerCoords): any {
    if (!isPresent(this.pendingDragStartEvent)) {
      return false;
    }
    const distanceFromPointerDown = Math.sqrt(
      Math.pow((this.pendingDragStartEvent.clientX - currentPointerCoords.clientX), 2) +
      Math.pow((this.pendingDragStartEvent.clientY - currentPointerCoords.clientY), 2));
    return distanceFromPointerDown >= this.startDragAfter;
  }

  initiateDragStart(): any {
    if (isObserved(this.treeview.nodeDragStart)) {
      const dragStartEvent = this.zone.run(() => this.notifyDragStart(
        this.pendingDragStartEvent,
        getDropTarget(this.pendingDragStartEvent))
      );
      if (dragStartEvent.isDefaultPrevented()) {
        this.pendingDragStartEvent = null;
        this.draggedItem           = null;
        return;
      }
    }
    this.dragClueService.cancelReturnAnimation();
    this.dragClueService.updateText(this.draggedItem.innerText);
    this.containerOffset       = getContainerOffset(this.draggedItem);
    this.pendingDragStartEvent = null;
  }
}
