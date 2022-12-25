import { OverlayContainer } from '@angular/cdk/overlay';
import { registerLocaleData } from '@angular/common';
import zh from '@angular/common/locales/zh';
import { Component, DebugElement, TemplateRef, ViewChild } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, inject, TestBed, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { dispatchMouseEvent } from '@gradii/triangle/core/testing';
import { TriDatePickerModule } from '@gradii/triangle/date-picker';

import { isBefore } from 'date-fns';

registerLocaleData(zh);

describe('month picker component', () => {
  let fixture: ComponentFixture<TestMonthPickerComponent>;
  let fixtureInstance: TestMonthPickerComponent;
  let debugElement: DebugElement;
  let overlayContainer: OverlayContainer;
  let overlayContainerElement: HTMLElement;

  beforeEach(fakeAsync(() => {
    TestBed.configureTestingModule({
      imports     : [FormsModule, NoopAnimationsModule, TriDatePickerModule],
      providers   : [],
      declarations: [
        TestMonthPickerComponent
      ]
    });

    TestBed.compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestMonthPickerComponent);
    fixtureInstance = fixture.componentInstance;
    debugElement = fixture.debugElement;
  });

  beforeEach(inject([OverlayContainer], (oc: OverlayContainer) => {
    overlayContainer = oc;
    overlayContainerElement = oc.getContainerElement();
  }));

  afterEach(() => {
    // overlayContainer.ngOnDestroy();
  });

  describe('general api testing', () => {
    beforeEach(() => fixtureInstance.useSuite = 1);

    it('should open by click and close by click at outside', fakeAsync(() => {
      fixture.detectChanges();
      dispatchMouseEvent(getPickerTrigger(), 'click');
      fixture.detectChanges();
      tick(500);
      fixture.detectChanges();
      expect(getPickerContainer()).not.toBeNull();

      dispatchMouseEvent(queryFromOverlay('.cdk-overlay-backdrop'), 'click');
      fixture.detectChanges();
      tick(500);
      fixture.detectChanges();
      expect(getPickerContainer()).toBeNull();
    }));

    it('should support allowClear and work properly', fakeAsync(() => {
      const clearBtnSelector = By.css('tri-picker i.tri-calendar-picker-clear');
      const initial = fixtureInstance.value = new Date();
      fixtureInstance.allowClear = false;
      fixture.detectChanges();
      tick(500);
      fixture.detectChanges();
      expect(debugElement.query(clearBtnSelector)).toBeFalsy();

      fixtureInstance.allowClear = true;
      fixture.detectChanges();
      tick(500);
      fixture.detectChanges();
      expect(fixtureInstance.value).toBe(initial);
      expect(debugElement.query(clearBtnSelector)).toBeDefined();

      const onChange = spyOn(fixtureInstance, 'onChange');
      debugElement.query(clearBtnSelector).nativeElement.click();
      fixture.detectChanges();
      tick(500);
      fixture.detectChanges();
      expect(fixtureInstance.value).toBe(initial);
      expect(onChange).toHaveBeenCalledWith(null);
      expect(debugElement.query(clearBtnSelector)).toBeFalsy();
    }));

    it('should support autoFocus', () => {
      fixtureInstance.autoFocus = true;
      fixture.detectChanges();
      expect(getPickerTrigger() === document.activeElement).toBeTruthy();
    });

    it('should support disabled', fakeAsync(() => {
      // Make sure picker clear button shown up
      fixtureInstance.allowClear = true;
      fixtureInstance.value = new Date();

      fixtureInstance.disabled = true;
      fixture.detectChanges();
      flush();
      fixture.detectChanges();
      expect(debugElement.query(By.css('tri-picker .tri-input-disabled'))).toBeDefined();
      expect(debugElement.query(By.css('tri-picker i.tri-calendar-picker-clear'))).toBeNull();

      fixtureInstance.disabled = false;
      fixture.detectChanges();
      flush();
      fixture.detectChanges();
      expect(debugElement.query(By.css('tri-picker .tri-input-disabled'))).toBeNull();
      expect(debugElement.query(By.css('tri-picker i.tri-calendar-picker-clear'))).toBeDefined();
    }));

    it('should support open if assigned', fakeAsync(() => {
      fixtureInstance.useSuite = 2;

      fixture.detectChanges();
      fixture.whenRenderingDone().then(() => {
        expect(getPickerContainer()).toBeNull();

        fixtureInstance.open = true;
        fixture.detectChanges();
        tick(500);
        fixture.detectChanges();
        expect(getPickerContainer()).not.toBeNull();
        expect(queryFromOverlay('.cdk-overlay-backdrop')).toBeNull();
        // dispatchMouseEvent(queryFromOverlay('.cdk-overlay-backdrop'), 'click');
        // expect(getPickerContainer()).not.toBeNull();

        fixtureInstance.open = false;
        fixture.detectChanges();
        tick(500);
        fixture.detectChanges();
        expect(getPickerContainer()).toBeNull();
      });
    }));

    it('should support className', () => {
      const className = fixtureInstance.className = 'my-test-class';
      fixture.detectChanges();
      const picker = debugElement.query(By.css('.tri-calendar-picker')).nativeElement as HTMLElement;
      expect(picker.classList.contains(className)).toBeTruthy();
    });

    it('should support disabledDate', fakeAsync(() => {
      fixture.detectChanges();
      const compareDate = new Date('2018-11-15 00:00:00');
      fixtureInstance.value = new Date('2018-11-11 12:12:12');
      fixtureInstance.disabledDate = (current: Date) => isBefore(current, compareDate);
      fixture.detectChanges();
      flush();
      fixture.detectChanges();

      dispatchMouseEvent(getPickerTrigger(), 'click');
      fixture.detectChanges();
      tick(500);
      fixture.detectChanges();
      const allDisabledCells = overlayContainerElement.querySelectorAll('tbody.tri-calendar-month-panel-tbody tr td.tri-calendar-month-panel-cell-disabled');
      const disabledCell = allDisabledCells[allDisabledCells.length - 1];
      expect(disabledCell.textContent).toContain('11');
    }));

    it('should support locale', () => {
      const featureKey = 'TEST_PLACEHOLDER';
      fixtureInstance.locale = {lang: {placeholder: featureKey}};
      fixture.detectChanges();
      expect(getPickerTrigger().getAttribute('placeholder')).toBe(featureKey);
    });

    it('should support placeholder', () => {
      const featureKey = fixtureInstance.placeholder = 'TEST_PLACEHOLDER';
      fixture.detectChanges();
      expect(getPickerTrigger().getAttribute('placeholder')).toBe(featureKey);
    });

    it('should support popupStyle', fakeAsync(() => {
      fixtureInstance.popupStyle = {color: 'red'};
      fixture.detectChanges();
      dispatchMouseEvent(getPickerTrigger(), 'click');
      fixture.detectChanges();
      tick(500);
      fixture.detectChanges();
      expect(getPickerContainer().style.color).toBe('red');
    }));

    it('should support dropdownClassName', fakeAsync(() => {
      const keyCls = fixtureInstance.dropdownClassName = 'my-test-class';
      fixture.detectChanges();
      dispatchMouseEvent(getPickerTrigger(), 'click');
      fixture.detectChanges();
      tick(500);
      fixture.detectChanges();
      expect(getPickerContainer().classList.contains(keyCls)).toBeTruthy();
    }));

    it('should support size', () => {
      fixtureInstance.size = 'large';
      fixture.detectChanges();
      expect(getPicker().classList.contains('tri-calendar-picker-large')).toBeTruthy();

      fixtureInstance.size = 'small';
      fixture.detectChanges();
      expect(getPicker().classList.contains('tri-calendar-picker-small')).toBeTruthy();
    });

    it('should support style', () => {
      fixtureInstance.style = {color: 'blue'};
      fixture.detectChanges();
      expect(getPicker().style.color).toBe('blue');
    });

    it('should support onOpenChange', () => {
      const onOpenChange = spyOn(fixtureInstance, 'onOpenChange');
      fixture.detectChanges();
      dispatchMouseEvent(getPickerTrigger(), 'click');
      fixture.detectChanges();
      expect(onOpenChange).toHaveBeenCalledWith(true);

      dispatchMouseEvent(queryFromOverlay('.cdk-overlay-backdrop'), 'click');
      fixture.detectChanges();
      expect(onOpenChange).toHaveBeenCalledWith(false);
      expect(onOpenChange).toHaveBeenCalledTimes(2);
    });
    it('should support value', fakeAsync(() => {
      fixtureInstance.value = new Date('2018-11-22');
      fixture.detectChanges();
      flush();
      fixture.detectChanges();
      dispatchMouseEvent(getPickerTrigger(), 'click');
      fixture.detectChanges();
      tick(500);
      fixture.detectChanges();
      expect(getSelectedMonthCell().textContent).toContain('11');
    }));

    it('should support onChange', fakeAsync(() => {
      fixtureInstance.value = new Date('2018-11');
      const onChange = spyOn(fixtureInstance, 'onChange');
      fixture.detectChanges();
      dispatchMouseEvent(getPickerTrigger(), 'click');
      fixture.detectChanges();
      tick(500);
      fixture.detectChanges();

      const cell = getFirstMonthCell(); // Use the first cell
      const cellText = cell.textContent.trim();
      dispatchMouseEvent(cell, 'click');
      fixture.detectChanges();
      tick(500);
      fixture.detectChanges();
      expect(onChange).toHaveBeenCalled();
      const result = onChange.calls.allArgs()[0][0];
      expect(result.getMonth() + 1).toBe(parseInt(cellText, 10));
    }));

  }); // /general api testing

  describe('panel switch and move forward/afterward', () => {
    beforeEach(() => fixtureInstance.useSuite = 1);

    it('should support year panel changes', fakeAsync(() => {
      fixtureInstance.value = new Date('2018-11');
      fixture.detectChanges();
      openPickerByClickTrigger();
      // Click year select to show year panel
      dispatchMouseEvent(queryFromOverlay('.tri-calendar-month-panel-year-select'), 'click');
      fixture.detectChanges();
      tick(500);
      fixture.detectChanges();
      expect(queryFromOverlay('.tri-calendar-year-panel')).toBeDefined();
      expect(queryFromOverlay('.tri-calendar-year-panel-decade-select-content').textContent).toContain('2010');
      expect(queryFromOverlay('.tri-calendar-year-panel-decade-select-content').textContent).toContain('2019');
      // Goto previous year
      dispatchMouseEvent(queryFromOverlay('.tri-calendar-year-panel-prev-decade-btn'), 'click');
      fixture.detectChanges();
      tick(500);
      fixture.detectChanges();
      expect(queryFromOverlay('.tri-calendar-year-panel-decade-select-content').textContent).toContain('2000');
      expect(queryFromOverlay('.tri-calendar-year-panel-decade-select-content').textContent).toContain('2009');
      // Goto next year * 2
      dispatchMouseEvent(queryFromOverlay('.tri-calendar-year-panel-next-decade-btn'), 'click');
      fixture.detectChanges();
      tick(500);
      fixture.detectChanges();
      dispatchMouseEvent(queryFromOverlay('.tri-calendar-year-panel-next-decade-btn'), 'click');
      fixture.detectChanges();
      tick(500);
      fixture.detectChanges();
      expect(queryFromOverlay('.tri-calendar-year-panel-decade-select-content').textContent).toContain('2020');
      expect(queryFromOverlay('.tri-calendar-year-panel-decade-select-content').textContent).toContain('2029');
    }));

    it('should support decade panel changes', fakeAsync(() => {
      fixtureInstance.value = new Date('2018-11');
      fixture.detectChanges();
      openPickerByClickTrigger();
      // Click to show decade panel
      dispatchMouseEvent(queryFromOverlay('.tri-calendar-month-panel-year-select'), 'click');
      fixture.detectChanges();
      tick(500);
      fixture.detectChanges();
      dispatchMouseEvent(queryFromOverlay('.tri-calendar-year-panel-decade-select'), 'click');
      fixture.detectChanges();
      tick(500);
      fixture.detectChanges();
      expect(queryFromOverlay('.tri-calendar-decade-panel')).toBeDefined();
      // Goto previous decade
      dispatchMouseEvent(queryFromOverlay('.tri-calendar-decade-panel-prev-century-btn'), 'click');
      fixture.detectChanges();
      tick(500);
      fixture.detectChanges();
      expect(queryFromOverlay('.tri-calendar-decade-panel-century').textContent).toContain('1900');
      expect(queryFromOverlay('.tri-calendar-decade-panel-century').textContent).toContain('1999');
      // Goto next decade * 2
      dispatchMouseEvent(queryFromOverlay('.tri-calendar-decade-panel-next-century-btn'), 'click');
      fixture.detectChanges();
      tick(500);
      fixture.detectChanges();
      dispatchMouseEvent(queryFromOverlay('.tri-calendar-decade-panel-next-century-btn'), 'click');
      fixture.detectChanges();
      tick(500);
      fixture.detectChanges();
      expect(queryFromOverlay('.tri-calendar-decade-panel-century').textContent).toContain('2100');
      expect(queryFromOverlay('.tri-calendar-decade-panel-century').textContent).toContain('2199');
    }));

  }); // /panel switch and move forward/afterward

  describe('specified date picker testing', () => {
    beforeEach(() => fixtureInstance.useSuite = 1);

    it('should support renderExtraFooter', fakeAsync(() => {
      fixtureInstance.renderExtraFooter = fixtureInstance.tplExtraFooter;
      fixture.detectChanges();

      openPickerByClickTrigger();
      expect(overlayContainerElement.textContent.indexOf('TEST_EXTRA_FOOTER') > -1).toBeTruthy();

      fixtureInstance.renderExtraFooter = 'TEST_EXTRA_FOOTER_STRING';
      fixture.detectChanges();
      expect(overlayContainerElement.textContent.indexOf(fixtureInstance.renderExtraFooter) > -1).toBeTruthy();
    }));

  }); // /specified date picker testing

  describe('ngModel value accesors', () => {
    beforeEach(() => fixtureInstance.useSuite = 3);

    it('should specified date provide by "modelValue" be choosed', fakeAsync(() => {
      fixtureInstance.modelValue = new Date('2018-11');
      fixture.detectChanges();
      flush(); // Wait writeValue() tobe done
      fixture.detectChanges();
      expect(getSelectedMonthCell().textContent).toContain('11');

      // Click the first cell to change ngModel
      const cell = getFirstMonthCell();
      const cellText = cell.textContent.trim();
      dispatchMouseEvent(cell, 'click');
      fixture.detectChanges();
      tick(500);
      fixture.detectChanges();
      expect(fixtureInstance.modelValue.getMonth() + 1).toBe(parseInt(cellText, 10));
    }));
  });

  ////////////

  function getPicker(): HTMLElement {
    return debugElement.query(By.css('tri-picker .tri-calendar-picker')).nativeElement as HTMLElement;
  }

  function getPickerTrigger(): HTMLInputElement {
    return debugElement.query(By.css('tri-picker input.tri-calendar-picker-input')).nativeElement as HTMLInputElement;
  }

  function getPickerContainer(): HTMLElement {
    return queryFromOverlay('.tri-calendar-picker-container') as HTMLElement;
  }

  function getSelectedMonthCell(): HTMLElement {
    return queryFromOverlay('tbody.tri-calendar-month-panel-tbody td.tri-calendar-month-panel-selected-cell') as HTMLElement;
  }

  function getFirstMonthCell(): HTMLElement {
    return queryFromOverlay('tbody.tri-calendar-month-panel-tbody td.tri-calendar-month-panel-cell') as HTMLElement;
  }

  function queryFromOverlay(selector: string): HTMLElement {
    return overlayContainerElement.querySelector(selector) as HTMLElement;
  }

  function openPickerByClickTrigger(): void {
    dispatchMouseEvent(getPickerTrigger(), 'click');
    fixture.detectChanges();
    tick(500);
    fixture.detectChanges();
  }

});

@Component({
  template: `
    <ng-container [ngSwitch]="useSuite">
      <!-- Suite 1 -->
      <tri-month-picker *ngSwitchCase="1"
        [allowClear]="allowClear"
        [autoFocus]="autoFocus"
        [disabled]="disabled"
        [className]="className"
        [disabledDate]="disabledDate"
        [locale]="locale"
        [placeholder]="placeholder"
        [popupStyle]="popupStyle"
        [dropdownClassName]="dropdownClassName"
        [size]="size"
        [style]="style"
        (onOpen)="onOpenChange($event)"

        [defaultValue]="defaultValue"
        [ngModel]="value"
        (ngModelChange)="onChange($event)"

        [renderExtraFooter]="renderExtraFooter"
      ></tri-month-picker>
      <ng-template #tplExtraFooter>
        TEST_EXTRA_FOOTER
      </ng-template>

      <!-- Suite 2 -->
      <!-- use another picker to avoid open's side-effects beacuse open act as "true" if used -->
      <tri-month-picker *ngSwitchCase="2" [open]="open"></tri-month-picker>

      <!-- Suite 3 -->
      <tri-month-picker *ngSwitchCase="3" [open]="true" [(ngModel)]="modelValue"></tri-month-picker>
    </ng-container>
  `
})
class TestMonthPickerComponent {
  useSuite: 1 | 2 | 3;
  @ViewChild('tplExtraFooter', {static: false}) tplExtraFooter: TemplateRef<void>;

  // --- Suite 1
  allowClear;
  autoFocus;
  disabled;
  className;
  disabledDate;
  locale;
  placeholder;
  popupStyle;
  dropdownClassName;
  size;
  style;
  defaultValue;
  value;
  renderExtraFooter;
  // --- Suite 2
  open;
  // --- Suite 3
  modelValue;

  onOpenChange(d: boolean): void {
  }

  onChange(result: Date): void {
  }
}
