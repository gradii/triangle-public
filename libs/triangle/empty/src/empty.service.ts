/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Inject, Injectable, Optional, TemplateRef, Type } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DEFAULT_EMPTY_CONTENT, EmptyCustomContent } from './empty-config';
import { getEmptyContentTypeError } from './empty-error';

@Injectable({
  providedIn: 'root'
})
// tslint:disable-next-line:no-any
export class EmptyService<T = any> {
  userDefaultContent$ = new BehaviorSubject<EmptyCustomContent | undefined>(undefined);

  constructor(@Inject(DEFAULT_EMPTY_CONTENT) @Optional() private defaultEmptyContent: Type<T>) {
    if (this.defaultEmptyContent) {
      this.userDefaultContent$.next(this.defaultEmptyContent);
    }
  }

  setDefaultContent(content?: EmptyCustomContent): void {
    if (
      typeof content === 'string' ||
      content === undefined ||
      content === null ||
      content instanceof TemplateRef ||
      content instanceof Type
    ) {
      this.userDefaultContent$.next(content);
    } else {
      throw getEmptyContentTypeError(content);
    }
  }

  resetDefault(): void {
    this.userDefaultContent$.next(undefined);
  }
}
