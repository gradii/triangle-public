/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import {
  AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Host,
  HostBinding, Input, OnDestroy, OnInit, Renderer2, SkipSelf
} from '@angular/core';
import { Subscription } from 'rxjs';
import { filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { ResizeDirective } from './resize.directive';
import { SplitterPaneComponent } from './splitter-pane.component';
import { SplitterService } from './splitter.service';
import { SplitterOrientation } from './splitter.types';


type DragEventData = { pageX: number, pageY: number, originalX: number, originalY: number };

@Component({
  selector       : 'tri-splitter-bar',
  template       : `
    <div
      class="prev"
      *ngIf="showCollapseButton"
      triPopover
      [triPopoverTrigger]="'hover'"
      [ngClass]="prevClass"
      [triPopoverTitle]="preTip"
      (click)="collapsePrePane()"
      (touchstart)="collapsePrePane()"
    ></div>
    <div class="devui-resize-handle"></div>
    <div
      class="next"
      *ngIf="showCollapseButton"
      triPopover
      [triPopoverTrigger]="'hover'"
      [ngClass]="nextClass"
      [triPopoverTitle]="nextTip"
      (click)="collapseNextPane()"
      (touchstart)="collapseNextPane()"
    ></div>

  `,
  styleUrls      : ['../style/splitter-bar.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SplitterBarComponent implements OnInit, AfterViewInit, OnDestroy {
  // 当前pane索引
  @Input() index: number;
  // 窗格排列方向
  @Input() orientation: SplitterOrientation;
  // 是否显示展开/收缩按钮
  @Input() showCollapseButton: boolean;
  // 分隔条大小
  _splitBarSize: number | string;

  @Input()
  get splitBarSize() {
    return this._splitBarSize;
  }

  set splitBarSize(size) {
    this._splitBarSize = size;
    this.renderer.setStyle(this.el.nativeElement, 'flex-basis', size);
  }

  @Input() disabledBarSize: string;

  @HostBinding('class')
  get class() {
    let bindClass = 'tri-splitter-bar tri-splitter-bar-' + this.orientation;
    if (!this.splitter.isStaticBar(this.index)) {
      bindClass += ' resizable';
    } else {
      this.renderer.setStyle(this.el.nativeElement, 'flex-basis', this.disabledBarSize);
    }
    return bindClass;
  }

  // 国际化文案
  splitterText            = {
    expand  : 'expand',
    collapse: 'collapse'
  };
  // 提示内容
  preTip: string;
  nextTip: string;
  subscriptions           = new Subscription();
  // 移动的时候，阻止事件冒泡
  private stopPropagation = ({originalEvent: event}: {originalEvent: MouseEvent}) => {
    event.stopPropagation();
    if (event.cancelable) {
      event.preventDefault();
    }
  };

  // 处理移动过程中的数据流, 合并到pressEvent事件流中
  private moveStream = (resize: ResizeDirective) => {
    return (mouseDown: MouseEvent) => {
      return resize.dragEvent.pipe(
        takeUntil(resize.releaseEvent),
        map<any, DragEventData>(({pageX, pageY}) => ({
          originalX: mouseDown.pageX,
          originalY: mouseDown.pageY,
          pageX,
          pageY
        }))
      );
    };
  };

  constructor(private el: ElementRef,
              private splitter: SplitterService,
              private renderer: Renderer2,
              @Host() private resize: ResizeDirective,
              @SkipSelf() private cdr: ChangeDetectorRef,
              private cdrSelf: ChangeDetectorRef,
  ) {
    this.splitter.paneChangeSubject.subscribe(() => {
      this.initialCollapseStatus();
      this.cdr.detectChanges();
      this.cdrSelf.detectChanges();
    });
  }

  ngOnInit(): void {
    let state: any;
    const resizeListener = this.resize.pressEvent
      .pipe(
        tap(this.stopPropagation),
        filter(() => this.splitter.isResizable(this.index)),
        tap((event: any) => {
          state = this.splitter.dragState(this.index);
        }),
        switchMap(this.moveStream(this.resize))
      )
      .subscribe(({pageX, pageY, originalX, originalY}) => {
        let distance;
        if (this.orientation === 'vertical') {
          distance = pageY - originalY;
        } else {
          distance = pageX - originalX;
        }
        this.splitter.setSize(state, distance);
      });
    this.subscriptions.add(resizeListener);
  }

  ngAfterViewInit(): void {
    this.initialCollapseStatus();
  }

  initialCollapseStatus() {
    this.collapsePrePane(true);
    this.collapseNextPane(true);
  }

  collapsePrePane(lockStatus?: boolean) {
    this.splitter.togglePane(this.index, this.index + 1, lockStatus);
    this.toggleResize();
  }

  collapseNextPane(lockStatus?: boolean) {
    this.splitter.togglePane(this.index + 1, this.index, lockStatus);
    this.toggleResize();
  }

  queryPanes(index: number, nearIndex: number) {
    const pane     = this.splitter.getPane(index);
    const nearPane = this.splitter.getPane(nearIndex);
    return {pane, nearPane};
  }

  // 切换是否允许拖拽，收起时不能拖拽
  toggleResize() {
    const {pane, nearPane} = this.queryPanes(this.index, this.index + 1);
    const isCollapsed      = pane.collapsed || nearPane.collapsed;
    if (isCollapsed) {
      this.renderer.addClass(this.el.nativeElement, 'none-resizable');
    } else {
      this.renderer.removeClass(this.el.nativeElement, 'none-resizable');
    }
  }

  // 计算前面板收起操作样式
  get prevClass() {
    const {pane, nearPane} = this.queryPanes(this.index, this.index + 1);
    this.preTip            = pane.collapsed ? this.splitterText.expand : this.splitterText.collapse;
    // 第一个面板或者其它面板折叠方向不是向后的显示操作按钮
    const showIcon         = (pane.collapseDirection !== 'after' || this.index === 0);
    return this.generateCollapseClass(pane, nearPane, showIcon);
  }

  // 计算相邻面板收起操作样式
  get nextClass() {
    const {pane, nearPane} = this.queryPanes(this.index + 1, this.index);
    this.nextTip           = pane.collapsed ? this.splitterText.expand : this.splitterText.collapse;
    // 最后一个面板或者其它面板折叠方向不是向前的显示操作按钮
    const showIcon         = (pane.collapseDirection !== 'before' || this.index + 1 === this.splitter.paneCount - 1);
    return this.generateCollapseClass(pane, nearPane, showIcon);
  }

  // 生成拼接样式
  generateClass(classes: any) {
    return Object.keys(classes).filter(c => classes[c]).join(' ');
  }

  // 根据当前状态生成收起按钮样式
  generateCollapseClass(pane: SplitterPaneComponent, nearPane: any, showIcon: boolean) {
    // 是否允许收起
    const isCollapsible       = pane.collapsible && showIcon;
    // 当前收起状态
    const isCollapsed         = pane.collapsed;
    // 一个pane收起的时候，隐藏相邻pane的收起按钮
    const isNearPaneCollapsed = nearPane.collapsed;
    return this.generateClass({
      'tri-splitter-collapse': isCollapsible,
      'collapsed'     : isCollapsed,
      'hidden'        : isNearPaneCollapsed
    });
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    this.splitter.paneChangeSubject.unsubscribe();
  }
}
