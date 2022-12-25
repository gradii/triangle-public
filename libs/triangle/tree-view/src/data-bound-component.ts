/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { EventEmitter, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EditService } from './drag-and-drop/models';
import { FilterState } from './filter-state.interface';

@Injectable()
export abstract class DataBoundComponent {
  // abstract dataSource: any[];
  // abstract hasChildren: (item: object) => boolean;
  // abstract children: (item: object) => Observable<object[]>;
  abstract editService: EditService;
  // abstract isVisible: (item: object, index: string) => boolean;
  abstract filter: string;
  abstract filterChange: EventEmitter<string>;
  abstract textField: string | string[];
  abstract preloadChildNodes: () => void;
  abstract filterStateChange: EventEmitter<FilterState>;
}
