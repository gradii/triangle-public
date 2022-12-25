/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { UntypedFormControl, ValidationErrors } from "@angular/forms";
import { FormItemComponent } from "./form-item.component";

enum ShowFlags {
  "dirty",
  "touched",
  "pristine",
}

@Component({
  selector: "tri-form-explain",
  template: ` <div
    *ngFor="let item of explains | keyvalue"
    [attr.error-name]="item.key"
  >
    {{ item.key | tri_form_validators_message: item.value }}
  </div>`,
  host: {
    "[class.tri-form-explain]": "true",
  },
})
export class FormExplainComponent implements OnDestroy, OnInit {
  @Input()
  source: UntypedFormControl;

  @Input()
  showable: boolean;

  private subscriptions;

  constructor(private _formItem: FormItemComponent) {}

  get explains(): ValidationErrors | null {
    if (this.source) {
      return this.source.errors;
    }
    return null;
  }

  ngOnInit() {
    this._formItem.enableHelp();
  }

  ngOnDestroy(): any {
    this._formItem.disableHelp();
  }
}
