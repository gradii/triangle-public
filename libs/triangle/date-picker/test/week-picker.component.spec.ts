import { OverlayContainer } from '@angular/cdk/overlay';
import { registerLocaleData } from '@angular/common';
import zh from '@angular/common/locales/zh';
import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, fakeAsync, inject, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { dispatchMouseEvent } from '@gradii/triangle/core/testing';
import { TriDatePickerModule } from '@gradii/triangle/date-picker';

registerLocaleData(zh);

describe('WeekPickerComponent', () => {
  let fixture: ComponentFixture<TestWeekPickerComponent>;
  let fixtureInstance: TestWeekPickerComponent;
  let overlayContainer: OverlayContainer;
  let overlayContainerElement: HTMLElement;
  let debugElement: DebugElement;

  beforeEach(fakeAsync(() => {
    TestBed.configureTestingModule({
      imports     : [NoopAnimationsModule, TriDatePickerModule],
      declarations: [TestWeekPickerComponent]
    });

    TestBed.compileComponents();
  }));

  beforeEach(inject([OverlayContainer], (oc: OverlayContainer) => {
    overlayContainer = oc;
    overlayContainerElement = oc.getContainerElement();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestWeekPickerComponent);
    fixtureInstance = fixture.componentInstance;
    debugElement = fixture.debugElement;
  });

  afterEach(() => {
    overlayContainer.ngOnDestroy();
  });
  it('should show week num', fakeAsync(() => {
    fixtureInstance.format = null; // cover branch
    fixture.detectChanges();
    tick(3000);
    fixture.detectChanges();
    openPickerByClickTrigger();
    tick(3000);
    fixture.detectChanges();
    expect(queryFromOverlay('.tri-calendar-week-number-cell')).toBeDefined();
  }));

  ////////////

  function getPickerTrigger(): HTMLInputElement {
    return debugElement.query(By.css('tri-picker input.tri-calendar-picker-input')).nativeElement as HTMLInputElement;
  }

  function queryFromOverlay(selector: string): HTMLElement {
    return overlayContainerElement.querySelector(selector) as HTMLElement;
  }

  function openPickerByClickTrigger(): void {
    dispatchMouseEvent(getPickerTrigger(), 'click');
    fixture.detectChanges();
  }

});

@Component({
  template: `
    <tri-week-picker [format]="format"></tri-week-picker>
  `
})
export class TestWeekPickerComponent {
  format;
}
