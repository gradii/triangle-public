/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Pipe, PipeTransform } from '@angular/core';
import { I18nService } from '@gradii/triangle/i18n';
import { isObject, isPresent } from '@gradii/triangle/util';

@Pipe({
  name: 'tri_form_validators_message',
  pure: false
})
export class FormValidatorsMessagePipe implements PipeTransform {
  constructor(private i18n: I18nService) {
  }

  transform(value, error?, ...args: any[]) {
    // if (Reflect.has(error, "message")) {
    //   return Reflect.get(error, "message");
    // }

    if (isObject(error)) {
      return this.i18n.translate(`Form.Validations.${value}`, error);
    } else if (isPresent(error)) {
      return this.i18n.translate(`Form.Validations.${value}`, {[value]: error});
    } else {
      return this.i18n.translate(`Form.Validations.${value}`);
    }
  }

}
