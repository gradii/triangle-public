/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Injectable } from '@angular/core';
import { ExpandStateService } from './expand-state.service';

@Injectable()
export class DetailsService extends ExpandStateService {
  constructor() {
    super(true);
  }
}
