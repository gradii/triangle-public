import { CommonModule } from '@angular/common';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EditService, SharedModule } from '@gradii/triangle/data-table';
import { TriDatePickerModule } from '@gradii/triangle/date-picker';
import { TriFormModule } from '@gradii/triangle/form';
import { TriInputModule } from '@gradii/triangle/input';
import { TriInputNumberModule } from '@gradii/triangle/input-number';
import { TriSwitchModule } from '@gradii/triangle/switch';
import { CellComponent } from '../src/table-body/cell.component';
import { TestContext } from './util/helpers';

@Component({
  template: `
    <div triGridCell>Hello World</div>`
})
class SimpleTest {
}

@Component({
  template: `
    <div triGridCell>
      StartEnd
      <ng-template>Template</ng-template>
    </div>`
})
class CellTemplateTestComponent {
}

@Component({
  template : `
    <!--<tri-grid-column>-->
    <div triGridCell
         [rowIndex]="-1"
         [isNew]="true"
         [column]="column"
         [dataItem]="newDataItem"
         [ngClass]="column.cssClass"
         [ngStyle]="column.style"
         [attr.colspan]="column.colspan">
    </div>
    <!--</tri-grid-column>-->
    <ng-template #cellEditId let-dataItem="dataItem">hello world {{newDataItem}}</ng-template>
  `,
  providers: [EditService]
})
class NewRowTestComponent implements OnInit {
  column = {
    field          : 'foo',
    editable       : true,
    editTemplate   : null,
    editTemplateRef: null,
    cssClass       : 'awesome_css',
    style          : {height: '20px'},
    colspan        : 1
  };
  newDataItem = 'test';
  @ViewChild('cellEditId', {read: TemplateRef, static: false})
  editTemplate;

  constructor(editService: EditService) {
    const group = new Map();
    editService.addRow(group);
    group.set('foo', true);
  }

  ngOnInit() {
    this.column.editTemplate = this.editTemplate;
    this.column.editTemplateRef = this.editTemplate;
  }
}

describe('DatagridCell Component', function () {
  let context: TestContext<CellComponent, any>;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports     : [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,

        SharedModule,
        TriInputModule,
        TriInputNumberModule,
        TriDatePickerModule,
        TriFormModule,
        TriSwitchModule
      ],
      declarations: [CellComponent, SimpleTest, CellTemplateTestComponent, NewRowTestComponent],
      providers   : [EditService]
    });
  });
  it('projects content', function () {
    context = new TestContext<CellComponent, SimpleTest>(CellComponent, SimpleTest);
    expect(context.clarityElement.textContent.trim()).toMatch('Hello World');
  });
  it('cell template context', function () {
    context = new TestContext<CellComponent, CellTemplateTestComponent>(CellComponent, CellTemplateTestComponent);
    expect(context.clarityElement.textContent.trim()).toMatch('StartEnd');
  });
  it('new row context', function () {
    context = new TestContext<CellComponent, CellTemplateTestComponent>(CellComponent, NewRowTestComponent);
    expect(context.clarityElement.classList).toContain('awesome_css');
    expect(context.clarityElement.textContent.trim()).toMatch('hello world test');
  });
  afterEach(() => {
    if (context) {
      context.fixture.destroy();
    }
  });
});
