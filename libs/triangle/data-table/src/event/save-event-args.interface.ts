/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { UntypedFormGroup } from "@angular/forms";
import { EditEvent } from "./edit-event-args.interface";

export interface SaveEvent extends EditEvent {
  formGroup: UntypedFormGroup;
}
