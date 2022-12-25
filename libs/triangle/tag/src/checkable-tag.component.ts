/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  OnInit,
  Output,
  Renderer2,
  ViewEncapsulation
} from '@angular/core';
import { TagAnimation } from '@gradii/triangle/core';

@Component({
  selector     : 'tri-checkable-tag',
  encapsulation: ViewEncapsulation.None,
  animations   : [TagAnimation],
  template     : `
    <span *ngIf="!_closed"
          class="tri-tag tri-tag-checkable"
          [class.tri-tag-pink]="color=='pink'"
          [class.tri-tag-red]="color=='red'"
          [class.tri-tag-yellow]="color=='yellow'"
          [class.tri-tag-orange]="color=='orange'"
          [class.tri-tag-cyan]="color=='cyan'"
          [class.tri-tag-green]="color=='green'"
          [class.tri-tag-blue]="color=='blue'"
          [class.tri-tag-purple]="color=='purple'"
          [class.tri-tag-has-color]="color && !_isPresetColor(color)"
          [class.tri-tag-checkable-checked]="checked"
          [style.backgroundColor]="_backgroundColor"
          [@tagAnimation]
          (@tagAnimation.done)="_afterClose($event)">
      <span class="tri-tag-text"><ng-content></ng-content></span>
      <i class="anticon anticon-cross" (click)="_close($event)" *ngIf="closable"></i>
    </span>
  `
})
export class CheckableTagComponent implements OnInit, AfterViewInit {
  _prefixCls = 'tri-tag';
  _closed = false;

  /** Whether tag is checked */
  @Input() checked = false;

  /** Whether tag is closable */
  @Input() closable = false;

  /** The tag color */
  @Input() color: string;

  /** Event: emit before close */
  @Output() beforeClose = new EventEmitter<Event>();

  /** Event: emit after close */
  @Output() close = new EventEmitter<Event>();

  /** Event: emit on change */
  @Output() change = new EventEmitter<boolean>();

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

  @HostListener('click', ['$event'])
  _handleClick(event: Event): void {
    event.preventDefault();
    this.change.emit(!this.checked);
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

  ngAfterViewInit(): void {
    this._render.addClass(this._elementRef.nativeElement, `tri-tag-root`);
  }
}
