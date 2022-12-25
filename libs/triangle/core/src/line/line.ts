/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Directive, ElementRef, NgModule, QueryList, } from '@angular/core';
import { startWith } from 'rxjs/operators';
import { TriCommonModule } from '../common-behaviors/common-module';


/**
 * Shared directive to count lines inside a text area, such as a list item.
 * Line elements can be extracted with a @ContentChildren(MatLine) query, then
 * counted by checking the query list's length.
 */
@Directive({
  selector: '[tri-line], [triLine]',
  host    : {'class': 'tri-line'}
})
export class TriLine {
}

/**
 * Helper that takes a query list of lines and sets the correct class on the host.
 * @docs-private
 */
export function setLines(lines: QueryList<TriLine>, element: ElementRef<HTMLElement>) {
  // Note: doesn't need to unsubscribe, because `changes`
  // gets completed by Angular when the view is destroyed.
  lines.changes.pipe(startWith(lines)).subscribe(({length}) => {
    setClass(element, 'tri-2-line', false);
    setClass(element, 'tri-3-line', false);
    setClass(element, 'tri-multi-line', false);

    if (length === 2 || length === 3) {
      setClass(element, `tri-${length}-line`, true);
    } else if (length > 3) {
      setClass(element, `tri-multi-line`, true);
    }
  });
}

/** Adds or removes a class from an element. */
function setClass(element: ElementRef<HTMLElement>, className: string, isAdd: boolean): void {
  const classList = element.nativeElement.classList;
  isAdd ? classList.add(className) : classList.remove(className);
}

/**
 * Helper that takes a query list of lines and sets the correct class on the host.
 * @docs-private
 * @deprecated Use `setLines` instead.
 * @breaking-change 8.0.0
 */
export class TriLineSetter {
  constructor(lines: QueryList<TriLine>, element: ElementRef<HTMLElement>) {
    setLines(lines, element);
  }
}

@NgModule({
  imports     : [TriCommonModule],
  exports     : [TriLine, TriCommonModule],
  declarations: [TriLine],
})
export class TriLineModule {
}
