import { Component } from '@angular/core';
/* tslint:disable:no-unused-variable */
import { async, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { InputNumberComponent } from './input-number.component';
import { TriInputNumberModule } from './input-number.module';

describe('input number', () => {
  let testComponent;
  let fixture;
  let debugElement;
  describe('input number test int', () => {
    beforeEach(
      async(() => {
        TestBed.configureTestingModule({
          imports     : [TriInputNumberModule, FormsModule],
          declarations: [InputNumberComponentIntSpecComponent],
          providers   : []
        }).compileComponents();
      })
    );

    beforeEach(() => {
      fixture = TestBed.createComponent(InputNumberComponentIntSpecComponent);
      testComponent = fixture.debugElement.componentInstance;
      debugElement = fixture.debugElement.query(By.directive(InputNumberComponent));
    });
    it(
      'should disabled up and down work',
      fakeAsync(() => {
        fixture.detectChanges();
        const handlerDownElement = debugElement.nativeElement.querySelector('.tri-input-number-handler-down');
        expect(handlerDownElement.classList.contains('tri-input-number-handler-down-disabled')).toBe(true);
        handlerDownElement.click();
        fixture.detectChanges();
        expect(testComponent.initValue).toBe(1);
        testComponent.initValue = 9;
        fixture.detectChanges();
        tick();
        const handlerUpElement = debugElement.nativeElement.querySelector('.tri-input-number-handler-up');
        handlerUpElement.click();
        fixture.detectChanges();
        expect(handlerUpElement.classList.contains('tri-input-number-handler-up-disabled')).toBe(true);
        expect(testComponent.initValue).toBe(10);
      })
    );
    it('should disable style work', () => {
      testComponent.isDisabled = true;
      fixture.detectChanges();
      expect(debugElement.nativeElement.classList.contains('tri-input-number-disabled')).toBe(true);
    });
    it(
      'should size style work',
      fakeAsync(() => {
        testComponent.size = 'large';
        tick();
        fixture.detectChanges();
        expect(debugElement.nativeElement.classList.contains('tri-input-number-lg')).toBe(true);
        testComponent.size = 'small';
        tick();
        fixture.detectChanges();
        expect(debugElement.nativeElement.classList.contains('tri-input-number-sm')).toBe(true);
      })
    );
  });
  describe('input number test digit', () => {
    beforeEach(
      async(() => {
        TestBed.configureTestingModule({
          imports     : [TriInputNumberModule, FormsModule],
          declarations: [InputNumberComponentDigitSpecComponent],
          providers   : []
        }).compileComponents();
      })
    );

    beforeEach(() => {
      fixture = TestBed.createComponent(InputNumberComponentDigitSpecComponent);
      testComponent = fixture.debugElement.componentInstance;
      debugElement = fixture.debugElement.query(By.directive(InputNumberComponent));
    });
    it(
      'should disabled up and down work',
      fakeAsync(() => {
        fixture.detectChanges();
        const handlerDownElement = debugElement.nativeElement.querySelector('.tri-input-number-handler-down');
        expect(handlerDownElement.classList.contains('tri-input-number-handler-down-disabled')).toBe(true);
        handlerDownElement.click();
        fixture.detectChanges();
        expect(testComponent.initValue).toBe(1);
        testComponent.initValue = 9.9;
        fixture.detectChanges();
        tick();
        const handlerUpElement = debugElement.nativeElement.querySelector('.tri-input-number-handler-up');
        handlerUpElement.click();
        fixture.detectChanges();
        expect(handlerUpElement.classList.contains('tri-input-number-handler-up-disabled')).toBe(true);
        expect(testComponent.initValue).toBe(10);
      })
    );
  });
});

/** Test component that contains an InputNumber. */

@Component({
  selector: 'tri-input-number-component-int-spec',
  template: `
    <tri-input-number [size]="size" [(ngModel)]="initValue" [min]="1" [max]="10" [step]="1" [disabled]="isDisabled"></tri-input-number>
  `
})
export class InputNumberComponentIntSpecComponent {
  isDisabled = false;
  initValue = 1;
  size = 'default';
}

@Component({
  selector: 'tri-input-number-component-digit-spec',
  template: `
    <tri-input-number [(ngModel)]="initValue" [min]="1" [max]="10" [step]="0.1"></tri-input-number>
  `
})
export class InputNumberComponentDigitSpecComponent {
  initValue = 1;
}
