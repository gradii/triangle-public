/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { DOCUMENT } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  OnDestroy,
  Output,
  ViewChild
} from '@angular/core';
import { ScrollService } from '@gradii/triangle/core';

import { fromEvent, Subscription } from 'rxjs';
import { distinctUntilChanged, throttleTime } from 'rxjs/operators';
import { AnchorLinkComponent } from './anchor-link.component';

interface Section {
  comp: AnchorLinkComponent;
  top: number;
}

const sharpMatcherRegx = /#([^#]+)$/;

@Component({
  selector           : 'tri-anchor',
  changeDetection    : ChangeDetectionStrategy.OnPush,
  template           : `
    <div *ngIf="affix;else content" style="position:sticky" [style.top.px]="offsetTop">
      <ng-template [ngTemplateOutlet]="content"></ng-template>
    </div>
    <ng-template #content>
      <div class="tri-anchor-wrapper" #wrap [ngStyle]="wrapperStyle">
        <div class="tri-anchor" [ngClass]="{'fixed': !affix && !showInkInFixed}">
          <div class="tri-anchor-ink">
            <div class="tri-anchor-ink-ball" [class.visible]="visible" #ink></div>
          </div>
          <ng-content></ng-content>
        </div>
      </div>
    </ng-template>
  `,
  styleUrls          : [`../style/anchor.scss`]
})
export class AnchorComponent implements AfterViewInit, OnDestroy {
  scroll$: Subscription = null;
  visible = false;
  wrapperStyle: {} = {'max-height': '100vh'};
  @Output() click: EventEmitter<string> = new EventEmitter();
  @Output() scroll: EventEmitter<AnchorLinkComponent> = new EventEmitter();
  private links: AnchorLinkComponent[] = [];
  private animating = false;
  @ViewChild('wrap', {static: false}) private wrap: ElementRef;

  // region: fields
  @ViewChild('ink', {static: false}) private ink: ElementRef;

  /* tslint:disable-next-line:no-any */
  constructor(
    private scrollSrv: ScrollService, @Inject(DOCUMENT)
    private doc: any, private cdRef: ChangeDetectorRef
  ) {
  }

  private _target: Element = null;

  @Input()
  set target(el: Element) {
    this._target = el;
    this.registerScrollEvent();
  }

  private _affix: boolean = true;

  get affix(): boolean {
    return this._affix;
  }

  @Input()
  set affix(value: boolean) {
    this._affix = value;
  }

  private _bounds: number = 5;

  get bounds(): number {
    return this._bounds;
  }

  @Input()
  set bounds(value: number) {
    this._bounds = value;
  }

  private _offsetTop: number;

  get offsetTop(): number {
    return this._offsetTop;
  }

  @Input()
  set offsetTop(value: number) {
    this._offsetTop = value;
    this.wrapperStyle = {
      'max-height': `calc(100vh - ${this._offsetTop}px)`
    };
  }

  private _showInkInFixed: boolean = false;

  get showInkInFixed(): boolean {
    return this._showInkInFixed;
  }

  // endregion

  @Input()
  set showInkInFixed(value: boolean) {
    this._showInkInFixed = value;
  }

  registerLink(link: AnchorLinkComponent): void {
    this.links.push(link);
  }

  unregisterLink(link: AnchorLinkComponent): void {
    this.links.splice(this.links.indexOf(link), 1);
  }

  ngAfterViewInit(): void {
    this.registerScrollEvent();
  }

  ngOnDestroy(): void {
    this.removeListen();
  }

  handleScroll(): void {
    if (this.animating) {
      return;
    }

    const sections: Section[] = [];
    const scope = (this.offsetTop || 0) + this.bounds;
    this.links.forEach(comp => {
      const sharpLinkMatch = sharpMatcherRegx.exec(comp.href.toString());
      if (!sharpLinkMatch) {
        return;
      }
      const target = this.doc.getElementById(sharpLinkMatch[1]);
      if (target && this.getOffsetTop(target) < scope) {
        const top = this.getOffsetTop(target);
        sections.push({
          top,
          comp
        });
      }
    });

    this.visible = !!sections.length;
    if (!this.visible) {
      this.clearActive();
      this.cdRef.detectChanges();
    } else {
      const maxSection = sections.reduce((prev, curr) => curr.top > prev.top ? curr : prev);
      this.handleActive(maxSection.comp);
    }
  }

  handleScrollTo(linkComp: AnchorLinkComponent): void {
    let el;
    try {
      el = this.doc.querySelector(linkComp.href);
    } catch (e) {
      console.warn(`${linkComp.href} is not a valid dom selector`);
    } finally {
      if (!el) {
        return;
      }
    }

    this.animating = true;
    const containerScrollTop = this.scrollSrv.getScroll(this.getTarget());
    const elOffsetTop = this.scrollSrv.getOffset(el).top;
    const targetScrollTop = containerScrollTop + elOffsetTop - (this.offsetTop || 0);
    this.scrollSrv.scrollTo(this.getTarget(), targetScrollTop, null, () => {
      this.animating = false;
      this.handleActive(linkComp);
    });
    this.click.emit(linkComp.href);
  }

  private getTarget(): Element | Window {
    return this._target || window;
  }

  private registerScrollEvent(): void {
    this.removeListen();
    this.scroll$ = fromEvent(this.getTarget(), 'scroll')
      .pipe(throttleTime(50), distinctUntilChanged())
      .subscribe(e => this.handleScroll());
    // 由于页面刷新时滚动条位置的记忆
    // 倒置在dom未渲染完成，导致计算不正确
    setTimeout(() => this.handleScroll());
  }

  private removeListen(): void {
    if (this.scroll$) {
      this.scroll$.unsubscribe();
    }
  }

  private getOffsetTop(element: HTMLElement): number {
    if (!element || !element.getClientRects().length) {
      return 0;
    }
    const rect = element.getBoundingClientRect();
    if (!rect.width && !rect.height) {
      return rect.top;
    }
    return rect.top - element.ownerDocument.documentElement.clientTop;
  }

  private clearActive(): void {
    this.links.forEach(i => i.active = false);
  }

  private handleActive(comp: AnchorLinkComponent): void {
    this.clearActive();

    comp.active = true;
    this.cdRef.detectChanges();

    const linkNode = (comp.el.nativeElement as HTMLDivElement).querySelector('.tri-anchor-link-title') as HTMLElement;
    this.ink.nativeElement.style.top = `${linkNode.offsetTop + linkNode.clientHeight / 2 - 4.5}px`;

    this.scroll.emit(comp);
  }
}
