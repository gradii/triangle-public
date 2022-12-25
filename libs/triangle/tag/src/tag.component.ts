/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import {
  AfterViewInit, Component, ElementRef, EventEmitter, HostBinding, Input, OnInit, Output, Renderer2,
  ViewEncapsulation
} from '@angular/core';
import { TagAnimation } from '@gradii/triangle/core';

@Component({
  selector     : 'tri-tag',
  encapsulation: ViewEncapsulation.None,
  animations   : [TagAnimation],
  template     : `
    <span *ngIf="!_closed"
          class="tri-tag"
          [class.tri-tag-pink]="color=='pink'"
          [class.tri-tag-red]="color=='red'"
          [class.tri-tag-yellow]="color=='yellow'"
          [class.tri-tag-orange]="color=='orange'"
          [class.tri-tag-cyan]="color=='cyan'"
          [class.tri-tag-green]="color=='green'"
          [class.tri-tag-blue]="color=='blue'"
          [class.tri-tag-purple]="color=='purple'"
          [class.tri-tag-has-color]="color && !_isPresetColor(color)"
          [style.backgroundColor]="_backgroundColor"
          [@tagAnimation]
          (@tagAnimation.done)="_afterClose($event)">
      <span class="tri-tag-text"><ng-content></ng-content></span>
      <tri-icon svgIcon="outline:close" (click)="_close($event)" *ngIf="closable"></tri-icon>
    </span>
  `,
  styles       : [
    `:host {
      display : inline-block;
    }`
  ],
  styleUrls: ['../style/tag.scss']
})
export class TagComponent implements OnInit {
  _closed    = false;

  /** Whether tag is closable */
  @Input() closable = false;

  /** The tag color */
  @Input() color: string;

  /** Event: emit before close */
  @Output() beforeClose = new EventEmitter<Event>();

  /** Event: emit after close */
  @Output() close = new EventEmitter<Event>();

  constructor(private _elementRef: ElementRef, private _render: Renderer2) {
  }

  @HostBinding('attr.data-show')
  get _dataShow(): boolean {
    return !this._closed;
  }

  get _backgroundColor(): string {
    const isPresetColor = this._isPresetColor(this.color);
    return this.color && !isPresetColor ? this.color : null;
  }

  _afterClose(event: any): void {
    if (this._closed) {
      this.close.emit(event);
    }
  }

  _close(event: Event): void {
    this.beforeClose.emit(event);
    if (event.defaultPrevented) {
      return;
    }
    this._closed = true;
  }

  _isPresetColor(color: string): boolean {
    return /^(pink|red|yellow|orange|cyan|green|blue|purple)(-inverse)?$/.test(color);
  }

  ngOnInit() {
  }
}
