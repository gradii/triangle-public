/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { ComponentFactoryResolver, Injectable, OnDestroy, TemplateRef, ViewContainerRef } from '@angular/core';
import { isPresent } from '@gradii/nanofn';
import { TreeItemLookup } from '../../tree-item-lookup.interface';
import { dataItemsEqual } from '../../utils';
import { getScrollableContainer, scrollElementBy } from '../drag-and-drop-utils';
import { DragAndDropAssetService } from '../editing-services/drag-and-drop-asset.service';
import { DropAction, ScrollDirection } from '../models';
import { DragClueComponent } from './drag-clue.component';

/**
 * @hidden
 */
export const CLUE_OFFSET               = 10;

/**
 * @hidden
 */
export const RETURN_ANIMATION_DURATION = 200;

@Injectable()
export class DragClueService extends DragAndDropAssetService<DragClueComponent> implements OnDestroy {
  componentFactoryResolver: any;
  returnAnimation: any;
  scrollInterval: any;

  constructor(componentFactoryResolver: ComponentFactoryResolver) {
    super();
    this.componentFactoryResolver = componentFactoryResolver;
  }

  initialize(container: ViewContainerRef, template: TemplateRef<any>) {
    if (isPresent(this._componentRef)) {
      this.ngOnDestroy();
    }
    const clueComponentFactory = this.componentFactoryResolver.resolveComponentFactory(
      DragClueComponent);
    this.componentRef          = container.createComponent(clueComponentFactory);
    this.hide();
    this.componentRef.instance.template = template;
    this.componentRef.changeDetectorRef.detectChanges();
  }

  ngOnDestroy() {
    this.cancelReturnAnimation();
    this.cancelScroll();
    super.ngOnDestroy();
  }

  move(left: number, top: number) {
    super.move(left, top, CLUE_OFFSET);
  }

  animateDragClueToElementPosition(target: HTMLElement) {
    if (!(isPresent(target) && isPresent(this.element.animate))) {
      this.hide();
      return;
    }
    const targetElementViewPortCoords = target.getBoundingClientRect();
    const clueElementViewPortCoords   = this.element.getBoundingClientRect();
    this.returnAnimation              = this.element.animate([
      {transform: 'translate(0, 0)'},
      {
        transform: `translate(${
          targetElementViewPortCoords.left - clueElementViewPortCoords.left
        }px, ${targetElementViewPortCoords.top - clueElementViewPortCoords.top}px)`
      }
    ], RETURN_ANIMATION_DURATION);
    this.returnAnimation.onfinish     = () => this.hide();
  }

  cancelReturnAnimation() {
    if (!isPresent(this.returnAnimation)) {
      return;
    }
    this.returnAnimation.cancel();
    this.returnAnimation = null;
  }

  updateDragClueData(action: DropAction, sourceItem: TreeItemLookup,
                     destinationItem: TreeItemLookup) {
    const dragClue = this.componentRef.instance;
    if (action === dragClue.action && dataItemsEqual(sourceItem,
      dragClue.sourceItem) && dataItemsEqual(destinationItem, dragClue.destinationItem)) {
      return;
    }
    dragClue.action          = action;
    dragClue.sourceItem      = sourceItem;
    dragClue.destinationItem = destinationItem;
    dragClue.detectChanges();
  }

  updateText(text: string) {
    if (text === this.componentRef.instance.text) {
      return;
    }
    this.componentRef.instance.text = text;
    this.componentRef.instance.detectChanges();
  }

  /**
   * Triggers the first scrollable parent to scroll upwards or downwards.
   * Uses setInterval, so should be called outside the angular zone.
   */
  scrollIntoView({step, interval}) {
    this.cancelScroll();
    const scrollableContainer = getScrollableContainer(this.element);
    if (!isPresent(scrollableContainer)) {
      return;
    }
    const containerRect             = scrollableContainer.getBoundingClientRect();
    const clueRect                  = this.element.getBoundingClientRect();
    // if the beginning of the scrollable container is above the current viewport, fall-back to 0
    const firstVisibleClientTopPart = Math.max(containerRect.top, 0);
    // start scrolling up when the first visible item is dragged over
    const topLimit                  = firstVisibleClientTopPart + clueRect.height;
    // if the end of the scrollable container is beneath the current viewport, fall-back to its client height
    // add the distance from the start of the viewport to the beginning of the container to ensure scrolling bottom begins when the actual end of the container is reached
    const bottomLimit = firstVisibleClientTopPart + Math.min(containerRect.bottom,
      scrollableContainer.clientHeight);
    if (clueRect.top < topLimit) {
      this.scrollInterval = setInterval(
        () => scrollElementBy(scrollableContainer, step, ScrollDirection.Up), interval);
    } else if (clueRect.bottom > bottomLimit) {
      this.scrollInterval = setInterval(
        () => scrollElementBy(scrollableContainer, step, ScrollDirection.Down), interval);
    }
  }

  /**
   * Cancels out the on-going scroll animation, if present.
   */
  cancelScroll() {
    if (isPresent(this.scrollInterval)) {
      clearInterval(this.scrollInterval);
      this.scrollInterval = null;
    }
  }
}
