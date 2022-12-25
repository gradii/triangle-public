/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { animate, state, style, transition, trigger } from '@angular/animations';
import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';
import { Component, Host, HostBinding, Input } from '@angular/core';
import { AccordionComponent } from './accordion.component';

@Component({
  selector  : 'tri-accordion-item',
  template  : `
    <div class="tri-accordion-header"
         [class.expanded]="_expanded"
         [class.accordiond]="!_expanded"
         [attr.aria-expanded]="_expanded" (click)="clickHeader($event)"
         role="tab">
      <tri-icon class="arrow" svgIcon="outline:right"></tri-icon>
      <ng-template [ngIf]="title">
        {{ title }}
      </ng-template>
      <ng-template [ngIf]="!title">
        <ng-content select="[accordion-title]"></ng-content>
      </ng-template>
    </div>
    <div class="tri-accordion-content"
         [@accordionState]="_expanded?'active':'inactive'">
      <div class="tri-accordion-content-box">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  host      : {
    '[class.tri-accordion-item]': '_accordionItem',
    '[class.tri-accordion-item-disabled]': 'disabled'
  },
  animations: [
    trigger('accordionState', [
      state(
        'inactive',
        style({
          filter: 'opacity(0)',
          height: 0
        })
      ),
      state(
        'active',
        style({
          filter: 'opacity(100%)',
          height: '*'
        })
      ),
      transition('inactive => active', animate('150ms ease-in')),
      transition('active => inactive', animate('150ms ease-out'))
    ])
  ]
})
export class AccordionItemComponent {

  _accordionItem = true;
  /**
   * The title of accordion
   * 面板头内容
   */
  @Input() title: string;

  private _disabled = false;
  /**
   * Whether current tab is disabled
   * 当前tab是否禁止选中
   */
  @Input()
  get disabled(): boolean {
    return this._disabled;
  }

  set disabled(value: boolean) {
    this._disabled = coerceBooleanProperty(value);
  }

  constructor(@Host() private _accordion: AccordionComponent) {
    this._accordion.addTab(this);
  }

  _expanded: boolean;

  /**
   * Whether current tab is choosed
   * 当前tab是否被选中
   */
  @Input()
  get expanded(): boolean {
    return this._expanded;
  }

  set expanded(active: boolean) {
    active = coerceBooleanProperty(active);
    if (this._expanded === active) {
      return;
    }
    if (!this._disabled) {
      this._expanded = coerceBooleanProperty(active);
    }
  }

  clickHeader($event: any) {
    this.expanded = !this.expanded;
    /** trigger host accordionSet click event */
    this._accordion.click(this);
  }

  static ngAcceptInputType_expanded: BooleanInput;
  static ngAcceptInputType_disabled: BooleanInput;
}
