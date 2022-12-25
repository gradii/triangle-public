/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import {
  coerceNumberProperty,
  NumberInput
} from '@angular/cdk/coercion';
import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  Directive,
  ElementRef,
  Inject,
  Input,
  Optional,
  QueryList,
  ViewEncapsulation,
} from '@angular/core';
import {
  setLines,
  TriLine
} from '@gradii/triangle/core';
import {
  TRI_GRID_LIST,
  TriGridListBase
} from './grid-list-base.interface';

@Component({
  selector       : 'tri-grid-tile',
  exportAs       : 'triGridTile',
  host           : {
    'class': 'tri-grid-tile',
    // Ensures that the "rowspan" and "colspan" input value is reflected in
    // the DOM. This is needed for the grid-tile harness.
    '[attr.rowspan]': 'rowspan',
    '[attr.colspan]': 'colspan'
  },
  templateUrl    : 'grid-tile.component.html',
  styleUrls      : ['../style/grid-list.scss'],
  encapsulation  : ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TriGridTileComponent {


  constructor(
    private _element: ElementRef<HTMLElement>,
    @Optional() @Inject(TRI_GRID_LIST) public _gridList?: TriGridListBase) {
  }

  _rowspan: number = 1;

  /** Amount of rows that the grid tile takes up. */
  @Input()
  get rowspan(): number {
    return this._rowspan;
  }

  set rowspan(value: number) {
    this._rowspan = Math.round(coerceNumberProperty(value));
  }

  _colspan: number = 1;

  /** Amount of columns that the grid tile takes up. */
  @Input()
  get colspan(): number {
    return this._colspan;
  }

  set colspan(value: number) {
    this._colspan = Math.round(coerceNumberProperty(value));
  }

  /**
   * Sets the style of the grid-tile element.  Needs to be set manually to avoid
   * "Changed after checked" errors that would occur with HostBinding.
   */
  _setStyle(property: string, value: any): void {
    (this._element.nativeElement.style as any)[property] = value;
  }

  static ngAcceptInputType_rowspan: NumberInput;
  static ngAcceptInputType_colspan: NumberInput;
}

@Component({
  selector       : 'tri-grid-tile-header, tri-grid-tile-footer',
  templateUrl    : 'grid-tile-text.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation  : ViewEncapsulation.None,
})
export class TriGridTileText implements AfterContentInit {
  @ContentChildren(TriLine, {descendants: true}) _lines: QueryList<TriLine>;

  constructor(private _element: ElementRef<HTMLElement>) {
  }

  ngAfterContentInit() {
    setLines(this._lines, this._element);
  }
}

/**
 * Directive whose purpose is to add the tri- CSS styling to this selector.
 * @docs-private
 */
@Directive({
  selector: '[tri-grid-avatar], [triGridAvatar]',
  host    : {'class': 'tri-grid-avatar'}
})
export class TriGridAvatarCssTriStyler {
}

/**
 * Directive whose purpose is to add the tri- CSS styling to this selector.
 * @docs-private
 */
@Directive({
  selector: 'tri-grid-tile-header',
  host    : {'class': 'tri-grid-tile-header'}
})
export class TriGridTileHeaderCssTriStyler {
}

/**
 * Directive whose purpose is to add the tri- CSS styling to this selector.
 * @docs-private
 */
@Directive({
  selector: 'tri-grid-tile-footer',
  host    : {'class': 'tri-grid-tile-footer'}
})
export class TriGridTileFooterCssTriStyler {
}
