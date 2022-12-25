/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TriIconModule } from '@gradii/triangle/icon';
import { TrimDirective } from './directive/trim.directive';
import { FormControlComponent } from './form-control.component';
import { FormErrorMessageDirective } from './form-error-message.directive';
import { FormExplainComponent } from './form-explain.component';
import { FormExtraDirective } from './form-extra.directive';
import { FormItemRequiredDirective } from './form-item-required.directive';
import { FormItemComponent } from './form-item.component';
import { FormLabelDirective } from './form-label.directive';
import { FormNoFeedbackDirective } from './form-no-feedback.directive';
import { FormSplitDirective } from './form-split.directive';
import { FormTextDirective } from './form-text.directive';
import { FormValidatorsMessagePipe } from './form-validators-message.pipe';

import { FormComponent } from './form.component';
import { EmailValidatorDirective } from './validators/email-validator.directive';
import { PasswordValidatorDirective } from './validators/password-validator.directive';


/**
 *
 * # Form 表单
 * 注意 : 反馈图标只对  `<tri-input/>`  有效。
 * 另外为输入框添加反馈图标，添加  `<tri-form-control>`  的  `nzHasFeedback`  的属性即可。
 * 这样 `nzValidateStatus` 会自动根据表单校验函数返回的结果显示对应的 `error | validating(pending) | warning | success` 状态
 *
 * 当使用
 * <a href="[object Object]">响应式表单(Reactive Form)</a>
 * 时，将 `<tri-form-control>` 的 `nzValidateStatus`  属性定义为 `formControlName` 的输入
 *
 * 建议使用前对Angular 4的表单使用方式
 * <a href="[object Object]">有所了解</a>
 *
 * 具有数据收集、校验和提交功能的表单，包含复选框、单选框、输入框、下拉选择框等元素。
 * ### 表单
 * 我们为  `tri-form`  提供了以下三种排列方式：
 * - 水平排列：标签和表单控件水平排列；（默认）
 * - 垂直排列：标签和表单控件上下垂直排列；
 * - 行内排列：表单项水平行内排列。
 *
 * 表单域
 *
 *
 * 表单一定会包含表单域，表单域可以是输入控件，标准表单域，标签，下拉菜单，文本域等。
 * 这里我们封装了表单域  `<tri-form-item/>`  。
 *
 * 注：标准表单中一律使用大号控件。
 * ### 表单域
 * 表单一定会包含表单域，表单域可以是输入控件，标准表单域，标签，下拉菜单，文本域等。
 * 这里我们封装了表单域  `<tri-form-item/>`  。
 *
 * 注：标准表单中一律使用大号控件。
 * ### 代码演示
 *
 * 水平登录栏，常用在顶部导航栏中。
 * <!-- example(form:form-inline-example) -->
 * 普通的登录框，可以容纳更多的元素。
 * <!-- example(form:form-login-example) -->
 * 用户填写必须的信息以注册新用户。
 * <!-- example(form:form-horizontal-example) -->
 * 三列栅格式的表单排列方式，常用于数据表格的高级搜索。
 * <!-- example(form:form-advanced-example) -->
 * 动态增加、减少表单项。
 * <!-- example(form:form-dynamic-example) -->
 * 表单有三种布局
 * <!-- example(form:form-layout-example) -->
 * 我们为表单控件定义了三种校验状态，你可以不使用 `Reactive Form` 的异步返回数据，而直接定义表单的返回状态，定义 `<tri-form-control>` 的 `nzValidateStatus`  输入即可。
 *
 * <!-- example(form:form-validate-example) -->
 * 当使用
 * <a href="[object Object]">响应式表单(Reactive Form)</a>
 * 时，将 `<tri-form-control>` 的 `nzValidateStatus`  属性定义为当前 `formControlName` 名称，
 *
 * <!-- example(form:form-validate-dynamic-example) -->
 * 以上演示没有出现的表单控件对应的校验演示。
 * <!-- example(form:form-mix-example) -->
 *
 * <!-- example(form:form-multi-control-example) -->
 */
@NgModule({
  declarations: [
    FormExtraDirective,
    FormLabelDirective,
    FormComponent,
    FormItemComponent,
    FormControlComponent,
    FormExplainComponent,
    FormExplainComponent,
    FormTextDirective,
    FormSplitDirective,
    FormItemRequiredDirective,
    FormErrorMessageDirective,

    FormNoFeedbackDirective,

    EmailValidatorDirective,
    PasswordValidatorDirective,

    TrimDirective,

    // pipes
    FormValidatorsMessagePipe,

  ],
  exports     : [
    FormsModule,

    FormExtraDirective,
    FormLabelDirective,
    FormComponent,
    FormItemComponent,
    FormControlComponent,
    FormExplainComponent,
    FormExplainComponent,
    FormTextDirective,
    FormSplitDirective,
    FormItemRequiredDirective,
    FormErrorMessageDirective,
    FormNoFeedbackDirective,

    EmailValidatorDirective,
    PasswordValidatorDirective,

    TrimDirective
  ],
  imports: [CommonModule, TriIconModule],
  providers   : []
})
export class TriFormModule {
}
