/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { ChangeDetectorRef, Directive, Input, OnChanges } from '@angular/core';
import { TreeItem } from './tree-item.interface';
import { TreeViewComponent } from './tree-view.component';

/**
 * @deprecated
 */
@Directive({
  selector: '[triTreeViewDisable]',
})
export class TreeViewDisableDirective implements OnChanges {
  @Input('triTreeViewDisable')
  disableKey: string | ((context: TreeItem) => any);

  @Input()
  disabledKeys: any[] = [];

  constructor(
    public treeView: TreeViewComponent,
    public cdr: ChangeDetectorRef
  ) {
    // this.treeView.isDisabled = (dataItem, index) => (this.disabledKeys.indexOf(this.itemKey({dataItem, index})) > -1);
  }

  /**
   * @hidden
   */
  // @Input()
  set isDisabled(value: (item: object, index: string) => boolean) {
    // this.treeView.isDisabled = value;
  }

  ngOnChanges(changes: any = {}) {
    const {disabledKeys} = changes;
    if (disabledKeys && !disabledKeys.firstChange) {
      this.cdr.markForCheck();
    }
  }

  itemKey(e: { node: any, uid: string }) {
    if (!this.disableKey) {
      return e.uid;
    }
    if (typeof this.disableKey === 'string') {
      return e.node[this.disableKey];
    }
    if (typeof this.disableKey === 'function') {
      return this.disableKey(e);
    }
  }
}
