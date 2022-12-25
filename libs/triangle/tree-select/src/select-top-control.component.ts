/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  Renderer2,
  TemplateRef,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { ZoomAnimation } from '@gradii/triangle/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { OptionComponent } from './option.component';
import { SelectService } from './select.service';

@Component({
  selector           : '[tri-select-top-control]',
  animations         : [ZoomAnimation],
  changeDetection    : ChangeDetectionStrategy.OnPush,
  encapsulation      : ViewEncapsulation.None,
  templateUrl        : './select-top-control.component.html'
})
export class SelectTopControlComponent implements OnInit, OnDestroy {
  inputValue: string;
  isComposing = false;
  @ViewChild('inputElement', {static: false}) inputElement: ElementRef;
  @Input() showSearch = false;
  @Input() placeHolder: string;
  @Input() open = false;
  @Input() maxTagCount: number;
  @Input() allowClear = false;
  @Input() showArrow = true;
  @Input() loading = false;
  @Input() suffixIcon: TemplateRef<any>;
  @Input() clearIcon: TemplateRef<any>;
  @Input() removeIcon: TemplateRef<any>;
  // tslint:disable-next-line:no-any
  @Input() maxTagPlaceholder: TemplateRef<{ $implicit: any[] }>;
  @Input() tokenSeparators: string[] = [];
  private destroy$ = new Subject();

  constructor(
    private renderer: Renderer2,
    public selectService: SelectService,
    private cdr: ChangeDetectorRef,
  ) {
  }

  get placeHolderDisplay(): string {
    return this.inputValue || this.isComposing || this.selectService.listOfSelectedValue.length ? 'none' : 'block';
  }

  get selectedValueStyle(): { [key: string]: string } {
    let showSelectedValue = false;
    let opacity = 1;
    if (!this.showSearch) {
      showSelectedValue = true;
    } else {
      if (this.open) {
        showSelectedValue = !(this.inputValue || this.isComposing);
        if (showSelectedValue) {
          opacity = 0.4;
        }
      } else {
        showSelectedValue = true;
      }
    }
    return {
      display: showSelectedValue ? 'block' : 'none',
      opacity: `${opacity}`
    };
  }

  onClearSelection(e: MouseEvent): void {
    e.stopPropagation();
    this.selectService.updateListOfSelectedValue([], true);
  }

  setInputValue(value: string): void {
    if (this.inputElement) {
      this.inputElement.nativeElement.value = value;
    }
    this.inputValue = value;
    this.updateWidth();
    this.selectService.updateSearchValue(value);
    this.selectService.tokenSeparate(this.inputValue, this.tokenSeparators);
  }

  // tslint:disable-next-line:no-any
  trackValue(_index: number, option: OptionComponent): any {
    return option.value;
  }

  updateWidth(): void {
    if (this.selectService.isMultipleOrTags && this.inputElement) {
      if (this.inputValue || this.isComposing) {
        this.renderer.setStyle(
          this.inputElement.nativeElement,
          'width',
          `${this.inputElement.nativeElement.scrollWidth}px`
        );
      } else {
        this.renderer.removeStyle(this.inputElement.nativeElement, 'width');
      }
    }
  }

  removeSelectedValue(option: OptionComponent, e: KeyboardEvent | MouseEvent): void {
    this.selectService.removeValueFormSelected(option);
    e.stopPropagation();
  }

  ngOnInit(): void {
    this.selectService.open$.pipe(takeUntil(this.destroy$)).subscribe(open => {
      if (this.inputElement && open) {
        this.inputElement.nativeElement.focus();
      }
    });
    this.selectService.clearInput$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.setInputValue('');
    });
    this.selectService.check$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
