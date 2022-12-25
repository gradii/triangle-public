/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { CdkPortal } from '@angular/cdk/portal';
import { Directive } from '@angular/core';

/** Used to flag tab labels for use with the portal directive */
@Directive({
  selector: '[tri-tab-label], [triTabLabel]',
})
export class TriTabLabel extends CdkPortal {
}
