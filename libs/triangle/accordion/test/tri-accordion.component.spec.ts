import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AccordionItemComponent, AccordionsetComponent } from '@gradii/triangle/accordion';

describe('My First Test', () => {
  it('should get "Hello Taobao"', () => {
  });
});

describe('AccordionsetComponent', () => {
  let component: AccordionsetComponent;
  let fixture: ComponentFixture<AccordionsetComponent>;

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        declarations: [AccordionItemComponent, AccordionsetComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(AccordionsetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('测试input - accordion : string', () => {
    component.accordion = true;
    fixture.detectChanges();
    // expect(a).toEqual(b);
  });
});
