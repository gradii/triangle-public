/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  Renderer2,
  TemplateRef,
  ViewEncapsulation
} from '@angular/core';

@Component({
  selector       : 'tri-list-item-meta',
  templateUrl    : './list-item-meta.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation  : ViewEncapsulation.None
})
export class ListItemMetaComponent {
  avatarStr = '';
  avatarTpl: TemplateRef<any>;
  @Input() title: string | TemplateRef<void>;
  @Input() description: string | TemplateRef<void>;

  constructor(public elementRef: ElementRef, private renderer: Renderer2) {
    this.renderer.addClass(elementRef.nativeElement, 'tri-list-item-meta');
  }

  @Input()
  set avatar(value: string | TemplateRef<void>) {
    if (value instanceof TemplateRef) {
      this.avatarStr = '';
      this.avatarTpl = value;
    } else {
      this.avatarStr = value;
    }
  }
}
