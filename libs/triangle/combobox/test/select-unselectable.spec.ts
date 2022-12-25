import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { SelectUnselectableDirective } from '../src/select/select-unselectable.directive';

describe('select unselectable', () => {
  beforeEach(fakeAsync(() => {
    TestBed.configureTestingModule({
      imports     : [],
      declarations: [TestSelectUnselectableComponent, SelectUnselectableDirective]
    });
    TestBed.compileComponents();
  }));
  describe('basic select unselectable', () => {
    let fixture: ComponentFixture<TestSelectUnselectableComponent>;
    let unselectable: DebugElement;
    beforeEach(() => {
      fixture = TestBed.createComponent(TestSelectUnselectableComponent);
      fixture.detectChanges();
      unselectable = fixture.debugElement.query(By.directive(SelectUnselectableDirective));
    });
    it('should unselectable style work', () => {
      fixture.detectChanges();
      expect(unselectable.nativeElement.attributes.getNamedItem('unselectable').name).toBe('unselectable');
      expect(unselectable.nativeElement.style.userSelect).toBe('none');
    });
  });
});

@Component({
  selector: 'nz-test-select-unselectable',
  template: `
    <div tri-select-unselectable></div>
  `
})
export class TestSelectUnselectableComponent {
}
