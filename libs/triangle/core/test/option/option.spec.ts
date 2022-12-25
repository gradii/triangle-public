import { ENTER, SPACE } from '@angular/cdk/keycodes';
import { Component } from '@angular/core';
import { async, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { OptionComponent, TriOptionModule } from '@gradii/triangle/core';
import {
  createKeyboardEvent,
  dispatchEvent,
  dispatchKeyboardEvent,
} from '@gradii/triangle/core/testing';

describe('OptionComponent component', () => {

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [TriOptionModule],
      declarations: [BasicOption]
    }).compileComponents();
  }));

  it('should complete the `stateChanges` stream on destroy', () => {
    const fixture = TestBed.createComponent(BasicOption);
    fixture.detectChanges();

    const optionInstance: OptionComponent =
            fixture.debugElement.query(By.directive(OptionComponent)).componentInstance;
    const completeSpy = jasmine.createSpy('complete spy');
    const subscription = optionInstance._stateChanges.subscribe(undefined, undefined, completeSpy);

    fixture.destroy();
    expect(completeSpy).toHaveBeenCalled();
    subscription.unsubscribe();
  });

  it('should not emit to `onSelectionChange` if selecting an already-selected option', () => {
    const fixture = TestBed.createComponent(BasicOption);
    fixture.detectChanges();

    const optionInstance: OptionComponent =
            fixture.debugElement.query(By.directive(OptionComponent)).componentInstance;

    optionInstance.select();
    expect(optionInstance.selected).toBe(true);

    const spy = jasmine.createSpy('selection change spy');
    const subscription = optionInstance.onSelectionChange.subscribe(spy);

    optionInstance.select();
    fixture.detectChanges();

    expect(optionInstance.selected).toBe(true);
    expect(spy).not.toHaveBeenCalled();

    subscription.unsubscribe();
  });

  it('should not emit to `onSelectionChange` if deselecting an unselected option', () => {
    const fixture = TestBed.createComponent(BasicOption);
    fixture.detectChanges();

    const optionInstance: OptionComponent =
            fixture.debugElement.query(By.directive(OptionComponent)).componentInstance;

    optionInstance.deselect();
    expect(optionInstance.selected).toBe(false);

    const spy = jasmine.createSpy('selection change spy');
    const subscription = optionInstance.onSelectionChange.subscribe(spy);

    optionInstance.deselect();
    fixture.detectChanges();

    expect(optionInstance.selected).toBe(false);
    expect(spy).not.toHaveBeenCalled();

    subscription.unsubscribe();
  });

  it('should be able to set a custom id', () => {
    const fixture = TestBed.createComponent(BasicOption);

    fixture.componentInstance.id = 'custom-option';
    fixture.detectChanges();

    const optionInstance = fixture.debugElement.query(By.directive(OptionComponent)).componentInstance;

    expect(optionInstance.id).toBe('custom-option');
  });

  it('should select the option when pressing space', () => {
    const fixture = TestBed.createComponent(BasicOption);
    fixture.detectChanges();

    const optionDebugElement = fixture.debugElement.query(By.directive(OptionComponent));
    const optionNativeElement: HTMLElement = optionDebugElement.nativeElement;
    const optionInstance: OptionComponent = optionDebugElement.componentInstance;
    const spy = jasmine.createSpy('selection change spy');
    const subscription = optionInstance.onSelectionChange.subscribe(spy);

    const event = dispatchKeyboardEvent(optionNativeElement, 'keydown', SPACE);
    fixture.detectChanges();

    expect(spy).toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(true);
    subscription.unsubscribe();
  });

  it('should select the option when pressing enter', () => {
    const fixture = TestBed.createComponent(BasicOption);
    fixture.detectChanges();

    const optionDebugElement = fixture.debugElement.query(By.directive(OptionComponent));
    const optionNativeElement: HTMLElement = optionDebugElement.nativeElement;
    const optionInstance: OptionComponent = optionDebugElement.componentInstance;
    const spy = jasmine.createSpy('selection change spy');
    const subscription = optionInstance.onSelectionChange.subscribe(spy);

    const event = dispatchKeyboardEvent(optionNativeElement, 'keydown', ENTER);
    fixture.detectChanges();

    expect(spy).toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(true);
    subscription.unsubscribe();
  });

  it('should not do anything when pressing the selection keys with a modifier', () => {
    const fixture = TestBed.createComponent(BasicOption);
    fixture.detectChanges();

    const optionDebugElement = fixture.debugElement.query(By.directive(OptionComponent));
    const optionNativeElement: HTMLElement = optionDebugElement.nativeElement;
    const optionInstance: OptionComponent = optionDebugElement.componentInstance;
    const spy = jasmine.createSpy('selection change spy');
    const subscription = optionInstance.onSelectionChange.subscribe(spy);

    [ENTER, SPACE].forEach(key => {
      const event = createKeyboardEvent('keydown', key);
      Object.defineProperty(event, 'shiftKey', {get: () => true});
      dispatchEvent(optionNativeElement, event);
      fixture.detectChanges();

      expect(event.defaultPrevented).toBe(false);
    });

    expect(spy).not.toHaveBeenCalled();
    subscription.unsubscribe();
  });

});

@Component({
  template: `
    <tri-option [id]="id" [disabled]="disabled"></tri-option>`
})
class BasicOption {
  disabled: boolean;
  id: string;
}
