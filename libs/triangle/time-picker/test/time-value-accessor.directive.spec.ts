import { registerLocaleData } from '@angular/common';
import zh from '@angular/common/locales/zh';
import { Component, ViewChild } from '@angular/core';
import { async, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { dispatchFakeEvent } from '@gradii/triangle/core/testing';
import { TriI18nModule } from '@gradii/triangle/i18n';
import { ɵTimeValueAccessorDirective as TimeValueAccessorDirective } from '@gradii/triangle/time-picker';

registerLocaleData(zh);

describe('input-time', () => {
  let testComponent;
  let fixture;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports     : [FormsModule, TriI18nModule],
      declarations: [TimeValueAccessorDirective, TestTimeInputComponent]
    });
    TestBed.compileComponents();
  }));
  describe('basic input-time', () => {
    let inputElement;
    beforeEach(() => {
      fixture = TestBed.createComponent(TestTimeInputComponent);
      testComponent = fixture.debugElement.componentInstance;
      fixture.detectChanges();
      inputElement = fixture.debugElement.query(By.directive(TimeValueAccessorDirective));
    });
    it('should format correct', fakeAsync(() => {
      fixture.detectChanges();
      testComponent.value = new Date(0, 0, 0, 0, 0, 0);
      flush();
      fixture.detectChanges();
      flush();
      expect(inputElement.nativeElement.value).toBe('00:00:00');
    }));
    it('should parse correct', fakeAsync(() => {
      inputElement.nativeElement.value = '01:01:01';
      dispatchFakeEvent(inputElement.nativeElement, 'keyup');
      dispatchFakeEvent(inputElement.nativeElement, 'blur');
      fixture.detectChanges();
      flush();
      fixture.detectChanges();
      flush();
      expect(testComponent.value).toEqual(new Date(1970, 0, 1, 1, 1, 1));
    }));
    it('should focus work', fakeAsync(() => {
      fixture.detectChanges();
      flush();
      fixture.detectChanges();
      flush();
      testComponent.timeValueAccessorDirective.setRange();
      expect(inputElement.nativeElement === document.activeElement).toBe(true);
    }));
  });
});

@Component({
  selector: 'test-time-input',
  template: `<input [(ngModel)]="value" [triTime]="'HH:mm:ss'">`
})
export class TestTimeInputComponent {
  @ViewChild(TimeValueAccessorDirective, {static: false}) timeValueAccessorDirective: TimeValueAccessorDirective;
  value = new Date(0, 0, 0, 0, 0, 0);
}
