/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Component, ContentChildren, Directive, HostBinding, Input, OnInit, QueryList, ViewEncapsulation } from '@angular/core';


@Directive({
  selector: '[triInputGroupAddonBefore]'
})
export class InputGroupAddonBeforeDirective {
}

@Directive({
  selector: '[triInputGroupAddonAfter]'
})
export class InputGroupAddonAfterDirective {
}


@Component({
  selector     : 'tri-input-group',
  encapsulation: ViewEncapsulation.None,
  template     : `
    <span class="tri-input-group-addon" *ngIf="_addOnBeforeChildren.length">
      <ng-content select="[triInputGroupAddonBefore]"></ng-content>
    </span>
    <ng-content></ng-content>
    <span class="tri-input-group-addon" *ngIf="_addOnAfterChildren.length">
      <ng-content select="[triInputGroupAddonAfter]"></ng-content>
    </span>
  `,
  host         : {
    'class': 'tri-input-group',
  },
  styleUrls    : [
    `../style/input.scss`,
    `../style/input-group.scss`,
    `../style/search-input.scss`
  ]
})
export class InputGroupComponent implements OnInit {

  /**
   * all size in `tri-input-group`
   * `tri-input-group`  中所有的  `tri-input`  的大小
   */
  @Input() size: string;

  @HostBinding(`class.tri-input-group-lg`)
  get _isLarge(): boolean {
    return this.size === 'lg';
  }

  @HostBinding(`class.tri-input-group-sm`)
  get _isSmall(): boolean {
    return this.size === 'sm';
  }

  /**
   * addon before
   * 设置前置标签
   */
  @ContentChildren(InputGroupAddonBeforeDirective, {descendants: true})
  _addOnBeforeChildren: QueryList<InputGroupAddonBeforeDirective>;

  /**
   * addon after
   * 设置后置标签
   */
  @ContentChildren(InputGroupAddonAfterDirective, {descendants: true})
  _addOnAfterChildren: QueryList<InputGroupAddonAfterDirective>;

  ngOnInit() {
  }
}
