/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Directive } from "@angular/core";
import {
  UntypedFormControl,
  NG_VALIDATORS,
  ValidationErrors,
  Validator,
} from "@angular/forms";

// Use our own regex because angular allows mathing with labels (xxx.xxx.xxx.com) without dot
// tslint:disable-next-line:max-line-length
const EMAIL_REGEXP =
  /^(?=.{1,254}$)(?=.{1,64}@)[a-zA-Z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+\/=?^_`{|}~-]+)*@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z](?:[a-zA-Z-]{0,61}[a-zA-Z])?)+$/;

@Directive({
  selector:
    "[triEmailValidator][ngModel]," +
    "[triEmailValidator][formControl]" +
    "[triEmailValidator][formControlName]",
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: EmailValidatorDirective,
      multi: true,
    },
  ],
})
export class EmailValidatorDirective implements Validator {
  validate(control: UntypedFormControl): ValidationErrors {
    if (EMAIL_REGEXP.test(control.value)) {
      return null;
    } else {
      return {
        email: {
          valid: false,
        },
      };
    }
  }
}
