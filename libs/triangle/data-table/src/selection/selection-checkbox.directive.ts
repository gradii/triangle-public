/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import {
  AfterContentChecked,
  Directive,
  ElementRef,
  HostBinding,
  Input,
  OnDestroy
} from '@angular/core';
import { CheckboxComponent } from '@gradii/triangle/checkbox';
import { SelectionService } from './selection.service';

@Directive({
  selector: '[triGridSelectionCheckbox]'
})
export class SelectionCheckboxDirective implements AfterContentChecked, OnDestroy {
  /**
   * The current index of the `dataItem` that will be selected.
   */
  @Input('triGridSelectionCheckbox') itemIndex: number;

  @HostBinding('attr.type') type: string;

  private destroyChange;

  constructor(private selectionService: SelectionService,
              private el: ElementRef,
              //            private renderer: Renderer2,
              private checkbox: CheckboxComponent) {
    this.selectionService = selectionService;
    //    this.el               = el;
    //    this.renderer         = renderer;
    this.type = 'checkbox';
    //    this.destroyChange     = this.renderer.listen(this.el.nativeElement, "click", this.onChange.bind(this));
    this.destroyChange = checkbox.checkedChange.subscribe(this.onChange.bind(this));
  }

  ngAfterContentChecked() {
    this.setCheckedState();
  }

  ngOnDestroy() {
    if (this.destroyChange) {
      //      this.destroyChange();
      this.destroyChange.unsubscribe();
    }
  }

  onChange() {
    if (this.selectionService.options.enabled) {
      const ev = this.selectionService.toggleByIndex(this.itemIndex);
      ev.ctrlKey = false;
      // Setting the deprecated `index` and `selected` properties
      ev.index = this.itemIndex;
      ev.selected = ev.selectedRows.length > ev.deselectedRows.length;
      this.selectionService.changes.emit(ev);
    }
  }

  setCheckedState() {
    //    this.renderer.setProperty(this.el.nativeElement, "checked", this.selectionService.isSelected(this.itemIndex));
    this.checkbox.checked = this.selectionService.isSelected(this.itemIndex);
  }
}
