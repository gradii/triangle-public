/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */


import { A11yModule } from '@angular/cdk/a11y';
import { ObserversModule } from '@angular/cdk/observers';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TriCommonModule } from '@gradii/triangle/core';
import { TriError } from './error';
import { FormFieldComponent } from './form-field.component';
import { TriHint } from './hint';
import { TriLabel } from './label';
import { TriPrefix } from './prefix';
import { TriSuffix } from './suffix';


/**
 * <!-- example(form-field:form-field-theming-example) -->
 * <!-- example(form-field:form-field-prefix-suffix-example) -->
 * <!-- example(form-field:form-field-overview-example) -->
 * <!-- example(form-field:form-field-label-example) -->
 * <!-- example(form-field:form-field-hint-example) -->
 * <!-- example(form-field:form-field-harness-example) -->
 * <!-- example(form-field:form-field-error-example) -->
 * <!-- example(form-field:form-field-group-example) -->
 * <!-- example(form-field:form-field-custom-control-example) -->
 * <!-- example(form-field:form-field-appearance-example) -->
 */
@NgModule({
  declarations: [
    TriError,
    FormFieldComponent,
    TriHint,
    TriLabel,
    TriPrefix,
    TriSuffix,

  ],
  imports     : [CommonModule, TriCommonModule, ObserversModule, A11yModule],
  exports     : [
    TriCommonModule,
    TriError,
    FormFieldComponent,
    TriHint,
    TriLabel,
    TriPrefix,
    TriSuffix,
  ],
})
export class TriFormFieldModule {
}
