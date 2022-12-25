import { DividerTipDirective } from './divider-tip.directive';
import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';
import { ChangeDetectionStrategy, Component, ContentChild, ElementRef, Input, ViewEncapsulation } from '@angular/core';


@Component({
  selector           : 'tri-divider',
  exportAs           : 'triDivider',
  preserveWhitespaces: false,
  encapsulation      : ViewEncapsulation.None,
  changeDetection    : ChangeDetectionStrategy.OnPush,
  template           : `
    <span class="tri-divider-inner-text" *ngIf="dividerTip">
      <ng-content select="tri-divider-tip,[triDividerTip]"></ng-content>
    </span>
  `,
  host               : {
    class                                 : 'tri-divider',
    '[class.tri-divider-horizontal]'      : `variant === 'horizontal'`,
    '[class.tri-divider-vertical]'        : `variant === 'vertical'`,
    '[class.tri-divider-plain]'           : `plain`,
    '[class.tri-divider-with-text]'       : `dividerTip`,
    '[class.tri-divider-with-text-left]'  : `orientation === 'left'`,
    '[class.tri-divider-with-text-right]' : `orientation === 'right'`,
    '[class.tri-divider-with-text-center]': `orientation === 'center'`,
    '[class.tri-divider-dashed]'          : `dashed`
  },
  styleUrls: ['../style/divider.scss']
})
export class DividerComponent {
  @Input() variant: 'horizontal' | 'vertical'       = 'horizontal';
  @Input() orientation: 'left' | 'right' | 'center' = 'center';

  private _dashed = false;

  @Input()
  get dashed(): boolean {
    return this._dashed;
  }

  set dashed(value: boolean) {
    this._dashed = coerceBooleanProperty(value);
  }

  @Input() plain = false;

  @ContentChild(DividerTipDirective)
  dividerTip: DividerTipDirective;

  constructor(public elementRef: ElementRef) {
  }

  static ngAcceptInputType_dashed: BooleanInput;
  static ngAcceptInputType_plain: BooleanInput;
}
