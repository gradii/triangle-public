/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import {
  AfterContentInit,
  ChangeDetectorRef,
  Component,
  ContentChild,
  ContentChildren,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  QueryList,
  SimpleChanges,
  TemplateRef,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TimelineItemComponent } from './timeline-item.component';

export type TimelineMode =
  'left'
  | 'alternate'
  | 'right'
  | 'both-but-other-left'
  | 'both-but-other-right';

const reverseChildNodes = function (parent: HTMLElement): void {
  const children = parent.childNodes;
  let length = children.length;
  if (length) {
    const nodes: Node[] = [];
    children.forEach((node, i) => nodes[i] = node);
    while (length--) {
      parent.appendChild(nodes[length]);
    }
  }
};

@Component({
  selector     : 'tri-timeline',
  encapsulation: ViewEncapsulation.None,
  template     : `
      <ul class="tri-timeline"
          [class.tri-timeline-right]="mode === 'right'"
          [class.tri-timeline-alternate]="mode === 'alternate' || mode === 'both-but-other-left' || mode === 'both-but-other-right'"
          [class.tri-timeline-pending]="!!pending"
          [class.tri-timeline-reverse]="reverse"
          #timeline>
          <ng-content></ng-content>
          <li *ngIf="pending" class="tri-timeline-item tri-timeline-item-pending">
              <div class="tri-timeline-item-tail"></div>
              <div class="tri-timeline-item-head tri-timeline-item-head-blue">
                  {{pendingDot}}<i *ngIf="!pendingDot"
                                   class="anticon anticon-loading anticon-spin"></i>
              </div>
              <div class="tri-timeline-item-content">
                  <ng-template [ngTemplateOutlet]="_pendingContent">
                  </ng-template>
              </div>
          </li>
      </ul>`
})
export class TimelineComponent implements AfterContentInit, OnChanges, OnDestroy {
  @ViewChild('timeline', {static: false}) timeline: ElementRef<HTMLElement>;
  @ContentChildren(TimelineItemComponent) listOfTimeLine: QueryList<TimelineItemComponent>;
  @ContentChild('pending', {static: false}) _pendingContent: TemplateRef<void>;

  @Input() mode: TimelineMode;
  @Input() pending: string | boolean | TemplateRef<void>;
  @Input() pendingDot: string | TemplateRef<void>;
  @Input() reverse: boolean = false;

  isPendingBoolean: boolean = false;

  private destroy$ = new Subject<void>();

  constructor(private cdr: ChangeDetectorRef) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    const modeChanges = changes.mode;
    const reverseChanges = changes.reverse;
    const pendingChanges = changes.pending;

    if (modeChanges && (modeChanges.previousValue !== modeChanges.currentValue || modeChanges.isFirstChange())) {
      this.updateChildren();
    }
    if (reverseChanges && reverseChanges.previousValue !== reverseChanges.currentValue && !reverseChanges.isFirstChange()) {
      this.reverseChildTimelineDots();
    }
    if (pendingChanges) {
      this.isPendingBoolean = pendingChanges.currentValue === true;
    }
  }

  ngAfterContentInit(): void {
    this.updateChildren();
    if (this.listOfTimeLine) {
      this.listOfTimeLine.changes.pipe(takeUntil(this.destroy$)).subscribe(() => {
        this.updateChildren();
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateChildren(): void {
    if (this.listOfTimeLine && this.listOfTimeLine.length) {
      const length = this.listOfTimeLine.length;
      this.listOfTimeLine.toArray().forEach((item, index) => {
        item.isLast = !this.reverse ? index === length - 1 : index === 0;
        if (this.mode === 'left' || !this.mode) {
          item.position = undefined;
        } else if (this.mode === 'right') {
          item.position = 'left';
        } else if (this.mode === 'alternate') {
          item.position = index % 2 === 0 ? 'right' : 'left';
        } else if (this.mode === 'both-but-other-left') {
          item.position = 'right';
        } else if (this.mode === 'both-but-other-right') {
          item.position = 'left';
        }
        item.detectChanges();
      });
      this.cdr.markForCheck();
    }
  }

  private reverseChildTimelineDots(): void {
    reverseChildNodes(this.timeline.nativeElement as HTMLElement);
    this.updateChildren();
  }
}
