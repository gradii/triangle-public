/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { ConnectedPosition } from '@angular/cdk/overlay';
import {
  ChangeDetectionStrategy, Component, ContentChild, ContentChildren, Input, OnInit, QueryList,
  ViewEncapsulation
} from '@angular/core';
import {
  _countGroupLabelsBeforeOption, _getOptionScrollPosition, TRI_OPTGROUP,
  TRI_OPTION_PARENT_COMPONENT, TriOptgroup, TriOption
} from '@gradii/triangle/core';
import { TriFormFieldControl } from '@gradii/triangle/form-field';
import { take, takeUntil } from 'rxjs/operators';
import {
  SELECT_ITEM_HEIGHT_EM, SELECT_MULTIPLE_PANEL_PADDING_X, SELECT_PANEL_INDENT_PADDING_X,
  SELECT_PANEL_MAX_HEIGHT, SELECT_PANEL_PADDING_X, SELECT_PANEL_VIEWPORT_PADDING
} from './const';
import { triSelectAnimations } from './select-animations';
import { _TriSelectBase } from './select-base';
import { TriSelectChange } from './select-change';
import { TRI_SELECT_TRIGGER, TriSelectTrigger } from './select-trigger';

@Component({
  selector       : 'tri-select',
  exportAs       : 'triSelect',
  templateUrl    : 'select.html',
  styleUrls      : ['../style/select.scss'],
  inputs         : ['disabled', 'disableRipple', 'tabIndex'],
  encapsulation  : ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host           : {
    'role'                        : 'combobox',
    'aria-autocomplete'           : 'none',
    'aria-haspopup'               : 'true',
    'class'                       : 'tri-select',
    '[class.lg]'                  : 'size==="lg" || size === "large"',
    '[class.sm]'                  : 'size==="sm" || size === "small"',
    '[attr.id]'                   : 'id',
    '[attr.tabindex]'             : 'tabIndex',
    '[attr.aria-controls]'        : 'panelOpen ? id + "-panel" : null',
    '[attr.aria-expanded]'        : 'panelOpen',
    '[attr.aria-label]'           : 'ariaLabel || null',
    '[attr.aria-required]'        : 'required.toString()',
    '[attr.aria-disabled]'        : 'disabled.toString()',
    '[attr.aria-invalid]'         : 'errorState',
    '[attr.aria-describedby]'     : '_ariaDescribedby || null',
    '[attr.aria-activedescendant]': '_getAriaActiveDescendant()',
    '[class.tri-select-disabled]' : 'disabled',
    '[class.tri-select-invalid]'  : 'errorState',
    '[class.tri-select-required]' : 'required',
    '[class.tri-select-empty]'    : 'empty',
    '[class.tri-select-multiple]' : 'multiple',
    '(keydown)'                   : '_handleKeydown($event)',
    '(focus)'                     : '_onFocus()',
    '(blur)'                      : '_onBlur()',
  },
  animations     : [triSelectAnimations.transformPanelWrap, triSelectAnimations.transformPanel],
  providers      : [
    {provide: TriFormFieldControl, useExisting: TriSelect},
    {provide: TRI_OPTION_PARENT_COMPONENT, useExisting: TriSelect},
  ],
})
export class TriSelect extends _TriSelectBase<TriSelectChange> implements OnInit {
  /** The scroll position of the overlay panel, calculated to center the selected option. */
  private _scrollTop = 0;

  /** The last measured value for the trigger's client bounding rect. */
  _triggerRect: ClientRect;

  /** The cached font-size of the trigger element. */
  _triggerFontSize = 0;

  /** The value of the select panel's transform-origin property. */
  _transformOrigin: string = 'top';

  /**
   * The y-offset of the overlay panel in relation to the trigger's top start corner.
   * This must be adjusted to align the selected option text over the trigger text.
   * when the panel opens. Will change based on the y-position of the selected option.
   */
  _offsetY = 0;

  @Input() size: string;

  @ContentChildren(TriOption, {descendants: true}) options: QueryList<TriOption>;

  @ContentChildren(TRI_OPTGROUP, {descendants: true}) optionGroups: QueryList<TriOptgroup>;

  @ContentChild(TRI_SELECT_TRIGGER) customTrigger: TriSelectTrigger;

  _positions: ConnectedPosition[] = [
    {
      originX : 'start',
      originY : 'top',
      overlayX: 'start',
      overlayY: 'top',
    },
    {
      originX : 'start',
      originY : 'bottom',
      overlayX: 'start',
      overlayY: 'bottom',
    },
  ];

  /**
   * Calculates the scroll position of the select's overlay panel.
   *
   * Attempts to center the selected option in the panel. If the option is
   * too high or too low in the panel to be scrolled to the center, it clamps the
   * scroll position to the min or max scroll positions respectively.
   */
  _calculateOverlayScroll(selectedIndex: number, scrollBuffer: number, maxScroll: number): number {
    const itemHeight                = this._getItemHeight();
    const optionOffsetFromScrollTop = itemHeight * selectedIndex;
    const halfOptionHeight          = itemHeight / 2;

    // Starts at the optionOffsetFromScrollTop, which scrolls the option to the top of the
    // scroll container, then subtracts the scroll buffer to scroll the option down to
    // the center of the overlay panel. Half the option height must be re-added to the
    // scrollTop so the option is centered based on its middle, not its top edge.
    const optimalScrollPosition = optionOffsetFromScrollTop - scrollBuffer + halfOptionHeight;
    return Math.min(Math.max(0, optimalScrollPosition), maxScroll);
  }

  override ngOnInit() {
    super.ngOnInit();
    this._viewportRuler
      .change()
      .pipe(takeUntil(this._destroy))
      .subscribe(() => {
        if (this.panelOpen) {
          this._triggerRect = this.trigger.nativeElement.getBoundingClientRect();
          this._changeDetectorRef.markForCheck();
        }
      });
  }

  override open(): void {
    if (super._canOpen()) {
      super.open();
      this._triggerRect = this.trigger.nativeElement.getBoundingClientRect();
      // Note: The computed font-size will be a string pixel value (e.g. "16px").
      // `parseInt` ignores the trailing 'px' and converts this to a number.
      this._triggerFontSize = parseInt(
        getComputedStyle(this.trigger.nativeElement).fontSize || '0',
      );
      this._calculateOverlayPosition();

      // Set the font size on the panel element once it exists.
      this._ngZone.onStable.pipe(take(1)).subscribe(() => {
        if (
          this._triggerFontSize &&
          this._overlayDir.overlayRef &&
          this._overlayDir.overlayRef.overlayElement
        ) {
          this._overlayDir.overlayRef.overlayElement.style.fontSize = `${this._triggerFontSize}px`;
        }
      });
    }
  }

  /** Scrolls the active option into view. */
  protected _scrollOptionIntoView(index: number): void {
    const labelCount = _countGroupLabelsBeforeOption(index, this.options, this.optionGroups);
    const itemHeight = this._getItemHeight();

    if (index === 0 && labelCount === 1) {
      // If we've got one group label before the option and we're at the top option,
      // scroll the list to the top. This is better UX than scrolling the list to the
      // top of the option, because it allows the user to read the top group's label.
      this.panel.nativeElement.scrollTop = 0;
    } else {
      this.panel.nativeElement.scrollTop = _getOptionScrollPosition(
        (index + labelCount) * itemHeight,
        itemHeight,
        this.panel.nativeElement.scrollTop,
        SELECT_PANEL_MAX_HEIGHT,
      );
    }
  }

  protected _positioningSettled() {
    this._calculateOverlayOffsetX();
    this.panel.nativeElement.scrollTop = this._scrollTop;
  }

  protected override _panelDoneAnimating(isOpen: boolean) {
    if (this.panelOpen) {
      this._scrollTop = 0;
    } else {
      this._overlayDir.offsetX = 0;
      this._changeDetectorRef.markForCheck();
    }

    super._panelDoneAnimating(isOpen);
  }

  protected _getChangeEvent(value: any) {
    return new TriSelectChange(this, value);
  }

  /**
   * Sets the x-offset of the overlay panel in relation to the trigger's top start corner.
   * This must be adjusted to align the selected option text over the trigger text when
   * the panel opens. Will change based on LTR or RTL text direction. Note that the offset
   * can't be calculated until the panel has been attached, because we need to know the
   * content width in order to constrain the panel within the viewport.
   */
  private _calculateOverlayOffsetX(): void {
    const overlayRect  = this._overlayDir.overlayRef.overlayElement.getBoundingClientRect();
    const viewportSize = this._viewportRuler.getViewportSize();
    const isRtl        = this._isRtl();
    const paddingWidth = this.multiple
      ? SELECT_MULTIPLE_PANEL_PADDING_X + SELECT_PANEL_PADDING_X
      : SELECT_PANEL_PADDING_X * 2;
    let offsetX: number;

    // Adjust the offset, depending on the option padding.
    if (this.multiple) {
      offsetX = SELECT_MULTIPLE_PANEL_PADDING_X;
    } else if (this.disableOptionCentering) {
      offsetX = SELECT_PANEL_PADDING_X;
    } else {
      const selected = this._selectionModel.selected[0] || this.options.first;
      offsetX        = selected && selected.group ? SELECT_PANEL_INDENT_PADDING_X : SELECT_PANEL_PADDING_X;
    }

    // Invert the offset in LTR.
    if (!isRtl) {
      offsetX *= -1;
    }

    // Determine how much the select overflows on each side.
    const leftOverflow  = 0 - (overlayRect.left + offsetX - (isRtl ? paddingWidth : 0));
    const rightOverflow =
            overlayRect.right + offsetX - viewportSize.width + (isRtl ? 0 : paddingWidth);

    // If the element overflows on either side, reduce the offset to allow it to fit.
    if (leftOverflow > 0) {
      offsetX += leftOverflow + SELECT_PANEL_VIEWPORT_PADDING;
    } else if (rightOverflow > 0) {
      offsetX -= rightOverflow + SELECT_PANEL_VIEWPORT_PADDING;
    }

    // Set the offset directly in order to avoid having to go through change detection and
    // potentially triggering "changed after it was checked" errors. Round the value to avoid
    // blurry content in some browsers.
    this._overlayDir.offsetX = Math.round(offsetX);
    this._overlayDir.overlayRef.updatePosition();
  }

  /**
   * Calculates the y-offset of the select's overlay panel in relation to the
   * top start corner of the trigger. It has to be adjusted in order for the
   * selected option to be aligned over the trigger when the panel opens.
   */
  private _calculateOverlayOffsetY(
    selectedIndex: number,
    scrollBuffer: number,
    maxScroll: number,
  ): number {
    const itemHeight             = this._getItemHeight();
    const optionHeightAdjustment = (itemHeight - this._triggerRect.height) / 2;
    const maxOptionsDisplayed    = Math.floor(SELECT_PANEL_MAX_HEIGHT / itemHeight);
    let optionOffsetFromPanelTop: number;

    // Disable offset if requested by user by returning 0 as value to offset
    if (this.disableOptionCentering) {
      return 0;
    }

    if (this._scrollTop === 0) {
      optionOffsetFromPanelTop = selectedIndex * itemHeight;
    } else if (this._scrollTop === maxScroll) {
      const firstDisplayedIndex  = this._getItemCount() - maxOptionsDisplayed;
      const selectedDisplayIndex = selectedIndex - firstDisplayedIndex;

      // The first item is partially out of the viewport. Therefore we need to calculate what
      // portion of it is shown in the viewport and account for it in our offset.
      const partialItemHeight =
              itemHeight - ((this._getItemCount() * itemHeight - SELECT_PANEL_MAX_HEIGHT) % itemHeight);

      // Because the panel height is longer than the height of the options alone,
      // there is always extra padding at the top or bottom of the panel. When
      // scrolled to the very bottom, this padding is at the top of the panel and
      // must be added to the offset.
      optionOffsetFromPanelTop = selectedDisplayIndex * itemHeight + partialItemHeight;
    } else {
      // If the option was scrolled to the middle of the panel using a scroll buffer,
      // its offset will be the scroll buffer minus the half height that was added to
      // center it.
      optionOffsetFromPanelTop = scrollBuffer - itemHeight / 2;
    }

    // The final offset is the option's offset from the top, adjusted for the height difference,
    // multiplied by -1 to ensure that the overlay moves in the correct direction up the page.
    // The value is rounded to prevent some browsers from blurring the content.
    return Math.round(optionOffsetFromPanelTop * -1 - optionHeightAdjustment);
  }

  /**
   * Checks that the attempted overlay position will fit within the viewport.
   * If it will not fit, tries to adjust the scroll position and the associated
   * y-offset so the panel can open fully on-screen. If it still won't fit,
   * sets the offset back to 0 to allow the fallback position to take over.
   */
  private _checkOverlayWithinViewport(maxScroll: number): void {
    const itemHeight   = this._getItemHeight();
    const viewportSize = this._viewportRuler.getViewportSize();

    const topSpaceAvailable    = this._triggerRect.top - SELECT_PANEL_VIEWPORT_PADDING;
    const bottomSpaceAvailable =
            viewportSize.height - this._triggerRect.bottom - SELECT_PANEL_VIEWPORT_PADDING;

    const panelHeightTop    = Math.abs(this._offsetY);
    const totalPanelHeight  = Math.min(this._getItemCount() * itemHeight, SELECT_PANEL_MAX_HEIGHT);
    const panelHeightBottom = totalPanelHeight - panelHeightTop - this._triggerRect.height;

    if (panelHeightBottom > bottomSpaceAvailable) {
      this._adjustPanelUp(panelHeightBottom, bottomSpaceAvailable);
    } else if (panelHeightTop > topSpaceAvailable) {
      this._adjustPanelDown(panelHeightTop, topSpaceAvailable, maxScroll);
    } else {
      this._transformOrigin = this._getOriginBasedOnOption();
    }
  }

  /** Adjusts the overlay panel up to fit in the viewport. */
  private _adjustPanelUp(panelHeightBottom: number, bottomSpaceAvailable: number) {
    // Browsers ignore fractional scroll offsets, so we need to round.
    const distanceBelowViewport = Math.round(panelHeightBottom - bottomSpaceAvailable);

    // Scrolls the panel up by the distance it was extending past the boundary, then
    // adjusts the offset by that amount to move the panel up into the viewport.
    this._scrollTop -= distanceBelowViewport;
    this._offsetY -= distanceBelowViewport;
    this._transformOrigin = this._getOriginBasedOnOption();

    // If the panel is scrolled to the very top, it won't be able to fit the panel
    // by scrolling, so set the offset to 0 to allow the fallback position to take
    // effect.
    if (this._scrollTop <= 0) {
      this._scrollTop       = 0;
      this._offsetY         = 0;
      this._transformOrigin = `50% bottom 0px`;
    }
  }

  /** Adjusts the overlay panel down to fit in the viewport. */
  private _adjustPanelDown(panelHeightTop: number, topSpaceAvailable: number, maxScroll: number) {
    // Browsers ignore fractional scroll offsets, so we need to round.
    const distanceAboveViewport = Math.round(panelHeightTop - topSpaceAvailable);

    // Scrolls the panel down by the distance it was extending past the boundary, then
    // adjusts the offset by that amount to move the panel down into the viewport.
    this._scrollTop += distanceAboveViewport;
    this._offsetY += distanceAboveViewport;
    this._transformOrigin = this._getOriginBasedOnOption();

    // If the panel is scrolled to the very bottom, it won't be able to fit the
    // panel by scrolling, so set the offset to 0 to allow the fallback position
    // to take effect.
    if (this._scrollTop >= maxScroll) {
      this._scrollTop       = maxScroll;
      this._offsetY         = 0;
      this._transformOrigin = `50% top 0px`;
      return;
    }
  }

  /** Calculates the scroll position and x- and y-offsets of the overlay panel. */
  private _calculateOverlayPosition(): void {
    const itemHeight            = this._getItemHeight();
    const items                 = this._getItemCount();
    const panelHeight           = Math.min(items * itemHeight, SELECT_PANEL_MAX_HEIGHT);
    const scrollContainerHeight = items * itemHeight;

    // The farthest the panel can be scrolled before it hits the bottom
    const maxScroll = scrollContainerHeight - panelHeight;

    // If no value is selected we open the popup to the first item.
    let selectedOptionOffset: number;

    if (this.empty) {
      selectedOptionOffset = 0;
    } else {
      selectedOptionOffset = Math.max(
        this.options.toArray().indexOf(this._selectionModel.selected[0]),
        0,
      );
    }

    selectedOptionOffset += _countGroupLabelsBeforeOption(
      selectedOptionOffset,
      this.options,
      this.optionGroups,
    );

    // We must maintain a scroll buffer so the selected option will be scrolled to the
    // center of the overlay panel rather than the top.
    const scrollBuffer = panelHeight / 2;
    this._scrollTop    = this._calculateOverlayScroll(selectedOptionOffset, scrollBuffer,
      maxScroll);
    this._offsetY      = this._calculateOverlayOffsetY(selectedOptionOffset, scrollBuffer,
      maxScroll);

    this._checkOverlayWithinViewport(maxScroll);
  }

  /** Sets the transform origin point based on the selected option. */
  private _getOriginBasedOnOption(): string {
    const itemHeight             = this._getItemHeight();
    const optionHeightAdjustment = (itemHeight - this._triggerRect.height) / 2;
    const originY                = Math.abs(this._offsetY) - optionHeightAdjustment
      + itemHeight / 2;
    return `50% ${originY}px 0px`;
  }

  /** Calculates the height of the select's options. */
  private _getItemHeight(): number {
    return this._triggerFontSize * SELECT_ITEM_HEIGHT_EM;
  }

  /** Calculates the amount of items in the select. This includes options and group labels. */
  private _getItemCount(): number {
    return this.options.length + this.optionGroups.length;
  }
}
