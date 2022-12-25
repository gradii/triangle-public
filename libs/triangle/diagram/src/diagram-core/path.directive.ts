/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Directive, ElementRef, Input, OnInit } from '@angular/core';

@Directive({
  selector: 'path'
})
export class PathDirective implements OnInit {
  @Input()
  ref: (ref: SVGPathElement) => void;

  constructor(public elementRef: ElementRef) {
  }

  ngOnInit() {
    if (this.ref) {
      this.ref(this.elementRef.nativeElement);
    }
  }
}
