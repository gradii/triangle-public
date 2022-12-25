/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Component, ContentChild, ElementRef, Input, ViewEncapsulation } from '@angular/core';
import { AnchorLinkTemplateDirective } from './anchor-link-template.directive';

import { AnchorComponent } from './anchor.component';

@Component({
  selector     : 'tri-anchor-link, [triAnchorLink], [tri-anchor-link]',
  encapsulation: ViewEncapsulation.None,
  template     : `
    <a (click)="goToClick($event)" href="{{href}}" class="tri-anchor-link-title" title="{{title}}">
      <span *ngIf="!contentTemplate">{{title}}</span>
      <ng-template *ngIf="contentTemplate" [ngTemplateOutlet]="contentTemplate.templateRef"></ng-template>
    </a>
    <ng-content></ng-content>
  `,
  host         : {
    '[class.tri-anchor-link]'       : 'true',
    '[class.tri-anchor-link-active]': 'active',
    'style'                         : 'display:block'
  }
})
export class AnchorLinkComponent {
  /**
   * The href of anchor
   * 锚点链接
   */
  @Input() href: string;

  /**
   * The title
   * 文字内容
   */
  @Input() title: string;

  /**
   * The template used for content
   * 文字内容，会覆盖掉  `title`  的内容
   */
  @ContentChild(AnchorLinkTemplateDirective, {static: false}) contentTemplate: AnchorLinkTemplateDirective;

  active: boolean = false;

  constructor(public el: ElementRef, private _anchorComp: AnchorComponent) {
  }

  ngOnInit() {
    this._anchorComp.registerLink(this);
  }

  goToClick(e: Event) {
    e.preventDefault();
    e.stopPropagation();
    this._anchorComp.handleScrollTo(this);
    // return false;
  }

  ngOnDestroy(): void {
    this._anchorComp.unregisterLink(this);
  }
}
