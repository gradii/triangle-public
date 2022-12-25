/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { BehaviorSubject, Observable, Observer } from 'rxjs';
import { RowHeightService } from '../service/row-height.service';

export class ScrollAction {
  constructor(public offset: number) {
  }
}

export class PageAction {
  constructor(public skip: number, public take: number) {
  }
}

export type Action = ScrollAction | PageAction;

export class ScrollerService {
  private scrollObservable;
  private firstLoaded;
  private lastLoaded;
  private lastScrollTop;
  private take;
  private total;
  private rowHeightService;
  private scrollSubscription;
  private subscription;

  constructor(scrollObservable) {
    this.scrollObservable = scrollObservable;
    this.firstLoaded = 0;
  }

  create(rowHeightService: RowHeightService, skip: number, take: number, total: number): Observable<Action> {
    const _this = this;
    this.rowHeightService = rowHeightService;
    this.firstLoaded = skip;
    this.lastLoaded = skip + take;
    this.take = take;
    this.total = total;
    this.lastScrollTop = 0;
    const subject = new BehaviorSubject(new ScrollAction(this.rowHeightService.offset(skip)));
    this.subscription = Observable.create(observer => {
      _this.unsubscribe();
      _this.scrollSubscription = _this.scrollObservable.subscribe(x => _this.onScroll(x, observer));
    }).subscribe(x => subject.next(x));
    return subject;
  }

  destroy(): void {
    this.unsubscribe();
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  unsubscribe() {
    if (this.scrollSubscription) {
      this.scrollSubscription.unsubscribe();
      this.scrollSubscription = undefined;
    }
  }

  protected onScroll({
                       scrollTop,
                       offsetHeight
                     }: {
                       scrollTop: number;
                       offsetHeight: number;
                     },
                     observer: Observer<Action>): void {
    if (this.lastScrollTop === scrollTop) {
      return;
    }
    const up = this.lastScrollTop >= scrollTop;
    this.lastScrollTop = scrollTop;
    const firstItemIndex = this.rowHeightService.index(scrollTop);
    const firstItemOffset = this.rowHeightService.offset(firstItemIndex);
    const lastItemIndex = this.rowHeightService.index(scrollTop + offsetHeight);
    if (!up && lastItemIndex >= this.lastLoaded && this.lastLoaded < this.total) {
      this.firstLoaded = firstItemIndex;
      observer.next(new ScrollAction(firstItemOffset));
      let nextTake = this.firstLoaded + this.take;
      this.lastLoaded = Math.min(nextTake, this.total);
      nextTake = nextTake > this.total ? this.total - this.firstLoaded : this.take;
      observer.next(new PageAction(this.firstLoaded, nextTake));
    }
    if (up && firstItemIndex < this.firstLoaded) {
      const nonVisibleBuffer = Math.floor(this.take * 0.3);
      this.firstLoaded = Math.max(firstItemIndex - nonVisibleBuffer, 0);
      observer.next(new ScrollAction(this.rowHeightService.offset(this.firstLoaded)));
      this.lastLoaded = Math.min(this.firstLoaded + this.take, this.total);
      observer.next(new PageAction(this.firstLoaded, this.take));
    }
  }
}
