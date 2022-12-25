/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import {
  Directive, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, Output, Renderer2, SimpleChanges
} from '@angular/core';
import { filter, Subscription } from 'rxjs';
import { TreeViewNode } from './data-source/tree-view.data-source.node';
import { isSelected } from './default-callbacks';
import { NavigationService } from './navigation/navigation.service';
import { SelectionService } from './selection/selection.service';

@Directive({selector: '[triTreeViewItemContent]'})
export class TreeViewItemContentDirective implements OnChanges, OnDestroy {

  @Input()
  node: TreeViewNode;

  @Input()
  uid: string;

  @Input()
  initialSelection: boolean = false;

  @Input()
  isSelected: (item: object, index: string) => boolean = isSelected;

  @Output()
  selectedNode = new EventEmitter()

  subscriptions = new Subscription();

  constructor(public element: ElementRef,
              public navigationService: NavigationService,
              public selectionService: SelectionService,
              public renderer: Renderer2) {
    this.subscriptions.add(this.navigationService.moves
      .subscribe(this.updateFocusClass.bind(this)));

    this.subscriptions.add(
      this.navigationService.selects
        .pipe(filter((uid) => uid === this.uid))
        .subscribe((uid) => {
          this.selectedNode.next(this.node);
          // this.selectControl.selectNode(this.dataItem);
          this.selectionService.select(uid, this.node);
        })
    );
    this.subscriptions.add(
      this.selectionService.changes
        .subscribe(() => {
          this.updateSelectionClass(this.isSelected(this.node, this.uid));
        })
    );
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.initialSelection) {
      this.updateSelectionClass(this.initialSelection);
    }
    if (changes.index) {
      this.updateFocusClass();
    }
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  updateFocusClass(): any {
    this.render(this.navigationService.isActive(this.uid), 'tri-focus');
  }

  updateSelectionClass(selected): any {
    this.render(selected, 'tri-selected');
  }

  render(addClass, className): any {
    const action = addClass ? 'addClass' : 'removeClass';
    this.renderer[action](this.element.nativeElement, className);
  }
}
