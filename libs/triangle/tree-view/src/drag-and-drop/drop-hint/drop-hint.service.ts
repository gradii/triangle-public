/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { ComponentFactoryResolver, Injectable, TemplateRef, ViewContainerRef } from '@angular/core';
import { isPresent } from '@gradii/nanofn';
import { TreeItemLookup } from '../../tree-item-lookup.interface';
import { dataItemsEqual } from '../../utils';
import { DragAndDropAssetService } from '../editing-services/drag-and-drop-asset.service';
import { DropAction } from '../models';
import { DropHintComponent } from './drop-hint.component';

@Injectable()
export class DropHintService extends DragAndDropAssetService<any> {
  componentFactoryResolver: any;

  constructor(componentFactoryResolver: ComponentFactoryResolver) {
    super();
    this.componentFactoryResolver = componentFactoryResolver;
  }

  initialize(container: ViewContainerRef, template: TemplateRef<any>) {
    if (isPresent(this._componentRef)) {
      this.ngOnDestroy();
    }
    const hintComponentFactory = this.componentFactoryResolver.resolveComponentFactory(DropHintComponent);
    this.componentRef          = container.createComponent(hintComponentFactory);
    this.hide();
    this.componentRef.instance.template = template;
    this.componentRef.changeDetectorRef.detectChanges();
  }

  updateDropHintData(action: DropAction, sourceItem: TreeItemLookup, destinationItem: TreeItemLookup) {
    const dropHint = this.componentRef.instance;
    if (action === dropHint.action && dataItemsEqual(sourceItem, dropHint.sourceItem) && dataItemsEqual(destinationItem,
      dropHint.destinationItem)) {
      return;
    }
    dropHint.action          = action;
    dropHint.sourceItem      = sourceItem;
    dropHint.destinationItem = destinationItem;
    dropHint.detectChanges();
  }
}
