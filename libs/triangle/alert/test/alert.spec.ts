import { Component, TemplateRef, ViewChild } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AlertComponent, TriAlertModule } from '@gradii/triangle/alert';

describe('alert', () => {
  beforeEach(fakeAsync(() => {
    TestBed.configureTestingModule({
      imports     : [TriAlertModule, NoopAnimationsModule],
      declarations: [DemoTestBasicComponent, DemoTestBannerComponent]
    });
    TestBed.compileComponents();
  }));
  describe('basic alert', () => {
    let fixture;
    let testComponent;
    let alert;
    beforeEach(() => {
      fixture = TestBed.createComponent(DemoTestBasicComponent);
      fixture.detectChanges();
      testComponent = fixture.debugElement.componentInstance;
      alert = fixture.debugElement.query(By.directive(AlertComponent));
    });
    it('should className correct', () => {
      fixture.detectChanges();
      expect(alert.nativeElement.firstElementChild.classList).toContain('tri-alert');
    });
    it('should banner work', () => {
      fixture.detectChanges();
      expect(alert.nativeElement.firstElementChild.classList).not.toContain('tri-alert-banner');
      expect(alert.nativeElement.querySelector('.tri-alert').classList).toContain(`tri-alert-info`);
      expect(alert.nativeElement.querySelector('.tri-alert-icon')).toBeNull();
      testComponent.banner = true;
      fixture.detectChanges();
      expect(alert.nativeElement.firstElementChild.classList).toContain('tri-alert-banner');
      expect(alert.nativeElement.querySelector('.tri-alert').classList).toContain(`tri-alert-info`);
      expect(alert.nativeElement.querySelector('.tri-alert-icon')).toBeNull();
    });
    it('should closeable work', fakeAsync(() => {
      testComponent.closeable = true;
      fixture.detectChanges();
      expect(testComponent.onClose).toHaveBeenCalledTimes(0);
      expect(alert.nativeElement.querySelector('.anticon-cross')).toBeDefined();
      alert.nativeElement.querySelector('.tri-alert-close-icon').click();
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      alert = fixture.debugElement.query(By.directive(AlertComponent));
      expect(alert.nativeElement.innerText).toBe('');
      expect(testComponent.onClose).toHaveBeenCalledTimes(1);
    }));
    it('should closeText work', () => {
      fixture.detectChanges();
      expect(alert.nativeElement.querySelector('.tri-alert-close-icon')).toBeNull();
      testComponent.closeText = 'closeText';
      fixture.detectChanges();
      expect(alert.nativeElement.querySelector('.tri-alert-close-icon').innerText).toBe('closeText');
      testComponent.closeText = testComponent.template;
      fixture.detectChanges();
      expect(alert.nativeElement.querySelector('.tri-alert-close-icon').innerText).toBe('template');
    });
    it('should description work', () => {
      fixture.detectChanges();
      expect(alert.nativeElement.querySelector('.tri-alert-description').innerText).toBe('description');
      testComponent.description = testComponent.template;
      fixture.detectChanges();
      expect(alert.nativeElement.querySelector('.tri-alert-description').innerText).toBe('template');
    });
    it('should message work', () => {
      fixture.detectChanges();
      expect(alert.nativeElement.querySelector('.tri-alert-message').innerText).toBe('message');
      testComponent.message = testComponent.template;
      fixture.detectChanges();
      expect(alert.nativeElement.querySelector('.tri-alert-message').innerText).toBe('template');
    });
    it('should showIcon work', () => {
      fixture.detectChanges();
      expect(alert.nativeElement.querySelector('.tri-alert-icon')).toBeNull();
      testComponent.showIcon = true;
      expect(alert.nativeElement.querySelector('.tri-alert-icon')).toBeDefined();
    });
    it('should iconType work', () => {
      fixture.detectChanges();
      testComponent.showIcon = true;
      testComponent.iconType = 'anticon anticon-lock';
      fixture.detectChanges();
      expect(alert.nativeElement.querySelector('.tri-alert-icon').classList).toContain('anticon');
      expect(alert.nativeElement.querySelector('.tri-alert-icon').classList).toContain('anticon-lock');
    });
    it('should type work', () => {
      const listOfType = ['success', 'info', 'warning', 'error'];
      listOfType.forEach(type => {
        testComponent.type = type;
        fixture.detectChanges();
        expect(alert.nativeElement.querySelector('.tri-alert').classList).toContain(`tri-alert-${type}`);
      });
    });
  });
  describe('banner alert', () => {
    let fixture;
    let testComponent;
    let alert;
    beforeEach(() => {
      fixture = TestBed.createComponent(DemoTestBannerComponent);
      fixture.detectChanges();
      testComponent = fixture.debugElement.componentInstance;
      alert = fixture.debugElement.query(By.directive(AlertComponent));
    });
    it('should banner work', () => {
      fixture.detectChanges();
      expect(alert.nativeElement.querySelector('.tri-alert').classList).toContain(`tri-alert-warning`);
      expect(alert.nativeElement.querySelector('.tri-alert-icon')).toBeDefined();
    });
  });
});

@Component({
  selector: 'test-alert-basic',
  template: `
    <ng-template #template>template</ng-template>
    <tri-alert
      [banner]="banner"
      [closeable]="closeable"
      [closeText]="closeText"
      [description]="description"
      [message]="message"
      [showIcon]="showIcon"
      [iconType]="iconType"
      [type]="type"
      (onClose)="onClose($event)">
    </tri-alert>
  `
})
export class DemoTestBasicComponent {
  @ViewChild('template', {static: false}) template: TemplateRef<void>;
  banner = false;
  closeable = false;
  closeText;
  description = 'description';
  message = 'message';
  showIcon = false;
  iconType;
  type = 'info';
  onClose = jasmine.createSpy('close callback');
}

@Component({
  selector: 'test-alert-banner',
  template: `
    <tri-alert [banner]="true">
    </tri-alert>
  `
})
export class DemoTestBannerComponent {
}
