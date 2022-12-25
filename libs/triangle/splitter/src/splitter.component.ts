/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import {
  AfterContentInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ContentChildren,
  ElementRef, Input, OnChanges, OnDestroy, QueryList, SimpleChanges
} from '@angular/core';
import { Subscription } from 'rxjs';
import { SplitterPaneComponent } from './splitter-pane.component';
import { SplitterService } from './splitter.service';
import { SplitterOrientation } from './splitter.types';

@Component({
  selector       : 'tri-splitter',
  exportAs       : 'triSplitter',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template       : `
    <ng-content select="tri-splitter-pane"></ng-content>
    <ng-container *ngFor="let pane of panes; let index = index; let last = last">
      <tri-splitter-bar
        triResize
        [style.order]="index * 2 + 1"
        *ngIf="!last"
        [index]="index"
        [splitBarSize]="splitBarSize"
        [disabledBarSize]="disabledBarSize"
        [orientation]="orientation"
        [showCollapseButton]="showCollapseButton"
      >
      </tri-splitter-bar>
    </ng-container>

  `,
  styleUrls      : ['../style/splitter.scss'],
  host           : {
    'class'  : 'tri-splitter',
    '[class.tri-splitter-vertical]'  : 'orientation === "vertical"',
    '[class.tri-splitter-horizontal]': 'orientation === "horizontal"',
  },
  providers      : [
    SplitterService
  ],
})

export class SplitterComponent implements OnChanges, AfterContentInit, OnDestroy {
  // 指定Splitter中窗格的方向，默认水平分割。
  @Input() orientation: SplitterOrientation = 'horizontal';
  // 分隔条大小
  @Input() splitBarSize                     = '2px';
  // pane设置为不可调整大小时，生效
  @Input() disabledBarSize                  = '1px';
  // 是否显示展开/收缩按钮
  @Input() showCollapseButton               = true;

  // 内嵌面板
  @ContentChildren(SplitterPaneComponent) panes: QueryList<SplitterPaneComponent>;

  paneChangesSubscription: Subscription;

  constructor(private el: ElementRef, private splitter: SplitterService,
              private cdr: ChangeDetectorRef) {

  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['orientation'] && !changes['orientation'].isFirstChange()) {
      this.reconfigure();
    }
  }

  ngAfterContentInit() {
    this.reconfigure();
    // contentChildren 变化时，触发重新设置pane
    this.paneChangesSubscription = this.panes.changes.subscribe((panes) => {
      this.reconfigure();
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy() {
    if (this.paneChangesSubscription) {
      this.paneChangesSubscription.unsubscribe();
    }
  }

  // 配置pane
  reconfigure() {
    this.splitter.configPane({
      panes      : this.panes.toArray(),
      orientation: this.orientation,
      // 内容投影进组件之后，组件还没有渲染出dom，此时获取不到宽度，此处设置一个回调函数
      containerSize: () => {
        if (this.orientation === 'vertical') {
          return this.el.nativeElement.clientHeight;
        } else {
          return this.el.nativeElement.clientWidth;
        }
      }
    });
  }
}
