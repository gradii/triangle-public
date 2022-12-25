import {
  DOWN_ARROW,
  ENTER,
  ESCAPE,
  SPACE,
  TAB,
  UP_ARROW,
} from "@angular/cdk/keycodes";

import { OverlayContainer } from "@angular/cdk/overlay";
import { Component, DebugElement } from "@angular/core";
import {
  async,
  ComponentFixture,
  fakeAsync,
  flush,
  inject,
  TestBed,
  tick,
} from "@angular/core/testing";
import {
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  FormsModule,
  ReactiveFormsModule,
} from "@angular/forms";
import { By } from "@angular/platform-browser";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { dispatchKeyboardEvent } from "@gradii/triangle/core/testing";
import { SelectComponent } from "@gradii/triangle/select";
import { defaultFilterOption } from "../src/select/option.pipe";

describe("tri-select component", () => {
  let overlayContainer: OverlayContainer;
  let overlayContainerElement: HTMLElement;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        TriSelectModule,
        NoopAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
      ],
      declarations: [
        TestSelectDefaultComponent,
        TestSelectTagsComponent,
        TestSelectFormComponent,
        TestOptionChangeComponent,
        TestSelectFormDisabledTouchedComponent,
      ],
    });
    TestBed.compileComponents();
    inject([OverlayContainer], (oc: OverlayContainer) => {
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    })();
  }));
  afterEach(inject(
    [OverlayContainer],
    (currentOverlayContainer: OverlayContainer) => {
      currentOverlayContainer.ngOnDestroy();
      overlayContainer.ngOnDestroy();
    }
  ));
  describe("default", () => {
    let fixture: ComponentFixture<TestSelectDefaultComponent>;
    let testComponent: TestSelectDefaultComponent;
    let select: DebugElement;
    let selectComponent: SelectComponent;
    beforeEach(() => {
      fixture = TestBed.createComponent(TestSelectDefaultComponent);
      fixture.detectChanges();
      testComponent = fixture.debugElement.componentInstance;
      select = fixture.debugElement.query(By.directive(SelectComponent));
      selectComponent = select.injector.get(SelectComponent);
    });
    it("should className correct", () => {
      fixture.detectChanges();
      expect(select.nativeElement.classList).toContain("tri-select");
    });
    it("should size work", () => {
      testComponent.size = "small";
      fixture.detectChanges();
      expect(select.nativeElement.classList).toContain("tri-select-sm");
      testComponent.size = "large";
      fixture.detectChanges();
      expect(select.nativeElement.classList).toContain("tri-select-lg");
    });
    it("should allowClear work", () => {
      fixture.detectChanges();
      expect(select.nativeElement.classList).not.toContain(
        "tri-select-allow-clear"
      );
      testComponent.allowClear = true;
      fixture.detectChanges();
      expect(select.nativeElement.classList).toContain(
        "tri-select-allow-clear"
      );
    });
    it("should open work", () => {
      fixture.detectChanges();
      expect(select.nativeElement.classList).not.toContain("tri-select-open");
      testComponent.open = true;
      fixture.detectChanges();
      expect(select.nativeElement.classList).toContain("tri-select-open");
      expect(testComponent.openChange).toHaveBeenCalledTimes(0);
    });
    it("should click toggle open", () => {
      fixture.detectChanges();
      select.nativeElement.click();
      fixture.detectChanges();
      expect(testComponent.open).toBe(true);
      expect(testComponent.openChange).toHaveBeenCalledTimes(1);
      select.nativeElement.click();
      fixture.detectChanges();
      expect(testComponent.open).toBe(false);
      expect(testComponent.openChange).toHaveBeenCalledTimes(2);
    });
    it("should disabled work", fakeAsync(() => {
      fixture.detectChanges();
      expect(select.nativeElement.classList).toContain("tri-select-enabled");
      testComponent.disabled = true;
      fixture.detectChanges();
      expect(select.nativeElement.classList).not.toContain(
        "tri-select-enabled"
      );
      expect(select.nativeElement.classList).toContain("tri-select-disabled");
      expect(testComponent.openChange).toHaveBeenCalledTimes(0);
      select.nativeElement.click();
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      expect(testComponent.open).toBe(false);
      expect(testComponent.openChange).toHaveBeenCalledTimes(0);
    }));
    it("should autofocus work", () => {
      testComponent.showSearch = true;
      fixture.detectChanges();
      testComponent.autoFocus = true;
      fixture.detectChanges();
      expect(
        select.nativeElement
          .querySelector("input")
          .attributes.getNamedItem("autofocus").name
      ).toBe("autofocus");
      testComponent.autoFocus = false;
      fixture.detectChanges();
      expect(
        select.nativeElement
          .querySelector("input")
          .attributes.getNamedItem("autofocus")
      ).toBe(null);
    });
    it("should focus and blur function work", () => {
      testComponent.showSearch = true;
      select.nativeElement.click();
      fixture.detectChanges();
      expect(
        select.nativeElement.querySelector("input") === document.activeElement
      ).toBe(false);
      selectComponent._focus();
      fixture.detectChanges();
      expect(
        select.nativeElement.querySelector("input") === document.activeElement
      ).toBe(true);
      selectComponent._blur();
      fixture.detectChanges();
      expect(
        select.nativeElement.querySelector("input") === document.activeElement
      ).toBe(false);
    });
    it("should dropdown class work", () => {
      fixture.detectChanges();
      select.nativeElement.click();
      fixture.detectChanges();
      expect(testComponent.open).toBe(true);
      expect(
        overlayContainerElement.querySelector(".test-class")
      ).toBeDefined();
    });
    it("should dropdown style work", () => {
      fixture.detectChanges();
      select.nativeElement.click();
      fixture.detectChanges();
      expect(testComponent.open).toBe(true);
      const targetElement = overlayContainerElement.querySelector(
        ".test-class"
      ) as HTMLElement;
      expect(targetElement.style.height).toBe("120px");
    });
    it("should dropdownMatchSelectWidth true work", fakeAsync(() => {
      fixture.detectChanges();
      select.nativeElement.click();
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      expect(testComponent.open).toBe(true);
      const targetElement = overlayContainerElement.querySelector(
        ".cdk-overlay-pane"
      ) as HTMLElement;
      expect(targetElement.style.width).toBe("10px");
    }));
    it("should dropdownMatchSelectWidth false work", fakeAsync(() => {
      testComponent.dropdownMatchSelectWidth = false;
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      select.nativeElement.click();
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      expect(testComponent.open).toBe(true);
      const targetElement = overlayContainerElement.querySelector(
        ".cdk-overlay-pane"
      ) as HTMLElement;
      expect(targetElement.style.width).toBe("");
      expect(targetElement.style.minWidth).toBe("10px");
    }));
    it("should click option close dropdown", () => {
      testComponent.showSearch = true;
      select.nativeElement.click();
      fixture.detectChanges();
      expect(testComponent.open).toBe(true);
      fixture.detectChanges();
      overlayContainerElement.querySelector("li")!.click();
      fixture.detectChanges();
      expect(testComponent.open).toBe(false);
    });
    it("should keep overlay open when press esc", fakeAsync(() => {
      fixture.detectChanges();
      select.nativeElement.click();
      fixture.detectChanges();
      dispatchKeyboardEvent(document.body, "keydown", ESCAPE);
      fixture.detectChanges();
      flush();
      fixture.detectChanges();
      select.nativeElement.click();
      fixture.detectChanges();
      flush();
      fixture.detectChanges();
      expect(testComponent.open).toBe(true);
      expect(
        selectComponent.cdkConnectedOverlay.overlayRef.backdropElement
      ).toBeDefined();
    }));
    it("should keydown origin work", () => {
      const keyDownSpy = spyOn(selectComponent, "onKeyDown");
      dispatchKeyboardEvent(
        select.nativeElement.querySelector(".tri-select-selection"),
        "keydown",
        UP_ARROW
      );
      fixture.detectChanges();
      expect(keyDownSpy).toHaveBeenCalledTimes(1);
    });
    it("should blur after user hits enter key in single mode", () => {
      const spy = spyOn(selectComponent, "_blur");
      testComponent.showSearch = true;
      select.nativeElement.click();
      fixture.detectChanges();
      dispatchKeyboardEvent(
        select.nativeElement.querySelector(".tri-select-selection"),
        "keydown",
        DOWN_ARROW
      );
      fixture.detectChanges();
      expect(spy).not.toHaveBeenCalled();
      dispatchKeyboardEvent(
        select.nativeElement.querySelector(".tri-select-selection"),
        "keydown",
        ENTER
      );
      fixture.detectChanges();
      expect(spy).toHaveBeenCalled();
    });
    it("should support keydown events to open and close select panel", fakeAsync(() => {
      fixture.detectChanges();
      dispatchKeyboardEvent(
        select.nativeElement.querySelector(".tri-select-selection"),
        "keydown",
        SPACE
      );
      fixture.detectChanges();
      flush();
      fixture.detectChanges();
      expect(testComponent.open).toBe(true);
      // #2201, space should not close select panel
      dispatchKeyboardEvent(
        select.nativeElement.querySelector(".tri-select-selection"),
        "keydown",
        TAB
      );
      fixture.detectChanges();
      flush();
      fixture.detectChanges();
      expect(testComponent.open).toBe(false);
      dispatchKeyboardEvent(
        select.nativeElement.querySelector(".tri-select-selection"),
        "keydown",
        DOWN_ARROW
      );
      fixture.detectChanges();
      flush();
      fixture.detectChanges();
      expect(testComponent.open).toBe(true);
      dispatchKeyboardEvent(
        select.nativeElement.querySelector(".tri-select-selection"),
        "keydown",
        TAB
      );
      fixture.detectChanges();
      flush();
      fixture.detectChanges();
      expect(testComponent.open).toBe(false);
      testComponent.disabled = true;
      fixture.detectChanges();
      dispatchKeyboardEvent(
        select.nativeElement.querySelector(".tri-select-selection"),
        "keydown",
        TAB
      );
      fixture.detectChanges();
      flush();
      fixture.detectChanges();
      expect(testComponent.open).toBe(false);
    }));
  });
  describe("tags", () => {
    let fixture: ComponentFixture<TestSelectTagsComponent>;
    let testComponent: TestSelectTagsComponent;
    let select: DebugElement;
    let selectComponent: SelectComponent;

    beforeEach(() => {
      fixture = TestBed.createComponent(TestSelectTagsComponent);
      fixture.detectChanges();
      testComponent = fixture.debugElement.componentInstance;
      select = fixture.debugElement.query(By.directive(SelectComponent));
      selectComponent = select.injector.get(SelectComponent);
    });
    it("should click option correct", fakeAsync(() => {
      fixture.detectChanges();
      expect(select.nativeElement.classList).toContain("tri-select");
      select.nativeElement.click();
      fixture.detectChanges();
      overlayContainerElement.querySelector("li")!.click();
      fixture.detectChanges();
      flush();
      fixture.detectChanges();
      expect(testComponent.selectedValue.length).toBe(1);
      expect(testComponent.selectedValue[0]).toBe("jack");
    }));
    it("should remove from top control work", fakeAsync(() => {
      fixture.detectChanges();
      selectComponent.selectService.updateListOfSelectedValue(["jack"], true);
      fixture.detectChanges();
      flush();
      fixture.detectChanges();
      expect(testComponent.selectedValue.length).toBe(1);
      expect(testComponent.selectedValue[0]).toBe("jack");
    }));
    it("should clear work", fakeAsync(() => {
      fixture.detectChanges();
      selectComponent.selectService.updateListOfSelectedValue([], true);
      fixture.detectChanges();
      flush();
      fixture.detectChanges();
      expect(testComponent.selectedValue.length).toBe(0);
    }));
  });

  describe("form", () => {
    let fixture: ComponentFixture<TestSelectFormComponent>;
    let testComponent: TestSelectFormComponent;
    let select: DebugElement;

    beforeEach(() => {
      fixture = TestBed.createComponent(TestSelectFormComponent);
      fixture.detectChanges();
      testComponent = fixture.debugElement.componentInstance;
      select = fixture.debugElement.query(By.directive(SelectComponent));
    });
    it("should set disabled work", fakeAsync(() => {
      fixture.detectChanges();
      flush();
      fixture.detectChanges();
      expect(select.nativeElement.classList).not.toContain(
        "tri-select-disabled"
      );
      testComponent.disable();
      fixture.detectChanges();
      flush();
      fixture.detectChanges();
      expect(select.nativeElement.classList).toContain("tri-select-disabled");
    }));
    /** https://github.com/NG-ZORRO/ng-zorro-antd/issues/3014 **/
    it("should reset form works", fakeAsync(() => {
      fixture.detectChanges();
      flush();
      fixture.detectChanges();
      expect(testComponent.formGroup.value.select).toBe("jack");
      testComponent.reset();
      fixture.detectChanges();
      flush();
      fixture.detectChanges();
      expect(testComponent.formGroup.value.select).toBe(null);
      select.nativeElement.click();
      fixture.detectChanges();
      overlayContainerElement.querySelector("li")!.click();
      fixture.detectChanges();
      flush();
      fixture.detectChanges();
      expect(testComponent.formGroup.value.select).toBe("jack");
      testComponent.reset();
      fixture.detectChanges();
      flush();
      fixture.detectChanges();
      expect(testComponent.formGroup.value.select).toBe(null);
      select.nativeElement.click();
      fixture.detectChanges();
      overlayContainerElement.querySelector("li")!.click();
      fixture.detectChanges();
      flush();
      fixture.detectChanges();
      expect(testComponent.formGroup.value.select).toBe("jack");
    }));
  });

  describe("option change", () => {
    let fixture: ComponentFixture<TestOptionChangeComponent>;
    let testComponent: TestOptionChangeComponent;
    let select: DebugElement;
    let selectComponent: SelectComponent;

    beforeEach(() => {
      fixture = TestBed.createComponent(TestOptionChangeComponent);
      fixture.detectChanges();
      testComponent = fixture.debugElement.componentInstance;
      select = fixture.debugElement.query(By.directive(SelectComponent));
      selectComponent = select.injector.get(SelectComponent)!;
    });

    it("should option change work", () => {
      fixture.detectChanges();
      const changeSpy = spyOn(
        selectComponent.selectService,
        "updateTemplateOption"
      );
      fixture.detectChanges();
      expect(changeSpy).toHaveBeenCalledTimes(0);
      testComponent.displaySingle = true;
      fixture.detectChanges();
      expect(changeSpy).toHaveBeenCalledTimes(1);
      testComponent.displayGroup = true;
      fixture.detectChanges();
      expect(changeSpy).toHaveBeenCalledTimes(3);
      testComponent.displayGroupInner = true;
      fixture.detectChanges();
      expect(changeSpy).toHaveBeenCalledTimes(4);
    });
  });

  describe("form init state", () => {
    let fixture: ComponentFixture<TestSelectFormDisabledTouchedComponent>;
    let testComponent: TestSelectFormDisabledTouchedComponent;
    beforeEach(() => {
      fixture = TestBed.createComponent(TestSelectFormDisabledTouchedComponent);
      fixture.detectChanges();
      testComponent = fixture.debugElement.componentInstance;
    });
    /** https://github.com/NG-ZORRO/ng-zorro-antd/issues/3059 **/
    it("should init disabled state with touched false", fakeAsync(() => {
      fixture.detectChanges();
      flush();
      fixture.detectChanges();
      expect(testComponent.formGroup.controls.select.touched).toBe(false);
    }));
  });
});

@Component({
  template: `
    <tri-select
      style="width:10px;position: relative;display: block;"
      [size]="size"
      [(ngModel)]="selectedValue"
      [allowClear]="allowClear"
      (openChange)="openChange($event)"
      [disabled]="disabled"
      [mode]="mode"
      [autoClearSearchValue]="true"
      [serverSearch]="false"
      [showSearch]="showSearch"
      [autoFocus]="autoFocus"
      [(open)]="open"
      [maxMultipleCount]="10"
      [compareWith]="compareWith"
      [filterOption]="filterOption"
      [dropdownMatchSelectWidth]="dropdownMatchSelectWidth"
      [dropdownStyle]="dropdownStyle"
      [dropdownClassName]="'test-class'"
      (onSearch)="onSearch($event)"
      [placeHolder]="placeholder"
    >
      <tri-option value="jack" label="Jack"></tri-option>
      <tri-option value="lucy" label="Lucy"></tri-option>
      <tri-option value="disabled" label="Disabled" disabled></tri-option>
    </tri-select>
  `,
})
export class TestSelectDefaultComponent {
  selectedValue = "lucy";
  allowClear = false;
  open = false;
  size = "default";
  mode = "default";
  autoFocus = false;
  disabled = false;
  onSearch = jasmine.createSpy("on search");
  showSearch = false;
  placeholder = "placeholder";
  filterOption = defaultFilterOption;
  dropdownMatchSelectWidth = true;
  openChange = jasmine.createSpy("open change");
  dropdownStyle = { height: "120px" };

  compareWith = (o1: any, o2: any) => o1 === o2; // tslint:disable-line:no-any

  _filterOption = (input: string, option: OptionComponent) => {
    if (option && option.label) {
      return option.label.toLowerCase().indexOf(input.toLowerCase()) > -1;
    } else {
      return false;
    }
  };
}

@Component({
  template: `
    <tri-select [(ngModel)]="selectedValue" [allowClear]="true" [mode]="'tags'">
      <tri-option value="jack" label="Jack"></tri-option>
      <tri-option value="lucy" label="Lucy"></tri-option>
      <tri-option value="disabled" label="Disabled" disabled customContent
        >Disabled</tri-option
      >
    </tri-select>
  `,
})
export class TestSelectTagsComponent {
  selectedValue = ["lucy", "jack"];
  allowClear = false;
}

@Component({
  template: `
    <form [formGroup]="formGroup">
      <tri-select showSearch formControlName="select">
        <tri-option value="jack" label="Jack"></tri-option>
        <tri-option value="lucy" label="Lucy"></tri-option>
        <tri-option value="disabled" label="Disabled" disabled></tri-option>
      </tri-select>
    </form>
  `,
})
export class TestSelectFormComponent {
  formGroup: UntypedFormGroup;

  constructor(private formBuilder: UntypedFormBuilder) {
    this.formGroup = this.formBuilder.group({
      select: ["jack"],
    });
  }

  disable(): void {
    this.formGroup.disable();
  }

  reset(): void {
    this.formGroup.reset();
  }
}

@Component({
  template: `
    <form [formGroup]="formGroup">
      <tri-select formControlName="select">
        <tri-option value="jack" label="Jack"></tri-option>
        <tri-option value="lucy" label="Lucy"></tri-option>
      </tri-select>
    </form>
  `,
})
export class TestSelectFormDisabledTouchedComponent {
  formGroup: UntypedFormGroup;

  constructor() {
    this.formGroup = new UntypedFormGroup({
      select: new UntypedFormControl({ value: "lucy", disabled: true }),
    });
  }
}

@Component({
  template: `
    <tri-select>
      <tri-option value="lily" label="Lily" *ngIf="displaySingle"></tri-option>
      <tri-option-group label="Manager" *ngIf="displayGroup">
        <tri-option
          value="jack"
          label="Jack"
          *ngIf="displayGroupInner"
        ></tri-option>
        <tri-option value="lucy" label="Lucy"></tri-option>
      </tri-option-group>
      <tri-option-group label="Engineer">
        <tri-option value="Tom" label="tom"></tri-option>
      </tri-option-group>
    </tri-select>
  `,
})
export class TestOptionChangeComponent {
  displaySingle = false;
  displayGroup = false;
  displayGroupInner = false;
}
