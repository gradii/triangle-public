import { Component, NO_ERRORS_SCHEMA, ViewChild, ViewEncapsulation } from '@angular/core';
import { async, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { TriI18nModule } from '@gradii/triangle/i18n';
import { ɵTimePickerPanelComponent as TimePickerPanelComponent } from '@gradii/triangle/time-picker';

describe('time-picker-panel', () => {
  let testComponent;
  let fixture;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports     : [FormsModule, TriI18nModule],
      schemas     : [NO_ERRORS_SCHEMA],
      declarations: [
        TimePickerPanelComponent,
        TestTimePanelComponent,
        TestTimePanelDisabledComponent
      ]
    });
    TestBed.compileComponents();
  }));
  describe('basic time-picker-panel', () => {
    let panelElement;
    beforeEach(() => {
      fixture = TestBed.createComponent(TestTimePanelComponent);
      testComponent = fixture.debugElement.componentInstance;
      fixture.detectChanges();
      panelElement = fixture.debugElement.query(By.directive(TimePickerPanelComponent));
    });
    it('should init correct', () => {
      testComponent.inDatePicker = true;
      fixture.detectChanges();
      expect(panelElement.nativeElement.classList).toContain('tri-time-picker-panel');
    });
    it('should clear work', fakeAsync(() => {
      fixture.detectChanges();
      testComponent.value = new Date(0, 0, 0, 0, 0, 0);
      panelElement.nativeElement.querySelector('.tri-time-picker-panel-clear-btn').click();
      fixture.detectChanges();
      flush();
      fixture.detectChanges();
      expect(testComponent.value).toBeUndefined();
    }));
    it('should format work', () => {
      fixture.detectChanges();
      expect(testComponent.timePickerPanelComponent.hourEnabled).toBe(true);
      expect(testComponent.timePickerPanelComponent.minuteEnabled).toBe(true);
      expect(testComponent.timePickerPanelComponent.secondEnabled).toBe(true);
      expect(testComponent.timePickerPanelComponent.enabledColumns).toBe(3);
      testComponent.format = 'HH:mm';
      fixture.detectChanges();
      expect(testComponent.timePickerPanelComponent.hourEnabled).toBe(true);
      expect(testComponent.timePickerPanelComponent.minuteEnabled).toBe(true);
      expect(testComponent.timePickerPanelComponent.secondEnabled).toBe(false);
      expect(testComponent.timePickerPanelComponent.enabledColumns).toBe(2);
      testComponent.format = null;
      fixture.detectChanges();
      expect(testComponent.timePickerPanelComponent.hourEnabled).toBe(true);
      expect(testComponent.timePickerPanelComponent.minuteEnabled).toBe(true);
      expect(testComponent.timePickerPanelComponent.secondEnabled).toBe(false);
      expect(testComponent.timePickerPanelComponent.enabledColumns).toBe(2);
    });
    it('should default open value work', fakeAsync(() => {
      testComponent.timePickerPanelComponent.opened = true;
      fixture.detectChanges();
      tick(1000);
      fixture.detectChanges();
      let listOfSelectedLi = panelElement.nativeElement.querySelectorAll('.tri-time-picker-panel-select-option-selected');
      expect(listOfSelectedLi[0].innerText).toBe('10');
      expect(listOfSelectedLi[1].innerText).toBe('11');
      expect(listOfSelectedLi[2].innerText).toBe('12');
      listOfSelectedLi.forEach(li => {
        expect(li.parentElement.parentElement.scrollTop).toBe(li.offsetTop);
      });
      testComponent.value = new Date(0, 0, 0, 8, 9, 10);
      fixture.detectChanges();
      flush();
      fixture.detectChanges();
      flush();
      listOfSelectedLi = panelElement.nativeElement.querySelectorAll('.tri-time-picker-panel-select-option-selected');
      expect(listOfSelectedLi[0].innerText).toBe('08');
      expect(listOfSelectedLi[1].innerText).toBe('09');
      expect(listOfSelectedLi[2].innerText).toBe('10');
    }));
    it('should select scroll work', fakeAsync(() => {
      testComponent.value = new Date(0, 0, 0, 8, 9, 10);
      fixture.detectChanges();
      flush();
      fixture.detectChanges();
      flush();
      let listOfSelectedLi = panelElement.nativeElement.querySelectorAll('.tri-time-picker-panel-select-option-selected');
      expect(listOfSelectedLi[0].innerText).toBe('08');
      expect(listOfSelectedLi[1].innerText).toBe('09');
      expect(listOfSelectedLi[2].innerText).toBe('10');
      testComponent.timePickerPanelComponent.selectHour({index: 0, disabled: false});
      testComponent.timePickerPanelComponent.selectMinute({index: 1, disabled: false});
      testComponent.timePickerPanelComponent.selectSecond({index: 2, disabled: false});
      fixture.detectChanges();
      flush();
      fixture.detectChanges();
      flush();
      listOfSelectedLi = panelElement.nativeElement.querySelectorAll('.tri-time-picker-panel-select-option-selected');
      expect(listOfSelectedLi[0].innerText).toBe('00');
      expect(listOfSelectedLi[1].innerText).toBe('01');
      expect(listOfSelectedLi[2].innerText).toBe('02');
    }));
    it('should step work', () => {
      fixture.detectChanges();
      let listOfSelectContainer = panelElement.nativeElement.querySelectorAll('.tri-time-picker-panel-select');
      expect(listOfSelectContainer[0].firstElementChild.children.length).toEqual(24);
      expect(listOfSelectContainer[1].firstElementChild.children.length).toEqual(60);
      expect(listOfSelectContainer[2].firstElementChild.children.length).toEqual(60);
      testComponent.hourStep = 2;
      testComponent.minuteStep = 15;
      testComponent.secondStep = 10;
      fixture.detectChanges();
      listOfSelectContainer = panelElement.nativeElement.querySelectorAll('.tri-time-picker-panel-select');
      expect(listOfSelectContainer[0].firstElementChild.children.length).toEqual(12);
      expect(listOfSelectContainer[1].firstElementChild.children.length).toEqual(4);
      expect(listOfSelectContainer[2].firstElementChild.children.length).toEqual(6);
    });
  });
  describe('disabled time-picker-panel', () => {
    let panelElement;
    beforeEach(() => {
      fixture = TestBed.createComponent(TestTimePanelDisabledComponent);
      testComponent = fixture.debugElement.componentInstance;
      fixture.detectChanges();
      panelElement = fixture.debugElement.query(By.directive(TimePickerPanelComponent));
    });
    it('should disabled work', fakeAsync(() => {
      fixture.detectChanges();
      flush();
      fixture.detectChanges();
      flush();
      const listOfSelectContainer = panelElement.nativeElement.querySelectorAll('.tri-time-picker-panel-select');
      expect(listOfSelectContainer[0].querySelectorAll('.tri-time-picker-panel-select-option-disabled').length).toBe(3);
      expect(listOfSelectContainer[1].querySelectorAll('.tri-time-picker-panel-select-option-disabled').length).toBe(0);
      expect(listOfSelectContainer[2].querySelectorAll('.tri-time-picker-panel-select-option-disabled').length).toBe(0);
      testComponent.timePickerPanelComponent.selectHour({index: 4, disabled: false});
      fixture.detectChanges();
      expect(listOfSelectContainer[1].querySelectorAll('.tri-time-picker-panel-select-option-disabled').length).toBe(6);
      testComponent.timePickerPanelComponent.selectHour({index: 5, disabled: false});
      testComponent.timePickerPanelComponent.selectMinute({index: 1, disabled: false});
      fixture.detectChanges();
      expect(listOfSelectContainer[2].querySelectorAll('.tri-time-picker-panel-select-option-disabled').length).toBe(6);
      testComponent.hideDisabledOptions = true;
      fixture.detectChanges();
      expect(listOfSelectContainer[0].firstElementChild.children.length).toBe(21);
      expect(listOfSelectContainer[2].firstElementChild.children.length).toBe(54);
    }));
  });
});

@Component({
  selector     : 'nz-test-time-panel',
  encapsulation: ViewEncapsulation.None,
  template     : `
    <tri-time-picker-panel
      [(ngModel)]="value"
      [format]="format"
      [defaultOpenValue]="openValue"
      [secondStep]="secondStep"
      [minuteStep]="minuteStep"
      [hourStep]="hourStep">
    </tri-time-picker-panel>`,
  // styleUrls    : [
  //   '../style/index.less',
  //   './style/index.less'
  // ]
})
export class TestTimePanelComponent {
  secondStep = 1;
  minuteStep = 1;
  hourStep = 1;
  @ViewChild(TimePickerPanelComponent, {static: false}) timePickerPanelComponent: TimePickerPanelComponent;
  value;
  openValue = new Date(0, 0, 0, 10, 11, 12);
  format = 'HH:mm:ss';
}

@Component({
  selector     : 'nz-test-time-panel-disabled',
  encapsulation: ViewEncapsulation.None,
  template     : `
    <tri-time-picker-panel
      [(ngModel)]="value"
      [format]="format"
      [disabledHours]="disabledHours"
      [disabledMinutes]="disabledMinutes"
      [disabledSeconds]="disabledSeconds"
      [defaultOpenValue]="openValue"
      [secondStep]="secondStep"
      [minuteStep]="minuteStep"
      [inDatePicker]="inDatePicker"
      [hideDisabledOptions]="hideDisabledOptions"
      [hourStep]="hourStep">
    </tri-time-picker-panel>`,
  // styleUrls    : [
  //   '../style/index.less',
  //   './style/index.less'
  // ]
})
export class TestTimePanelDisabledComponent {
  inDatePicker = false;
  secondStep = 1;
  minuteStep = 1;
  hourStep = 1;
  hideDisabledOptions = false;
  @ViewChild(TimePickerPanelComponent, {static: false}) timePickerPanelComponent: TimePickerPanelComponent;
  value = new Date(0, 0, 0, 0, 0, 0);
  openValue = new Date(0, 0, 0, 10, 11, 12);
  format = 'HH:mm:ss';

  disabledHours(): number[] {
    return [1, 2, 3];
  }

  disabledMinutes(hour: number): number[] {
    if (hour === 4) {
      return [20, 21, 22, 23, 24, 25];
    } else {
      return [];
    }
  }

  disabledSeconds(hour: number, minute: number): number[] {
    if ((hour === 5) && (minute === 1)) {
      return [20, 21, 22, 23, 24, 25];
    } else {
      return [];
    }
  }
}
