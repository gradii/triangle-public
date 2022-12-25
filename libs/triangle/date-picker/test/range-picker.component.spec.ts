import { OverlayContainer } from '@angular/cdk/overlay';
import { registerLocaleData } from '@angular/common';
import zh from '@angular/common/locales/zh';
import { Component, DebugElement, TemplateRef, ViewChild } from '@angular/core';
import { ComponentFixture, fakeAsync, inject, TestBed, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { dispatchMouseEvent } from '@gradii/triangle/core/testing';
import { TriDatePickerModule } from '@gradii/triangle/date-picker';
import { differenceInDays, isSameDay } from 'date-fns';

registerLocaleData(zh);

describe('range picker component', () => {
  let fixture: ComponentFixture<TestRangePickerComponent>;
  let fixtureInstance: TestRangePickerComponent;
  let debugElement: DebugElement;
  let overlayContainer: OverlayContainer;
  let overlayContainerElement: HTMLElement;

  beforeEach(fakeAsync(() => {
    TestBed.configureTestingModule({
      imports     : [FormsModule, NoopAnimationsModule, TriDatePickerModule],
      providers   : [],
      declarations: [
        TestRangePickerComponent
      ]
    });

    TestBed.compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestRangePickerComponent);
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

    it('should support allowClear and work properly', fakeAsync(() => {
      const clearBtnSelector = By.css('tri-picker i.tri-calendar-picker-clear');
      const initial = fixtureInstance.modelValue = [new Date(), new Date()];
      fixtureInstance.allowClear = false;
      fixture.detectChanges();
      expect(debugElement.query(clearBtnSelector)).toBeNull();

      fixtureInstance.allowClear = true;
      tick();
      fixture.detectChanges();
      expect(fixtureInstance.modelValue).toBe(initial);
      expect(debugElement.query(clearBtnSelector)).toBeDefined();

      const onChange = spyOn(fixtureInstance, 'modelValueChange');
      debugElement.query(clearBtnSelector).nativeElement.click();
      fixture.detectChanges();
      expect(fixtureInstance.modelValue.length).toBe(0);
      expect(onChange).toHaveBeenCalledWith([]);
      expect(debugElement.query(clearBtnSelector)).toBeFalsy();
    }));

    it('should support autoFocus', () => {
      fixtureInstance.autoFocus = true;
      fixture.detectChanges();
      expect(getPickerTrigger().querySelector('input:first-child') === document.activeElement).toBeTruthy();
    });

    it('should support disabled', fakeAsync(() => {
      // Make sure picker clear button shown up
      fixtureInstance.allowClear = true;
      fixtureInstance.modelValue = [new Date(), new Date()];

      fixtureInstance.disabled = true;
      fixture.detectChanges();
      expect(debugElement.query(By.css('tri-picker .tri-input-disabled'))).toBeDefined();
      expect(debugElement.query(By.css('tri-picker i.tri-calendar-picker-clear'))).toBeNull();

      fixtureInstance.disabled = false;
      tick();
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
      fixtureInstance.modelValue = [new Date('2018-11-11 12:12:12'), null];
      fixtureInstance.disabledDate = (current: Date) => isSameDay(current, compareDate);
      fixture.detectChanges();

      dispatchMouseEvent(getPickerTrigger(), 'click');
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      const disabledCell = queryFromOverlay('.tri-calendar-range-left tbody.tri-calendar-tbody td.tri-calendar-disabled-cell');
      expect(disabledCell.textContent.trim()).toBe('15');
    }));

    it('should support locale', () => {
      const featureKey = 'LEFT_PLACEHOLDER';
      fixtureInstance.locale = {lang: {rangePlaceholder: [featureKey, 'End']}};
      fixture.detectChanges();
      expect(getPickerTrigger().querySelector('input:nth-of-type(1)').getAttribute('placeholder')).toBe(featureKey);
    });

    it('should support placeholder', () => {
      const featureKey = 'RIGHT_PLACEHOLDER';
      fixtureInstance.placeholder = ['Start', featureKey];
      fixture.detectChanges();
      expect(getPickerTrigger().querySelector('input:nth-of-type(2)').getAttribute('placeholder')).toBe(featureKey);
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

    it('should support onOpenChange', fakeAsync(() => {
      const onOpenChange = spyOn(fixtureInstance, 'onOpenChange');
      fixture.detectChanges();
      dispatchMouseEvent(getPickerTrigger(), 'click');
      fixture.detectChanges();
      tick(500);
      fixture.detectChanges();
      expect(onOpenChange).toHaveBeenCalledWith(true);

      dispatchMouseEvent(queryFromOverlay('.cdk-overlay-backdrop'), 'click');
      fixture.detectChanges();
      tick(500);
      fixture.detectChanges();
      expect(onOpenChange).toHaveBeenCalledWith(false);
      expect(onOpenChange).toHaveBeenCalledTimes(2);
    }));

    it('should support value', fakeAsync(() => {
      fixtureInstance.modelValue = [new Date('2018-11-11'), new Date('2018-12-11')];
      fixture.detectChanges();
      openPickerByClickTrigger();
      expect(getFirstSelectedDayCell().textContent.trim()).toBe('11');
    }));


    it('should support onCalendarChange', fakeAsync(() => {
      const onCalendarChange = spyOn(fixtureInstance, 'onCalendarChange');
      fixture.detectChanges();
      openPickerByClickTrigger();
      const left = getFirstCell('left');
      const leftText = left.textContent!.trim();
      dispatchMouseEvent(left, 'click');
      fixture.detectChanges();
      tick(500);
      fixture.detectChanges();
      expect(onCalendarChange).toHaveBeenCalled();
      let result = onCalendarChange.calls.allArgs()[0][0];
      expect(result[0].getDate()).toBe(+leftText);
      const right = getFirstCell('right');
      const rightText = right.textContent!.trim();
      dispatchMouseEvent(right, 'click');
      fixture.detectChanges();
      tick(500);
      fixture.detectChanges();
      expect(onCalendarChange).toHaveBeenCalled();
      result = onCalendarChange.calls.allArgs()[1][0];
      expect(result[0].getDate()).toBe(+leftText);
      expect(result[1].getDate()).toBe(+rightText);
    }));


    it('should support onChange', fakeAsync(() => {
      fixtureInstance.modelValue = [new Date('2018-11-11'), new Date('2018-11-11')];
      const onChange = spyOn(fixtureInstance, 'modelValueChange');
      fixture.detectChanges();
      openPickerByClickTrigger();

      const left = getFirstCell('left'); // Use the first cell
      const leftText = left.textContent.trim();
      dispatchMouseEvent(left, 'click');
      fixture.detectChanges();
      tick(500);
      fixture.detectChanges();
      const right = getFirstCell('right'); // NOTE: At the time "left" clicked, the date panel will be re-rendered
      const rightText = right.textContent.trim();
      dispatchMouseEvent(right, 'click');
      fixture.detectChanges();
      tick(500);
      fixture.detectChanges();
      expect(onChange).toHaveBeenCalled();
      const result = onChange.calls.allArgs()[0][0];
      expect(result[0].getDate()).toBe(+leftText);
      expect(result[1].getDate()).toBe(+rightText);
    }));

  }); // /general api testing

  describe('panel switch and move forward/afterward', () => {
    beforeEach(() => fixtureInstance.useSuite = 1);

    it('should support date panel changes', fakeAsync(() => {
      fixtureInstance.modelValue = [new Date('2018-6-11'), new Date('2018-12-12')];
      fixture.detectChanges();
      openPickerByClickTrigger();
      // Click previous year button
      dispatchMouseEvent(queryFromOverlay('.tri-calendar-range-left .tri-calendar-prev-year-btn'), 'click');
      fixture.detectChanges();
      expect(queryFromOverlay('.tri-calendar-range-left .tri-calendar-year-select').textContent.indexOf('2017') > -1).toBeTruthy();
      // Click next year button * 2
      dispatchMouseEvent(queryFromOverlay('.tri-calendar-range-left .tri-calendar-next-year-btn'), 'click');
      fixture.detectChanges();
      dispatchMouseEvent(queryFromOverlay('.tri-calendar-range-left .tri-calendar-next-year-btn'), 'click');
      fixture.detectChanges();
      expect(queryFromOverlay('.tri-calendar-range-left .tri-calendar-year-select').textContent.indexOf('2019') > -1).toBeTruthy();
      // Click previous month button
      dispatchMouseEvent(queryFromOverlay('.tri-calendar-range-left .tri-calendar-prev-month-btn'), 'click');
      fixture.detectChanges();
      expect(queryFromOverlay('.tri-calendar-range-left .tri-calendar-month-select').textContent.indexOf('5') > -1).toBeTruthy();
      // Click next month button * 2
      dispatchMouseEvent(queryFromOverlay('.tri-calendar-range-left .tri-calendar-next-month-btn'), 'click');
      fixture.detectChanges();
      dispatchMouseEvent(queryFromOverlay('.tri-calendar-range-left .tri-calendar-next-month-btn'), 'click');
      fixture.detectChanges();
      expect(queryFromOverlay('.tri-calendar-range-left .tri-calendar-month-select').textContent.indexOf('7') > -1).toBeTruthy();
    }));

  }); // /panel switch and move forward/afterward

  describe('specified date picker testing', () => {
    beforeEach(() => fixtureInstance.useSuite = 1);

    it('should support dateRender', fakeAsync(() => {
      fixtureInstance.dateRender = fixtureInstance.tplDateRender;
      fixture.detectChanges();
      openPickerByClickTrigger();
      expect(queryFromOverlay('.test-first-day').textContent.trim()).toBe('1');
    }));

    // it('should support dateRender with typeof function', fakeAsync(() => {
    //   const featureKey = 'TEST_FIRST_DAY';
    //   fixtureInstance.dateRender = (d: CandyDate) => d.getDate() === 1 ? featureKey : d.getDate();
    //   fixture.detectChanges();
    //   openPickerByClickTrigger();
    //   expect(overlayContainerElement.textContent.indexOf(featureKey) > -1).toBeTruthy();
    // }));

    it('should support showTime', fakeAsync(() => {
      const onChange = spyOn(fixtureInstance, 'modelValueChange');
      fixtureInstance.modelValue = [new Date('2018-11-11 11:22:33'), new Date('2018-12-12 11:22:33')];
      fixtureInstance.showTime = true;
      fixture.detectChanges();
      openPickerByClickTrigger();
      expect(queryFromOverlay('.tri-calendar-time-picker-btn')).toBeDefined();
      expect(queryFromOverlay('.tri-calendar-ok-btn')).toBeDefined();

      // Open time picker panel
      dispatchMouseEvent(queryFromOverlay('.tri-calendar-time-picker-btn'), 'click');
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      expect(queryFromOverlay('.tri-calendar-range-left .tri-calendar-time-picker-inner.tri-calendar-time-picker-column-3')).toBeDefined();
      expect(queryFromOverlay('.tri-calendar-range-left .tri-calendar-time-picker-select:first-child li.tri-calendar-time-picker-select-option-selected').textContent.trim()).toBe('11');

      // Click to choose a hour
      dispatchMouseEvent(queryFromOverlay('.tri-calendar-range-left .tri-calendar-time-picker-select:first-child li:first-child'), 'click');
      fixture.detectChanges();
      expect((queryFromOverlay('.tri-calendar-range-left input.tri-calendar-input') as HTMLInputElement).value).toBe('2018-11-11 00:22:33');
    }));

    it('should support showTime.format', fakeAsync(() => {
      fixtureInstance.modelValue = [new Date('2018-11-11'), new Date('2018-12-12')];
      fixtureInstance.showTime = {format: 'HH:mm'};
      fixture.detectChanges();
      openPickerByClickTrigger();

      // Open time picker panel
      dispatchMouseEvent(queryFromOverlay('.tri-calendar-time-picker-btn'), 'click');
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      expect(queryFromOverlay('.tri-calendar-range-left .tri-calendar-time-picker-inner.tri-calendar-time-picker-column-2')).toBeDefined();
    }));

    it('should support disabledTime and showTime.hideDisabledOptions', fakeAsync(() => {
      fixtureInstance.modelValue = [new Date('2018-11-11 11:11:11'), new Date('2018-12-12 12:12:12')];
      fixtureInstance.showTime = true;
      fixtureInstance.disabledTime = (current: Date, partial: 'start' | 'end') => {
        return partial === 'start' ? {
          disabledHours  : () => [0, 1, 2],
          disabledMinutes: () => [0, 1],
          disabledSeconds: () => [0]
        } : {
          disabledHours  : () => [0, 1, 2, 3],
          disabledMinutes: () => [0, 1, 2],
          disabledSeconds: () => [0, 1]
        };
      };
      fixture.detectChanges();
      openPickerByClickTrigger();

      // Open time picker panel
      dispatchMouseEvent(queryFromOverlay('.tri-calendar-time-picker-btn'), 'click');
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      // Left time picker
      expect(queryFromOverlay('.tri-calendar-range-left .tri-calendar-time-picker-select:nth-child(1) li:nth-child(3)').classList.contains('tri-calendar-time-picker-select-option-disabled')).toBeTruthy();
      expect(queryFromOverlay('.tri-calendar-range-left .tri-calendar-time-picker-select:nth-child(2) li:nth-child(2)').classList.contains('tri-calendar-time-picker-select-option-disabled')).toBeTruthy();
      expect(queryFromOverlay('.tri-calendar-range-left .tri-calendar-time-picker-select:nth-child(3) li:nth-child(1)').classList.contains('tri-calendar-time-picker-select-option-disabled')).toBeTruthy();
      // Right time picker
      expect(queryFromOverlay('.tri-calendar-range-right .tri-calendar-time-picker-select:nth-child(1) li:nth-child(4)').classList.contains('tri-calendar-time-picker-select-option-disabled')).toBeTruthy();
      expect(queryFromOverlay('.tri-calendar-range-right .tri-calendar-time-picker-select:nth-child(2) li:nth-child(3)').classList.contains('tri-calendar-time-picker-select-option-disabled')).toBeTruthy();
      expect(queryFromOverlay('.tri-calendar-range-right .tri-calendar-time-picker-select:nth-child(3) li:nth-child(2)').classList.contains('tri-calendar-time-picker-select-option-disabled')).toBeTruthy();

      // Use hideDisabledOptions to hide disabled times
      fixtureInstance.showTime = {hideDisabledOptions: true};
      fixture.detectChanges();
      // Left time picker
      expect(+queryFromOverlay('.tri-calendar-range-left .tri-calendar-time-picker-select:nth-child(1) li:first-child').textContent.trim()).toBe(3);
      expect(+queryFromOverlay('.tri-calendar-range-left .tri-calendar-time-picker-select:nth-child(2) li:first-child').textContent.trim()).toBe(2);
      expect(+queryFromOverlay('.tri-calendar-range-left .tri-calendar-time-picker-select:nth-child(3) li:first-child').textContent.trim()).toBe(1);
      // Right time picker
      expect(+queryFromOverlay('.tri-calendar-range-right .tri-calendar-time-picker-select:nth-child(1) li:first-child').textContent.trim()).toBe(4);
      expect(+queryFromOverlay('.tri-calendar-range-right .tri-calendar-time-picker-select:nth-child(2) li:first-child').textContent.trim()).toBe(3);
      expect(+queryFromOverlay('.tri-calendar-range-right .tri-calendar-time-picker-select:nth-child(3) li:first-child').textContent.trim()).toBe(2);
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

    it('should support mode', fakeAsync(() => {
      fixtureInstance.mode = ['month', 'year'];
      fixture.detectChanges();
      openPickerByClickTrigger();
      // Left panel
      expect(overlayContainerElement.querySelector('.tri-calendar-range-left .tri-calendar-header .tri-calendar-month-panel')).toBeDefined();
      // Right panel
      expect(overlayContainerElement.querySelector('.tri-calendar-range-right .tri-calendar-header .tri-calendar-year-panel')).toBeDefined();
    }));

    it('should support onPanelChange', fakeAsync(() => {
      spyOn(fixtureInstance, 'onPanelChange');
      fixture.detectChanges();
      openPickerByClickTrigger();

      // Click header to month panel
      // Left
      dispatchMouseEvent(overlayContainerElement.querySelector('.tri-calendar-range-left .tri-calendar-header .tri-calendar-month-select'), 'click');
      fixture.detectChanges();
      // Right
      dispatchMouseEvent(overlayContainerElement.querySelector('.tri-calendar-range-right .tri-calendar-header .tri-calendar-year-select'), 'click');
      fixture.detectChanges();
      expect(fixtureInstance.onPanelChange).toHaveBeenCalledWith(['month', 'year']);
    }));

    it('should support onOk', fakeAsync(() => {
      spyOn(fixtureInstance, 'onOk');
      fixtureInstance.modelValue = [new Date('2018-11-11 11:22:33'), new Date('2018-12-12 11:22:33')];
      fixtureInstance.showTime = true;
      fixture.detectChanges();
      openPickerByClickTrigger();

      // Click ok button
      dispatchMouseEvent(overlayContainerElement.querySelector('.tri-calendar-ok-btn'), 'click');
      fixture.detectChanges();
      tick(500);
      expect(fixtureInstance.onOk).toHaveBeenCalledWith(fixtureInstance.modelValue);
    }));

    it('should select date from start to end with side effects', fakeAsync(() => {
      const initial = fixtureInstance.modelValue = [new Date('2018-05-15'), new Date('2018-06-15')];
      fixtureInstance.disabledDate = (current: Date) => differenceInDays(current, initial[0]) < 0;
      fixtureInstance.showTime = true;
      fixture.detectChanges();
      openPickerByClickTrigger();

      // Click start date
      const startDate = queryFromOverlay('.tri-calendar-range-left td.tri-calendar-selected-day');
      dispatchMouseEvent(startDate, 'click');
      fixture.detectChanges();
      expect(startDate.classList.contains('tri-calendar-selected-day')).toBeTruthy();
      expect(queryFromOverlay('.tri-calendar-range-right td.tri-calendar-selected-day')).toBeFalsy(); // End panel should have no one to be selected

      let endDate: HTMLElement;
      // Hover on to the newest end date (the last date of end panel)
      endDate = getLastCell('right');
      const isNextMonthDay = endDate.classList.contains('tri-calendar-next-month-btn-day'); // Is it the date of next month
      dispatchMouseEvent(endDate, 'mouseenter');
      fixture.detectChanges();
      expect(endDate.classList.contains('tri-calendar-selected-end-date')).toBe(!isNextMonthDay); // Show as selected only at current month
      expect(startDate.nextElementSibling.classList.contains('tri-calendar-in-range-cell')).toBeTruthy(); // In range state

      // Click end date to trigger change
      endDate = getLastCell('right'); // Need to retrive due to re-render
      dispatchMouseEvent(endDate, 'click');
      fixture.detectChanges();
      expect(queryFromOverlay('.tri-calendar-range-right .tri-calendar-selected-end-date')).toBeDefined();
    }));

    it('should display expected date when the range values are the same day (include the scenario of timepicker)', fakeAsync(() => {
      fixtureInstance.modelValue = [new Date('2018-05-15'), new Date('2018-05-15')];
      fixtureInstance.showTime = true;
      fixture.detectChanges();
      openPickerByClickTrigger();

      expect(queryFromOverlay('.tri-calendar-range-right .tri-calendar-month-select').textContent).toContain('6');

      // Open time picker panel
      dispatchMouseEvent(queryFromOverlay('.tri-calendar-time-picker-btn'), 'click');
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      expect(queryFromOverlay('.tri-calendar-range-right .tri-calendar-month-select').textContent).toContain('5');
    }));

    it('should support ranges', fakeAsync(() => {
      const today = new Date();
      fixtureInstance.ranges = {'Today': [today, today]};
      fixture.detectChanges();
      openPickerByClickTrigger();
      expect(queryFromOverlay('.tri-calendar-range-quick-selector')).toBeDefined();

      let selector: HTMLElement;

      selector = queryFromOverlay('.tri-calendar-range-quick-selector > a');
      dispatchMouseEvent(selector, 'mouseenter');
      fixture.detectChanges();
      expect(queryFromOverlay('.tri-calendar-range-left td.tri-calendar-selected-day').textContent).toContain(`${today.getDate()}`);

      selector = queryFromOverlay('.tri-calendar-range-quick-selector > a');
      dispatchMouseEvent(selector, 'mouseleave');
      fixture.detectChanges();
      expect(queryFromOverlay('.tri-calendar-range-left td.tri-calendar-selected-day')).toBeFalsy();

      selector = queryFromOverlay('.tri-calendar-range-quick-selector > a');
      dispatchMouseEvent(selector, 'click');
      fixture.detectChanges();
      tick(500);
      expect(queryFromOverlay('.tri-calendar-picker-container')).toBeFalsy();
    }));

    it('should custom input date range', fakeAsync(() => {
      const onChange = spyOn(fixtureInstance, 'modelValueChange');
      fixture.detectChanges();
      openPickerByClickTrigger();
      const leftInput = queryFromOverlay('.tri-calendar-range-left input.tri-calendar-input') as HTMLInputElement;
      const rightInput = queryFromOverlay('.tri-calendar-range-right input.tri-calendar-input') as HTMLInputElement;

      leftInput.value = '2018-11-11';
      leftInput.dispatchEvent(new KeyboardEvent('keyup'));
      fixture.detectChanges();
      rightInput.value = '2018-12-12';
      rightInput.dispatchEvent(new KeyboardEvent('keyup'));
      fixture.detectChanges();
      tick(500);
      expect(onChange).toHaveBeenCalled();
      const result = onChange.calls.allArgs()[0][0];
      expect(result[0].getDate()).toBe(11);
      expect(result[1].getDate()).toBe(12);
    }));

  }); // /specified date picker testing

  describe('ngModel value accessors', () => {
    beforeEach(() => fixtureInstance.useSuite = 3);

    it('should specified date provide by "modelValue" be choosed', fakeAsync(() => {
      fixtureInstance.modelValue = [new Date('2018-11-11'), new Date('2018-12-12')];
      fixture.detectChanges();
      tick(); // Wait writeValue() tobe done
      fixture.detectChanges();
      expect(getFirstSelectedDayCell().textContent.trim()).toBe('11');

      // Click the first cell to change ngModel
      const left = getFirstCell('left');
      const leftText = left.textContent.trim();
      dispatchMouseEvent(left, 'click');
      fixture.detectChanges();
      const right = getFirstCell('right');
      const rightText = right.textContent.trim();
      dispatchMouseEvent(right, 'click');
      fixture.detectChanges();
      expect(fixtureInstance.modelValue[0].getDate()).toBe(+leftText);
      expect(fixtureInstance.modelValue[1].getDate()).toBe(+rightText);
    }));
  });

  ////////////

  function getPicker(): HTMLElement {
    return debugElement.query(By.css('tri-picker .tri-calendar-picker')).nativeElement as HTMLElement;
  }

  function getPickerTrigger(): HTMLElement {
    return debugElement.query(By.css('tri-picker .tri-calendar-picker-input')).nativeElement as HTMLElement;
  }

  function getPickerContainer(): HTMLElement {
    return queryFromOverlay('.tri-calendar-picker-container') as HTMLElement;
  }

  function getFirstSelectedDayCell(): HTMLElement {
    return queryFromOverlay('tbody.tri-calendar-tbody td.tri-calendar-selected-day') as HTMLElement;
  }

  function getFirstCell(partial: 'left' | 'right'): HTMLElement {
    return queryFromOverlay(`.tri-calendar-range-${partial} tbody.tri-calendar-tbody td.tri-calendar-cell`) as HTMLElement;
  }

  function getLastCell(partial: 'left' | 'right'): HTMLElement {
    const allCells = overlayContainerElement.querySelectorAll(`.tri-calendar-range-${partial} td.tri-calendar-cell`);
    return allCells[allCells.length - 1] as HTMLElement;
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
      <tri-range-picker *ngSwitchCase="1"
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
                        (onCalendarChange)="onCalendarChange($event)"
                        [(ngModel)]="modelValue"
                        (ngModelChange)="modelValueChange($event)"

                        [dateRender]="dateRender"
                        [disabledTime]="disabledTime"
                        [renderExtraFooter]="renderExtraFooter"
                        [showToday]="showToday"
                        [mode]="mode"
                        [ranges]="ranges"
                        (onPanelChange)="onPanelChange($event)"
                        [showTime]="showTime"
                        (onOk)="onOk($event)"
      ></tri-range-picker>
      <ng-template #tplDateRender let-current>
        <div [class.test-first-day]="current.getDate() === 1">{{ current.getDate() }}</div>
      </ng-template>
      <ng-template #tplExtraFooter>
        TEST_EXTRA_FOOTER
      </ng-template>

      <!-- Suite 2 -->
      <!-- use another picker to avoid open's side-effects beacuse open act as "true" if used -->
      <tri-range-picker *ngSwitchCase="2" [open]="open"></tri-range-picker>

      <!-- Suite 3 -->
      <tri-range-picker *ngSwitchCase="3" [open]="true" [(ngModel)]="modelValue"></tri-range-picker>
    </ng-container>
  `
})
class TestRangePickerComponent {
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
  modelValue;
  dateRender;
  showTime: boolean | object = false;
  disabledTime;
  renderExtraFooter;
  showToday = false;
  mode;
  ranges;
  // --- Suite 2
  open;

  onOpenChange(open: boolean): void {
  }

  modelValueChange(d: Date): void {
  }

  onPanelChange(evt?): void {
  }

  onCalendarChange(evt?): void {
  }

  onOk(evt?): void {
  }
}
