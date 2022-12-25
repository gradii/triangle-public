import { OverlayContainer } from '@angular/cdk/overlay';
import { registerLocaleData } from '@angular/common';
import zh from '@angular/common/locales/zh';
import { Component, NO_ERRORS_SCHEMA, ViewChild } from '@angular/core';
import { async, inject, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TriI18nModule } from '@gradii/triangle/i18n';
import { TimePickerComponent, TriTimePickerModule } from '@gradii/triangle/time-picker';

registerLocaleData(zh);

describe('time-picker', () => {
  let overlayContainer: OverlayContainer;
  let overlayContainerElement: HTMLElement;
  let testComponent;
  let fixture;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports     : [NoopAnimationsModule, FormsModule, TriI18nModule, TriTimePickerModule],
      schemas     : [NO_ERRORS_SCHEMA],
      declarations: [TestTimePickerComponent]
    });
    TestBed.compileComponents();
    inject([OverlayContainer], (oc: OverlayContainer) => {
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    })();
  }));
  afterEach(inject([OverlayContainer], (currentOverlayContainer: OverlayContainer) => {
    currentOverlayContainer.ngOnDestroy();
    overlayContainer.ngOnDestroy();
  }));
  describe('basic time-picker', () => {
    let timeElement;
    beforeEach(() => {
      fixture = TestBed.createComponent(TestTimePickerComponent);
      testComponent = fixture.debugElement.componentInstance;
      fixture.detectChanges();
      timeElement = fixture.debugElement.query(By.directive(TimePickerComponent));
    });
    it('should init work', () => {
      fixture.detectChanges();
      expect(timeElement.nativeElement.classList).toContain('tri-time-picker');
    });
    it('should autofocus work', () => {
      fixture.detectChanges();
      testComponent.autoFocus = true;
      fixture.detectChanges();
      expect(timeElement.nativeElement.querySelector('input').attributes.getNamedItem('autofocus').name).toBe('autofocus');
      testComponent.autoFocus = false;
      fixture.detectChanges();
      expect(timeElement.nativeElement.querySelector('input').attributes.getNamedItem('autofocus')).toBe(null);
    });
    it('should focus and blur function work', () => {
      fixture.detectChanges();
      expect(timeElement.nativeElement.querySelector('input') === document.activeElement).toBe(false);
      testComponent.timePickerComponent.focus();
      fixture.detectChanges();
      expect(timeElement.nativeElement.querySelector('input') === document.activeElement).toBe(true);
      testComponent.timePickerComponent.blur();
      fixture.detectChanges();
      expect(timeElement.nativeElement.querySelector('input') === document.activeElement).toBe(false);
    });
    it('should disabled work', () => {
      fixture.detectChanges();
      expect(timeElement.nativeElement.querySelector('input').attributes.getNamedItem('disabled')).toBeNull();
      testComponent.disabled = true;
      fixture.detectChanges();
      expect(timeElement.nativeElement.querySelector('input').attributes.getNamedItem('disabled')).toBeDefined();
      testComponent.timePickerComponent.setDisabledState(false);
      fixture.detectChanges();
      expect(timeElement.nativeElement.querySelector('input').attributes.getNamedItem('disabled')).toBeNull();
    });
    it('should open and close work', () => {
      testComponent.open = true;
      fixture.detectChanges();
      expect(testComponent.openChange).toHaveBeenCalledTimes(0);
      testComponent.timePickerComponent.onClose();
      fixture.detectChanges();
      expect(testComponent.openChange).toHaveBeenCalledTimes(2);
      expect(testComponent.open).toBe(false);
      testComponent.timePickerComponent.onOpen();
      fixture.detectChanges();
      expect(testComponent.openChange).toHaveBeenCalledTimes(3);
      expect(testComponent.open).toBe(true);
    });
  });
});

@Component({
  selector: 'test-time-picker',
  template: `
    <tri-time-picker
      [autoFocus]="autoFocus"
      [(ngModel)]="date"
      [allowEmpty]="false"
      [(open)]="open"
      (openChange)="openChange($event)"
      [disabled]="disabled"></tri-time-picker>`
})
export class TestTimePickerComponent {
  open = false;
  openChange = jasmine.createSpy('open change');
  autoFocus = false;
  date = new Date();
  disabled = false;
  @ViewChild(TimePickerComponent, {static: false}) timePickerComponent: TimePickerComponent;
}
