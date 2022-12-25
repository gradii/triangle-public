import { Component, DebugElement } from '@angular/core';
/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ButtonGroupComponent, TriButtonModule } from '@gradii/triangle/button';

describe('TriButton', () => {
  let testComponent;
  let fixture;
  let buttonDebugElement;
  let fixtureGroup: ComponentFixture<TestAppGroup>;
  let groupDebugElement: DebugElement;
  let groupInstance: ButtonGroupComponent;
  let testComponentGroup: TestAppGroup;
  describe('TriButton without disabled', () => {
    beforeEach(
      async(() => {
        TestBed.configureTestingModule({
          imports     : [TriButtonModule],
          declarations: [TestApp],
          providers   : []
        }).compileComponents();
      })
    );

    beforeEach(() => {
      fixture = TestBed.createComponent(TestApp);
      testComponent = fixture.debugElement.componentInstance;
      buttonDebugElement = fixture.debugElement.query(By.css('button'));
    });

    it('should apply class based on type attribute', () => {
      testComponent.color = 'primary';
      fixture.detectChanges();
      expect(buttonDebugElement.nativeElement.classList.contains('tri-btn-primary')).toBe(true);

      testComponent.color = 'dashed';
      fixture.detectChanges();
      expect(buttonDebugElement.nativeElement.classList.contains('tri-btn-dashed')).toBe(true);

      testComponent.color = 'danger';
      fixture.detectChanges();
      expect(buttonDebugElement.nativeElement.classList.contains('tri-btn-danger')).toBe(true);
    });

    it('should apply class based on shape attribute', () => {
      testComponent.shape = 'circle';
      fixture.detectChanges();
      expect(buttonDebugElement.nativeElement.classList.contains('tri-btn-circle')).toBe(true);

      testComponent.shape = null;
      fixture.detectChanges();
      expect(buttonDebugElement.nativeElement.classList.contains('tri-btn-circle')).toBe(false);
    });

    it('should apply class based on size attribute', () => {
      testComponent.size = 'small'; // | 'large' | 'default'
      fixture.detectChanges();
      expect(buttonDebugElement.nativeElement.classList.contains('tri-btn-sm')).toBe(true);

      testComponent.size = 'large';
      fixture.detectChanges();
      expect(buttonDebugElement.nativeElement.classList.contains('tri-btn-lg')).toBe(true);

      testComponent.size = 'default';
      fixture.detectChanges();
      expect(buttonDebugElement.nativeElement.classList.contains('tri-btn-lg')).toBe(false);
      expect(buttonDebugElement.nativeElement.classList.contains('tri-btn-sm')).toBe(false);

      testComponent.size = null;
      fixture.detectChanges();
      expect(buttonDebugElement.nativeElement.classList.contains('tri-btn-lg')).toBe(false);
      expect(buttonDebugElement.nativeElement.classList.contains('tri-btn-sm')).toBe(false);
    });

    it('should apply class based on ghost attribute', () => {
      testComponent.isGhost = true;
      fixture.detectChanges();
      expect(buttonDebugElement.nativeElement.classList.contains('tri-btn-background-ghost')).toBe(true);

      testComponent.isGhost = false;
      fixture.detectChanges();
      expect(buttonDebugElement.nativeElement.classList.contains('tri-btn-background-ghost')).toBe(false);
    });

    it('should should not clear previous defined classes', () => {
      buttonDebugElement.nativeElement.classList.add('custom-class');

      testComponent.color = 'primary';
      fixture.detectChanges();
      expect(buttonDebugElement.nativeElement.classList.contains('tri-btn-primary')).toBe(true);
      expect(buttonDebugElement.nativeElement.classList.contains('custom-class')).toBe(true);

      testComponent.color = 'dashed';
      fixture.detectChanges();
      expect(buttonDebugElement.nativeElement.classList.contains('tri-btn-dashed')).toBe(true);
      expect(buttonDebugElement.nativeElement.classList.contains('custom-class')).toBe(true);

      testComponent.color = 'danger';
      fixture.detectChanges();
      expect(buttonDebugElement.nativeElement.classList.contains('tri-btn-danger')).toBe(true);
      expect(buttonDebugElement.nativeElement.classList.contains('custom-class')).toBe(true);

      testComponent.shape = 'circle';
      fixture.detectChanges();
      expect(buttonDebugElement.nativeElement.classList.contains('tri-btn-circle')).toBe(true);
      expect(buttonDebugElement.nativeElement.classList.contains('custom-class')).toBe(true);

      testComponent.size = 'small';
      fixture.detectChanges();
      expect(buttonDebugElement.nativeElement.classList.contains('tri-btn-sm')).toBe(true);
      expect(buttonDebugElement.nativeElement.classList.contains('custom-class')).toBe(true);

      testComponent.size = 'large';
      fixture.detectChanges();
      expect(buttonDebugElement.nativeElement.classList.contains('tri-btn-lg')).toBe(true);
      expect(buttonDebugElement.nativeElement.classList.contains('custom-class')).toBe(true);

      testComponent.size = 'default';
      fixture.detectChanges();
      expect(buttonDebugElement.nativeElement.classList.contains('tri-btn-lg')).toBe(false);
      expect(buttonDebugElement.nativeElement.classList.contains('tri-btn-sm')).toBe(false);
      expect(buttonDebugElement.nativeElement.classList.contains('custom-class')).toBe(true);
    });

    it('should handle a click on the button', () => {
      buttonDebugElement.nativeElement.click();
      expect(testComponent.isLoading).toBe(true);
      setTimeout(_ => {
        expect(testComponent.isLoading).toBe(false);
      }, 5000);
    });
  });

  describe('TriButton with disabled', () => {
    beforeEach(
      async(() => {
        TestBed.configureTestingModule({
          imports     : [TriButtonModule],
          declarations: [TestAppDisabled],
          providers   : []
        }).compileComponents();
      })
    );

    beforeEach(() => {
      fixture = TestBed.createComponent(TestAppDisabled);
      testComponent = fixture.debugElement.componentInstance;
      buttonDebugElement = fixture.debugElement.query(By.css('button'));
    });

    it('should not increment if disabled', () => {
      buttonDebugElement.nativeElement.click();
      expect(testComponent.isLoading).toBe(false);
    });
  });

  describe('TriButton with group', () => {
    beforeEach(
      async(() => {
        TestBed.configureTestingModule({
          imports     : [TriButtonModule],
          declarations: [TestAppGroup],
          providers   : []
        }).compileComponents();
      })
    );

    beforeEach(() => {
      fixtureGroup = TestBed.createComponent(TestAppGroup);
      testComponentGroup = fixtureGroup.debugElement.componentInstance;
      groupDebugElement = fixtureGroup.debugElement.query(By.directive(ButtonGroupComponent));
    });

    it('should apply class based on size attribute', () => {
      groupInstance = groupDebugElement.injector.get<ButtonGroupComponent>(ButtonGroupComponent);
      testComponentGroup.size = 'large';
      fixtureGroup.detectChanges();
      expect(groupDebugElement.nativeElement.classList.contains('tri-btn-group-lg')).toBe(true);

      testComponentGroup.size = 'small';
      fixtureGroup.detectChanges();
      expect(groupDebugElement.nativeElement.classList.contains('tri-btn-group-sm')).toBe(true);

      testComponentGroup.size = 'custom-string';
      fixtureGroup.detectChanges();
      expect(groupDebugElement.nativeElement.classList.contains('tri-btn-group-lg')).toBe(false);
      expect(groupDebugElement.nativeElement.classList.contains('tri-btn-group-sm')).toBe(false);
    });
  });
});

/** Test component that contains an button. */
@Component({
  selector: 'test-app',
  template: `
    <button tri-button [color]="color" [size]="size" [shape]="shape" [ghost]="isGhost" [loading]="isLoading"
            (click)="clickButton($event)">
      <span>Primary</span>
    </button>
    <button tri-button [color]="'primary'" (click)="loadFn($event)" [loading]="isLoading">
      <i class="anticon anticon-poweroff"></i>
      <span>Click me!</span>
    </button>
    <tri-button-group>
      <button tri-button>Cancel</button>
      <button tri-button [color]="'primary'">OK</button>
    </tri-button-group>
    <div style="background: rgb(190, 200, 200);padding: 26px 16px 16px;">
      <button tri-button [color]="'primary'" [ghost]="isGhost">
        <span>Primary</span>
      </button>
    </div>
  `
})
class TestApp {
  color = 'primary';
  size = 'default';
  shape = 'circle';
  isLoading = false;
  isGhost = false;

  clickButton = value => {
    this.isLoading = true;
    setTimeout(_ => {
      this.isLoading = false;
    }, 5000);
  };
}

@Component({
  selector: 'test-app-disabled',
  template: `
    <button tri-button [color]="color" [loading]="isLoading" (click)="clickButton($event)" disabled>
      <span>Primary</span>
    </button>
  `
})
class TestAppDisabled {
  color = 'primary';
  isLoading = false;

  clickButton = value => {
    this.isLoading = true;
    setTimeout(_ => {
      this.isLoading = false;
    }, 5000);
  };
}

@Component({
  selector: 'test-app-group',
  template: `
    <tri-button-group [size]="size">
      <button tri-button>Large</button>
      <button tri-button>Small</button>
    </tri-button-group>
  `
})
class TestAppGroup {
  size = 'small';
}
