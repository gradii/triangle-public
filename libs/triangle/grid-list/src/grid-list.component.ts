/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Directionality } from '@angular/cdk/bidi';
import { coerceNumberProperty, NumberInput } from '@angular/cdk/coercion';
import {
  AfterContentChecked,
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  ElementRef,
  Input,
  OnInit,
  Optional,
  QueryList,
  ViewEncapsulation,
} from '@angular/core';
import { TRI_GRID_LIST, TriGridListBase } from './grid-list-base.interface';
import { TriGridTileComponent } from './grid-tile.component';
import { TileCoordinator } from './tile-coordinator';
import { FitTileStyler, FixedTileStyler, RatioTileStyler, TileStyler } from './tile-styler';


// TODO(kara): Conditional (responsive) column count / row size.
// TODO(kara): Re-layout on window resize / media change (debounced).
// TODO(kara): gridTileHeader and gridTileFooter.

const TRI_FIT_MODE = 'fit';

@Component({
  selector       : 'tri-grid-list',
  exportAs       : 'triGridList',
  templateUrl    : 'grid-list.component.html',
  styleUrls      : ['../style/grid-list.scss'],
  host           : {
    'class'      : 'tri-grid-list',
    // Ensures that the "cols" input value is reflected in the DOM. This is
    // needed for the grid-list harness.
    '[attr.cols]': 'cols',
  },
  providers      : [{
    provide    : TRI_GRID_LIST,
    useExisting: TriGridListComponent
  }],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation  : ViewEncapsulation.None,
})
export class TriGridListComponent implements TriGridListBase, OnInit, AfterContentChecked {
  static ngAcceptInputType_cols: NumberInput;
  /** Query list of tiles that are being rendered. */
  @ContentChildren(TriGridTileComponent, {descendants: true}) _tiles: QueryList<TriGridTileComponent>;
  /** Used for determiningthe position of each tile in the grid. */
  private _tileCoordinator: TileCoordinator;
  /** The amount of space between tiles. This will be something like '5px' or '2em'. */
  private _gutter: string = '1px';

  /** Sets position and size styles for a tile */
  private _tileStyler: TileStyler;

  constructor(private _element: ElementRef<HTMLElement>,
              @Optional() private _dir: Directionality) {
  }

  /** Number of columns being rendered. */
  private _cols: number;

  /** Amount of columns in the grid list. */
  @Input()
  get cols(): number {
    return this._cols;
  }

  set cols(value: number) {
    this._cols = Math.max(1, Math.round(coerceNumberProperty(value)));
  }

  /**
   * Row height value passed in by user. This can be one of three types:
   * - Number value (ex: "100px"):  sets a fixed row height to that value
   * - Ratio value (ex: "4:3"): sets the row height based on width:height ratio
   * - "Fit" mode (ex: "fit"): sets the row height to total height divided by number of rows
   */
  private _rowHeight: string;

  /** Set internal representation of row height from the user-provided value. */
  @Input()
  get rowHeight(): string | number {
    return this._rowHeight;
  }

  set rowHeight(value: string | number) {
    const newValue = `${value == null ? '' : value}`;

    if (newValue !== this._rowHeight) {
      this._rowHeight = newValue;
      this._setTileStyler(this._rowHeight);
    }
  }

  /** Size of the grid list's gutter in pixels. */
  @Input()
  get gutterSize(): string {
    return this._gutter;
  }

  set gutterSize(value: string) {
    this._gutter = `${value == null ? '' : value}`;
  }

  ngOnInit() {
    this._checkCols();
    this._checkRowHeight();
  }

  /**
   * The layout calculation is fairly cheap if nothing changes, so there's little cost
   * to run it frequently.
   */
  ngAfterContentChecked() {
    this._layoutTiles();
  }

  /** Sets style on the main grid-list element, given the style name and value. */
  _setListStyle(style: [string, string | null] | null): void {
    if (style) {
      (this._element.nativeElement.style as any)[style[0]] = style[1];
    }
  }

  /** Throw a friendly error if cols property is missing */
  private _checkCols() {
    if (!this.cols) {
      throw Error(`tri-grid-list: must pass in number of columns. ` +
        `Example: <tri-grid-list cols="3">`);
    }
  }

  /** Default to equal width:height if rowHeight property is missing */
  private _checkRowHeight(): void {
    if (!this._rowHeight) {
      this._setTileStyler('1:1');
    }
  }

  /** Creates correct Tile Styler subtype based on rowHeight passed in by user */
  private _setTileStyler(rowHeight: string): void {
    if (this._tileStyler) {
      this._tileStyler.reset(this);
    }

    if (rowHeight === TRI_FIT_MODE) {
      this._tileStyler = new FitTileStyler();
    } else if (rowHeight && rowHeight.indexOf(':') > -1) {
      this._tileStyler = new RatioTileStyler(rowHeight);
    } else {
      this._tileStyler = new FixedTileStyler(rowHeight);
    }
  }

  /** Computes and applies the size and position for all children grid tiles. */
  private _layoutTiles(): void {
    if (!this._tileCoordinator) {
      this._tileCoordinator = new TileCoordinator();
    }


    const tracker = this._tileCoordinator;
    const tiles = this._tiles.filter(tile => !tile._gridList || tile._gridList === this);
    const direction = this._dir ? this._dir.value : 'ltr';

    this._tileCoordinator.update(this.cols, tiles);
    this._tileStyler.init(this.gutterSize, tracker, this.cols, direction);

    tiles.forEach((tile, index) => {
      const pos = tracker.positions[index];
      this._tileStyler.setStyle(tile, pos.row, pos.col);
    });

    this._setListStyle(this._tileStyler.getComputedHeight());
  }
}
