/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import {
  Component, ElementRef, EventEmitter, Inject, Input, OnDestroy, OnInit, Renderer2,
  ViewEncapsulation
} from '@angular/core';
import { Subscription } from 'rxjs';
import { GridsterRenderer } from './gridster-renderer.service';
import { GridsterItem } from './gridster-item.interface';

@Component({
  selector     : 'gridster-preview',
  template     : '',
  styleUrls    : ['../style/gridster-preview.scss'],
  encapsulation: ViewEncapsulation.None
})
export class GridsterPreviewComponent implements OnInit, OnDestroy {
  @Input() previewStyle$: EventEmitter<GridsterItem>;
  @Input() gridRenderer: GridsterRenderer;
  private el: HTMLElement;
  private sub: Subscription;

  constructor(@Inject(ElementRef) el: ElementRef,
              @Inject(Renderer2) private renderer: Renderer2) {
    this.el = el.nativeElement;
  }

  ngOnInit(): void {
    this.sub = this.previewStyle$.subscribe(options => this.previewStyle(options));
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    // @ts-ignore
    delete this.el;
  }

  private previewStyle(item: GridsterItem): void {
    if (item) {
      this.renderer.setStyle(this.el, 'display', 'block');
      this.gridRenderer.updateItem(this.el, item, this.renderer);
    } else {
      this.renderer.setStyle(this.el, 'display', '');
    }
  }
}
