/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  ElementRef,
  Input,
  OnInit,
  Renderer2,
  SimpleChanges,
  TemplateRef,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { TimelineMode } from './timeline.component';

@Component({
  selector           : 'tri-timeline-item',
  encapsulation      : ViewEncapsulation.None,
  changeDetection    : ChangeDetectionStrategy.OnPush,
  template           : `
      <li
              class="tri-timeline-item"
              [class.tri-timeline-item-last]="isLast"
              #liTemplate>
          <div class="tri-timeline-item-tail"></div>
          <div class="tri-timeline-item-head"
               [class.tri-timeline-item-head-red]="color === 'red'"
               [class.tri-timeline-item-head-blue]="color === 'blue'"
               [class.tri-timeline-item-head-green]="color === 'green'"
               [class.tri-timeline-item-head-custom]="!!dotTemplate">
              <ng-template [ngTemplateOutlet]="dotTemplate"></ng-template>
          </div>
          <div class="tri-timeline-item-content"
               [class.tri-timeline-item-content-right]="position === 'right'"
               [class.tri-timeline-item-content-left]="position === 'left'">
              <ng-content></ng-content>
          </div>
          <!--other content-->
          <div class="tri-timeline-item-content"
               [class.tri-timeline-item-content-right]="position === 'left'"
               [class.tri-timeline-item-content-left]="position === 'right'">
              <ng-template [ngTemplateOutlet]="otherTemplate"></ng-template>
          </div>
      </li>`,
  styleUrls          : []
})
export class TimelineItemComponent implements OnInit {
  @ViewChild('liTemplate', {static: false}) liTemplate: ElementRef;
  @Input() color: string = 'blue';
  @ContentChild('dotTemplate', {static: false})
  dotTemplate: TemplateRef<void>;

  isLast = false;
  position: TimelineMode | undefined;

  @Input()
  otherContent: string;

  @ContentChild('otherTemplate', {read: TemplateRef, static: false})
  otherTemplate: TemplateRef<void>;

  constructor(private renderer: Renderer2, private cdr: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    this.tryUpdateCustomColor();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.color) {
      this.tryUpdateCustomColor();
    }
  }

  detectChanges(): void {
    this.cdr.detectChanges();
  }

  private tryUpdateCustomColor(): void {
    const defaultColors = ['blue', 'red', 'green'];
    const circle = this.liTemplate.nativeElement.querySelector('.tri-timeline-item-head');
    if (defaultColors.indexOf(this.color) === -1) {
      this.renderer.setStyle(circle, 'border-color', this.color);
    } else {
      this.renderer.removeStyle(circle, 'border-color');
    }
  }
}
