/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import {
  AfterContentInit,
  Component,
  ElementRef,
  HostBinding,
  Input,
  Renderer2,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';

@Component({
  selector           : 'tri-spin',
  encapsulation      : ViewEncapsulation.None,
  template           : `
    <div style="margin-top: 10px; text-align: center">
      <div class="tri-spin"
           [ngClass]="{'tri-spin-spinning':spinning,'tri-spin-lg':_size=='lg','tri-spin-sm':_size=='sm','tri-spin-show-text':_tip}">
        <span class="tri-spin-dot"><i></i><i></i><i></i><i></i></span>
        <div class="tri-spin-text">{{_tip}}</div>
      </div>
    </div>
    <div class="tri-spin-container" [class.tri-spin-blur]="spinning" #ref [hidden]="ref.children.length == 0">
      <ng-content></ng-content>
    </div>

  `
})
export class SpinComponent implements AfterContentInit {
  @Input() spinning = true;
  @ViewChild('ref', {static: true}) _ref: ElementRef;
  _el: HTMLElement;

  constructor(private _elementRef: ElementRef, private _renderer: Renderer2) {
    this._el = this._elementRef.nativeElement;
  }

  _tip: string;

  @Input()
  get tip() {
    return this._tip;
  }

  set tip(value) {
    this._tip = value || '加载中...';
  }

  @HostBinding('class.tri-spin-nested-loading')
  get isNested() {
    return this.spinning && this._ref.nativeElement.childNodes.length !== 0;
  }

  _size: string;

  /**
   * The size of dot
   * spin组件中点的大小，可选值为 small default large
   */
  @Input()
  get size() {
    return this._size;
  }

  /**
   * Set size
   * 设置大小
   * @param value
   */
  set size(value) {
    this._size = {large: 'lg', small: 'sm'}[value];
  }

  ngAfterContentInit() {
    if (this._ref.nativeElement.children.length !== 0) {
      this._renderer.setStyle(this._el, 'display', 'block');
    }
  }
}
