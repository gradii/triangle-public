import { ESCAPE } from '@angular/cdk/keycodes';
import { OverlayContainer } from '@angular/cdk/overlay';
import { registerLocaleData } from '@angular/common';
import zh from '@angular/common/locales/zh';
import { Component, DebugElement, TemplateRef, ViewChild } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, inject, TestBed, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { dispatchKeyboardEvent, dispatchMouseEvent } from '@gradii/triangle/core/testing';
import { TriDatePickerModule } from '@gradii/triangle/date-picker';
import { isSameDay } from 'date-fns';

registerLocaleData(zh);

describe('date picker component', () => {
  let fixture: ComponentFixture<TestDatePickerComponent>;
  let fixtureInstance: TestDatePickerComponent;
  let debugElement: DebugElement;
  let overlayContainer: OverlayContainer;
  let overlayContainerElement: HTMLElement;

  beforeEach(fakeAsync(() => {
    TestBed.configureTestingModule({
      imports     : [FormsModule, NoopAnimationsModule, TriDatePickerModule],
      providers   : [],
      declarations: [
        TestDatePickerComponent
      ]
    });

    TestBed.compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestDatePickerComponent);
    fixtureInstance = fixture.componentInstance;
    debugElement = fixture.debugElement;
  });

  beforeEach(inject([OverlayContainer], (oc: OverlayContainer) => {
    overlayContainer = oc;
    overlayContainerElement = oc.getContainerElement();
  }));

  afterEach(() => {
    overlayContainer.ngOnDestroy();
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

    /* Issue https://github.com/NG-ZORRO/ng-zorro-antd/issues/1539 */
    it('should be openable after closed by "Escape" key', fakeAsync(() => {
      fixture.detectChanges();
      dispatchMouseEvent(getPickerTrigger(), 'click');
      fixture.detectChanges();
      tick(500);
      fixture.detectChanges();
      expect(getPickerContainer()).not.toBeNull();

      dispatchKeyboardEvent(document.body, 'keydown', ESCAPE);
      fixture.detectChanges();
      tick(500);
      fixture.detectChanges();
      expect(getPickerContainer()).toBeNull();

      dispatchMouseEvent(getPickerTrigger(), 'click');
      fixture.detectChanges();
      tick(500);
      fixture.detectChanges();
      expect(getPickerContainer()).not.toBeNull();
    }));

    it('should support allowClear and work properly', fakeAsync(() => {
      const clearBtnSelector = By.css('tri-picker i.tri-calendar-picker-clear');
      const initial = fixtureInstance.value = new Date();
      fixtureInstance.allowClear = false;
      fixture.detectChanges();
      expect(debugElement.query(clearBtnSelector)).toBeFalsy();

      fixtureInstance.allowClear = true;
      tick(500);
      fixture.detectChanges();
      expect(fixtureInstance.value).toBe(initial);
      expect(debugElement.query(clearBtnSelector)).toBeDefined();

      const onChange = spyOn(fixtureInstance, 'onChange');
      debugElement.query(clearBtnSelector).nativeElement.click();
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
      tick(500);
      fixture.detectChanges();
      expect(debugElement.query(By.css('tri-picker .tri-input-disabled'))).toBeNull();
      expect(debugElement.query(By.css('tri-picker i.tri-calendar-picker-clear'))).toBeDefined();
    }));

    it('should support open if assigned', fakeAsync(() => {
      fixtureInstance.useSuite = 2;

      fixture.detectChanges();
      tick(500);
      fixture.detectChanges();
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
    }));

    it('should support className', () => {
      const className = fixtureInstance.className = 'my-test-class';
      fixture.detectChanges();
      const picker = debugElement.queryAll(By.css('.tri-calendar-picker'))[1].nativeElement as HTMLElement;
      expect(picker.classList.contains(className)).toBeTruthy();
    });

    it('should support disabledDate', fakeAsync(() => {
      fixture.detectChanges();
      const compareDate = new Date('2018-11-15 00:00:00');
      fixtureInstance.value = new Date('2018-11-11 12:12:12');
      fixtureInstance.disabledDate = (current: Date) => isSameDay(current, compareDate);
      fixture.detectChanges();
      dispatchMouseEvent(getPickerTrigger(), 'click');
      fixture.detectChanges();
      tick(500);
      fixture.detectChanges();
      const disabledCell = queryFromOverlay('tbody.tri-calendar-tbody td.tri-calendar-disabled-cell');
      expect(disabledCell.textContent.trim()).toBe('15');
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

    it('should not emit onOpenChange second time when input clicked twice', () => {
      const onOpenChange = spyOn(fixtureInstance, 'onOpenChange');

      fixture.detectChanges();
      dispatchMouseEvent(getPickerTrigger(), 'click');
      dispatchMouseEvent(getPickerTrigger(), 'click');
      fixture.detectChanges();

      expect(onOpenChange).toHaveBeenCalledWith(true);
      expect(onOpenChange).toHaveBeenCalledTimes(1);
    });

    it('should not emit onOpenChange when open is false and input is clicked', () => {
      const onOpenChange = spyOn(fixtureInstance, 'onOpenChange');
      fixtureInstance.useSuite = 2;
      fixtureInstance.open = false;

      fixture.detectChanges();
      dispatchMouseEvent(getPickerTrigger(), 'click');
      fixture.detectChanges();

      expect(onOpenChange).not.toHaveBeenCalledWith(true);
    });

    it('should support value', fakeAsync(() => {
      fixtureInstance.value = new Date('2018-11-11');
      fixture.detectChanges();
      dispatchMouseEvent(getPickerTrigger(), 'click');
      fixture.detectChanges();
      tick(500);
      fixture.detectChanges();
      expect(getSelectedDayCell().textContent.trim()).toBe('11');
    }));

    it('should support onChange', fakeAsync(() => {
      fixtureInstance.value = new Date('2018-11-11');
      const onChange = spyOn(fixtureInstance, 'onChange');
      fixture.detectChanges();
      dispatchMouseEvent(getPickerTrigger(), 'click');
      fixture.detectChanges();
      tick(500);
      fixture.detectChanges();

      const cell = getFirstCell(); // Use the first cell
      const cellText = cell.textContent.trim();
      dispatchMouseEvent(cell, 'click');
      fixture.detectChanges();
      tick(500);
      fixture.detectChanges();
      expect(onChange).toHaveBeenCalled();
      const result = onChange.calls.allArgs()[0][0];
      expect(result.getDate()).toBe(+cellText);
    }));

  });

  describe('panel switch and move forward/afterward', () => {
    beforeEach(() => fixtureInstance.useSuite = 1);

    it('should support date panel changes', fakeAsync(() => {
      fixtureInstance.value = new Date('2018-11-11');
      fixture.detectChanges();
      tick(500);
      fixture.detectChanges();
      openPickerByClickTrigger();
      // Click previous year button
      dispatchMouseEvent(queryFromOverlay('.tri-calendar-prev-year-btn'), 'click');
      fixture.detectChanges();
      tick(500);
      fixture.detectChanges();
      expect(queryFromOverlay('.tri-calendar-year-select').textContent.indexOf('2017') > -1).toBeTruthy();
      // Click next year button * 2
      dispatchMouseEvent(queryFromOverlay('.tri-calendar-next-year-btn'), 'click');
      fixture.detectChanges();
      tick(500);
      fixture.detectChanges();
      dispatchMouseEvent(queryFromOverlay('.tri-calendar-next-year-btn'), 'click');
      fixture.detectChanges();
      tick(500);
      fixture.detectChanges();
      expect(queryFromOverlay('.tri-calendar-year-select').textContent.indexOf('2019') > -1).toBeTruthy();
      // Click previous month button
      dispatchMouseEvent(queryFromOverlay('.tri-calendar-prev-month-btn'), 'click');
      fixture.detectChanges();
      tick(500);
      fixture.detectChanges();
      expect(queryFromOverlay('.tri-calendar-month-select').textContent.indexOf('10') > -1).toBeTruthy();
      // Click next month button * 2
      dispatchMouseEvent(queryFromOverlay('.tri-calendar-next-month-btn'), 'click');
      fixture.detectChanges();
      tick(500);
      fixture.detectChanges();
      dispatchMouseEvent(queryFromOverlay('.tri-calendar-next-month-btn'), 'click');
      fixture.detectChanges();
      tick(500);
      fixture.detectChanges();
      expect(queryFromOverlay('.tri-calendar-month-select').textContent.indexOf('12') > -1).toBeTruthy();
    }));

    it('should support month panel changes', fakeAsync(() => {
      fixtureInstance.value = new Date('2018-11-11');
      fixture.detectChanges();
      tick(500);
      fixture.detectChanges();
      openPickerByClickTrigger();
      // Click month select to show month panel
      dispatchMouseEvent(queryFromOverlay('.tri-calendar-header .tri-calendar-month-select'), 'click');
      fixture.detectChanges();
      tick(500);
      fixture.detectChanges();
      expect(queryFromOverlay('.tri-calendar-header .tri-calendar-month-panel')).toBeDefined();
      expect(queryFromOverlay('.tri-calendar-month-panel-year-select-content').textContent.indexOf('2018') > -1).toBeTruthy();
      // Goto previous year
      dispatchMouseEvent(queryFromOverlay('.tri-calendar-month-panel-prev-year-btn'), 'click');
      fixture.detectChanges();
      tick(500);
      fixture.detectChanges();
      expect(queryFromOverlay('.tri-calendar-month-panel-year-select-content').textContent.indexOf('2017') > -1).toBeTruthy();
      // Goto next year * 2
      dispatchMouseEvent(queryFromOverlay('.tri-calendar-month-panel-next-year-btn'), 'click');
      fixture.detectChanges();
      tick(500);
      fixture.detectChanges();
      dispatchMouseEvent(queryFromOverlay('.tri-calendar-month-panel-next-year-btn'), 'click');
      fixture.detectChanges();
      tick(500);
      fixture.detectChanges();
      expect(queryFromOverlay('.tri-calendar-month-panel-year-select-content').textContent.indexOf('2019') > -1).toBeTruthy();
      // Click to choose a year to change panel
      dispatchMouseEvent(queryFromOverlay('td.tri-calendar-month-panel-selected-cell'), 'click');
      fixture.detectChanges();
      tick(500);
      fixture.detectChanges();
      expect(queryFromOverlay('.tri-calendar-header .tri-calendar-month-panel')).toBeFalsy();
    }));

    it('should support year panel changes', fakeAsync(() => {
      fixtureInstance.value = new Date('2018-11-11');
      fixture.detectChanges();
      tick(500);
      fixture.detectChanges();
      openPickerByClickTrigger();
      // Click year select to show year panel
      dispatchMouseEvent(queryFromOverlay('.tri-calendar-header .tri-calendar-year-select'), 'click');
      fixture.detectChanges();
      tick(500);
      fixture.detectChanges();
      expect(queryFromOverlay('.tri-calendar-header .tri-calendar-year-panel')).toBeDefined();
      expect(queryFromOverlay('.tri-calendar-year-panel-decade-select-content').textContent.indexOf('2010') > -1).toBeTruthy();
      expect(queryFromOverlay('.tri-calendar-year-panel-decade-select-content').textContent.indexOf('2019') > -1).toBeTruthy();
      // Coverage for last/next cell
      dispatchMouseEvent(queryFromOverlay('.tri-calendar-year-panel-last-decade-cell'), 'click');
      fixture.detectChanges();
      tick(500);
      fixture.detectChanges();
      dispatchMouseEvent(queryFromOverlay('.tri-calendar-year-panel-next-decade-cell'), 'click');
      fixture.detectChanges();
      tick(500);
      fixture.detectChanges();
      // Goto previous decade
      dispatchMouseEvent(queryFromOverlay('.tri-calendar-year-panel-prev-decade-btn'), 'click');
      fixture.detectChanges();
      tick(500);
      fixture.detectChanges();
      expect(queryFromOverlay('.tri-calendar-year-panel-decade-select-content').textContent.indexOf('2000') > -1).toBeTruthy();
      expect(queryFromOverlay('.tri-calendar-year-panel-decade-select-content').textContent.indexOf('2009') > -1).toBeTruthy();
      // Goto next decade * 2
      dispatchMouseEvent(queryFromOverlay('.tri-calendar-year-panel-next-decade-btn'), 'click');
      fixture.detectChanges();
      tick(500);
      fixture.detectChanges();
      dispatchMouseEvent(queryFromOverlay('.tri-calendar-year-panel-next-decade-btn'), 'click');
      fixture.detectChanges();
      tick(500);
      fixture.detectChanges();
      expect(queryFromOverlay('.tri-calendar-year-panel-decade-select-content').textContent.indexOf('2020') > -1).toBeTruthy();
      expect(queryFromOverlay('.tri-calendar-year-panel-decade-select-content').textContent.indexOf('2029') > -1).toBeTruthy();
      // Click to choose a year to change panel
      dispatchMouseEvent(queryFromOverlay('td.tri-calendar-year-panel-selected-cell'), 'click');
      fixture.detectChanges();
      tick(500);
      fixture.detectChanges();
      expect(queryFromOverlay('.tri-calendar-header .tri-calendar-year-panel')).toBeFalsy();
    }));

    it('should support decade panel changes', fakeAsync(() => {
      fixtureInstance.value = new Date('2018-11-11');
      fixture.detectChanges();
      tick(500);
      fixture.detectChanges();
      openPickerByClickTrigger();
      // Click to show decade panel
      dispatchMouseEvent(queryFromOverlay('.tri-calendar-header .tri-calendar-year-select'), 'click');
      fixture.detectChanges();
      tick(500);
      fixture.detectChanges();
      dispatchMouseEvent(queryFromOverlay('.tri-calendar-header .tri-calendar-year-panel-decade-select'), 'click');
      fixture.detectChanges();
      tick(500);
      fixture.detectChanges();
      expect(queryFromOverlay('.tri-calendar-header .tri-calendar-decade-panel')).toBeDefined();
      // Coverage for last/next cell
      dispatchMouseEvent(queryFromOverlay('.tri-calendar-decade-panel-next-century-cell'), 'click');
      fixture.detectChanges();
      tick(500);
      fixture.detectChanges();
      dispatchMouseEvent(queryFromOverlay('.tri-calendar-decade-panel-last-century-cell'), 'click');
      fixture.detectChanges();
      tick(500);
      fixture.detectChanges();
      // Goto previous century
      dispatchMouseEvent(queryFromOverlay('.tri-calendar-decade-panel-prev-century-btn'), 'click');
      fixture.detectChanges();
      tick(500);
      fixture.detectChanges();
      expect(queryFromOverlay('.tri-calendar-decade-panel-century').textContent.indexOf('1900') > -1).toBeTruthy();
      expect(queryFromOverlay('.tri-calendar-decade-panel-century').textContent.indexOf('1999') > -1).toBeTruthy();
      // Goto next century * 2
      dispatchMouseEvent(queryFromOverlay('.tri-calendar-decade-panel-next-century-btn'), 'click');
      fixture.detectChanges();
      tick(500);
      fixture.detectChanges();
      dispatchMouseEvent(queryFromOverlay('.tri-calendar-decade-panel-next-century-btn'), 'click');
      fixture.detectChanges();
      tick(500);
      fixture.detectChanges();
      expect(queryFromOverlay('.tri-calendar-decade-panel-century').textContent.indexOf('2100') > -1).toBeTruthy();
      expect(queryFromOverlay('.tri-calendar-decade-panel-century').textContent.indexOf('2199') > -1).toBeTruthy();
      // Click to choose a decade to change panel
      dispatchMouseEvent(queryFromOverlay('td.tri-calendar-decade-panel-selected-cell'), 'click');
      fixture.detectChanges();
      tick(500);
      fixture.detectChanges();
      expect(queryFromOverlay('.tri-calendar-header .tri-calendar-year-panel')).toBeDefined();
    }));

  }); // /panel switch and move forward/afterward

  describe('specified date picker testing', () => {
    beforeEach(() => fixtureInstance.useSuite = 1);

    it('should support dateRender', fakeAsync(() => {
      fixtureInstance.dateRender = fixtureInstance.tplDateRender;
      fixture.detectChanges();
      dispatchMouseEvent(getPickerTrigger(), 'click');
      fixture.detectChanges();
      tick(500);
      fixture.detectChanges();
      expect(queryFromOverlay('.test-first-day').textContent.trim()).toBe('1');
    }));

    // it('should support dateRender with typeof function', fakeAsync(() => {
    //   const featureKey = 'TEST_FIRST_DAY';
    //   fixtureInstance.dateRender = (d: Date) => d.getDate() === 1 ? featureKey : d.getDate();
    //   fixture.detectChanges();
    //   dispatchMouseEvent(getPickerTrigger(), 'click');
    //   fixture.detectChanges();
    //   tick(500);
    //   fixture.detectChanges();
    //   expect(overlayContainerElement.textContent.indexOf(featureKey) > -1).toBeTruthy();
    // }));

    it('should support showTime', fakeAsync(() => {
      const onChange = spyOn(fixtureInstance, 'onChange');
      fixtureInstance.value = new Date('2018-11-11 11:22:33');
      fixtureInstance.showTime = true;
      fixture.detectChanges();
      openPickerByClickTrigger();
      expect(queryFromOverlay('.tri-calendar-time-picker-btn')).toBeDefined();
      expect(queryFromOverlay('.tri-calendar-ok-btn')).toBeDefined();

      // Open time picker panel
      dispatchMouseEvent(queryFromOverlay('.tri-calendar-time-picker-btn'), 'click');
      fixture.detectChanges();
      flush();
      fixture.detectChanges();
      tick(500);
      fixture.detectChanges();
      expect(queryFromOverlay('.tri-calendar-time-picker-inner.tri-calendar-time-picker-column-3')).toBeDefined();
      expect(queryFromOverlay('.tri-calendar-time-picker-select:first-child li.tri-calendar-time-picker-select-option-selected').textContent.trim()).toBe('11');

      // Click to choose a hour
      dispatchMouseEvent(queryFromOverlay('.tri-calendar-time-picker-select:first-child li:first-child'), 'click');
      fixture.detectChanges();
      flush();
      fixture.detectChanges();
      expect((queryFromOverlay('input.tri-calendar-input') as HTMLInputElement).value).toBe('2018-11-11 00:22:33');
    }));

    it('should support showTime.format', fakeAsync(() => {
      fixtureInstance.showTime = {format: 'HH:mm'};
      fixture.detectChanges();
      openPickerByClickTrigger();

      // Open time picker panel
      dispatchMouseEvent(queryFromOverlay('.tri-calendar-time-picker-btn'), 'click');
      fixture.detectChanges();
      tick(500);
      fixture.detectChanges();
      expect(queryFromOverlay('.tri-calendar-time-picker-inner.tri-calendar-time-picker-column-2')).toBeDefined();
    }));

    it('should support disabledTime and showTime.hideDisabledOptions', fakeAsync(() => {
      fixtureInstance.showTime = true;
      fixtureInstance.disabledTime = (current: Date) => {
        return {
          disabledHours  : () => [0, 1, 2],
          disabledMinutes: () => [0, 1],
          disabledSeconds: () => [0]
        };
      };
      fixture.detectChanges();
      openPickerByClickTrigger();

      // Open time picker panel
      dispatchMouseEvent(queryFromOverlay('.tri-calendar-time-picker-btn'), 'click');
      fixture.detectChanges();
      tick(500);
      fixture.detectChanges();
      expect(queryFromOverlay('.tri-calendar-time-picker-select:nth-child(1) li:nth-child(3)').classList.contains('tri-calendar-time-picker-select-option-disabled')).toBeTruthy();
      expect(queryFromOverlay('.tri-calendar-time-picker-select:nth-child(2) li:nth-child(2)').classList.contains('tri-calendar-time-picker-select-option-disabled')).toBeTruthy();
      expect(queryFromOverlay('.tri-calendar-time-picker-select:nth-child(3) li:nth-child(1)').classList.contains('tri-calendar-time-picker-select-option-disabled')).toBeTruthy();

      // Use hideDisabledOptions to hide disabled times
      fixtureInstance.showTime = {hideDisabledOptions: true};
      fixture.detectChanges();
      expect(+queryFromOverlay('.tri-calendar-time-picker-select:nth-child(1) li:first-child').textContent.trim()).toBe(3);
      expect(+queryFromOverlay('.tri-calendar-time-picker-select:nth-child(2) li:first-child').textContent.trim()).toBe(2);
      expect(+queryFromOverlay('.tri-calendar-time-picker-select:nth-child(3) li:first-child').textContent.trim()).toBe(1);
    }));

    it('should support renderExtraFooter', fakeAsync(() => {
      fixtureInstance.renderExtraFooter = fixtureInstance.tplExtraFooter;
      fixture.detectChanges();

      openPickerByClickTrigger();
      expect(overlayContainerElement.textContent.indexOf('TEST_EXTRA_FOOTER') > -1).toBeTruthy();

      fixtureInstance.renderExtraFooter = 'TEST_EXTRA_FOOTER_STRING';
      fixture.detectChanges();
      expect(overlayContainerElement.textContent.indexOf(fixtureInstance.renderExtraFooter) > -1).toBeTruthy();
    }));

    it('should support showToday', fakeAsync(() => {
      fixture.detectChanges();
      openPickerByClickTrigger();
      expect(overlayContainerElement.querySelector('.tri-calendar-footer')).toBeDefined();

      fixtureInstance.showToday = true;
      fixture.detectChanges();
      expect(overlayContainerElement.querySelector('.tri-calendar-today-btn ')).toBeDefined();

      // Click today button
      const onChange = spyOn(fixtureInstance, 'onChange');
      dispatchMouseEvent(queryFromOverlay('.tri-calendar-today-btn'), 'click');
      fixture.detectChanges();
      tick(500);
      fixture.detectChanges();
      const result = onChange.calls.allArgs()[0][0];
      expect(isSameDay(new Date(), result)).toBeTruthy();
      expect(queryFromOverlay('.tri-calendar-picker-container')).toBeFalsy(); // Should closed
    }));

    it('should support mode', fakeAsync(() => {
      fixtureInstance.mode = 'month';
      fixture.detectChanges();
      openPickerByClickTrigger();
      expect(overlayContainerElement.querySelector('.tri-calendar-header .tri-calendar-month-panel')).toBeDefined();
    }));

    it('should support onPanelChange', fakeAsync(() => {
      spyOn(fixtureInstance, 'onPanelChange');
      fixture.detectChanges();
      openPickerByClickTrigger();

      // Click header to month panel
      dispatchMouseEvent(overlayContainerElement.querySelector('.tri-calendar-header .tri-calendar-month-select'), 'click');
      fixture.detectChanges();
      tick(500);
      fixture.detectChanges();
      expect(fixtureInstance.onPanelChange).toHaveBeenCalledWith('month');
    }));

    it('should support onOk', fakeAsync(() => {
      spyOn(fixtureInstance, 'onOk');
      fixtureInstance.value = new Date('2018-11-11 11:22:33');
      fixtureInstance.showTime = true;
      fixture.detectChanges();
      flush();
      fixture.detectChanges();
      openPickerByClickTrigger();

      // Click ok button
      dispatchMouseEvent(overlayContainerElement.querySelector('.tri-calendar-ok-btn'), 'click');
      fixture.detectChanges();
      tick(500);
      fixture.detectChanges();
      expect(fixtureInstance.onOk).toHaveBeenCalledWith(fixtureInstance.value);
    }));

    it('should custom input date', fakeAsync(() => {
      const onChange = spyOn(fixtureInstance, 'onChange');
      fixture.detectChanges();
      openPickerByClickTrigger();
      const input = queryFromOverlay('.tri-calendar-date-input-wrap input.tri-calendar-input') as HTMLInputElement;

      // Wrong inputing support
      input.value = 'wrong';
      input.dispatchEvent(new KeyboardEvent('keyup'));
      fixture.detectChanges();
      flush();
      fixture.detectChanges();
      expect(input.classList.contains('tri-calendar-input-invalid')).toBeTruthy();

      // Correct inputing
      input.value = '2018-11-22';
      input.dispatchEvent(new KeyboardEvent('keyup'));
      // dispatchKeyboardEvent(input, 'keyup', ENTER); // Not working?
      fixture.detectChanges();
      flush();
      fixture.detectChanges();
      expect(onChange).toHaveBeenCalled();
      const result = onChange.calls.allArgs()[0][0];
      expect(result.getDate()).toBe(22);
    }));

  }); // /specified date picker testing

  describe('ngModel value accesors', () => {
    beforeEach(() => fixtureInstance.useSuite = 3);

    it('should specified date provide by "modelValue" be choosed', fakeAsync(() => {
      fixtureInstance.modelValue = new Date('2018-11-11');
      fixture.detectChanges();
      flush(); // Wait writeValue() tobe done
      fixture.detectChanges();
      expect(getSelectedDayCell().textContent.trim()).toBe('11');

      // Click the first cell to change ngModel
      const cell = getFirstCell();
      const cellText = cell.textContent.trim();
      dispatchMouseEvent(cell, 'click');
      fixture.detectChanges();
      expect(fixtureInstance.modelValue.getDate()).toBe(+cellText);
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

  function getSelectedDayCell(): HTMLElement {
    return queryFromOverlay('tbody.tri-calendar-tbody td.tri-calendar-selected-day') as HTMLElement;
  }

  function getFirstCell(): HTMLElement {
    return queryFromOverlay('tbody.tri-calendar-tbody td.tri-calendar-cell') as HTMLElement;
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
      <tri-date-picker *ngSwitchCase="1"
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

                       [ngModel]="value"
                       (ngModelChange)="onChange($event)"

                       [dateRender]="dateRender"
                       [disabledTime]="disabledTime"
                       [renderExtraFooter]="renderExtraFooter"
                       [showToday]="showToday"
                       [mode]="mode"
                       (onPanelChange)="onPanelChange($event)"
                       (onCalendarChange)="onCalendarChange($event)"
                       [showTime]="showTime"
                       (onOk)="onOk($event)"
      ></tri-date-picker>
      <ng-template #tplDateRender let-current>
        <div [class.test-first-day]="current.getDate() === 1">{{ current.getDate() }}</div>
      </ng-template>
      <ng-template #tplExtraFooter>
        TEST_EXTRA_FOOTER
      </ng-template>

      <!-- Suite 2 -->
      <!-- use another picker to avoid open's side-effects beacuse open act as "true" if used -->
      <tri-date-picker *ngSwitchCase="2"
                       [open]="open"
                       (onOpenChange)="onOpenChange($event)"
      ></tri-date-picker>

      <!-- Suite 3 -->
      <tri-date-picker *ngSwitchCase="3" [open]="true" [(ngModel)]="modelValue"></tri-date-picker>
    </ng-container>
  `
})
class TestDatePickerComponent {
  useSuite: 1 | 2 | 3;
  @ViewChild('tplDateRender', {static: false}) tplDateRender: TemplateRef<Date>;
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
  value: Date | null;
  dateRender;
  showTime: boolean | object = false;
  disabledTime;
  renderExtraFooter;
  showToday = false;
  mode;
  // --- Suite 2
  open: boolean;
  // --- Suite 3
  modelValue: Date;

  onChange(result?: Date): void {
  }

  onCalendarChange(evt?): void {
  }

  onOpenChange(d?: boolean): void {
  }

  // ranges;
  onPanelChange(evt?): void {
  }

  onOk(evt?): void {
  }
}
