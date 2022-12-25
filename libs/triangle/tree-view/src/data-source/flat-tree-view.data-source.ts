/**
 *
 */

import { EMPTY, Observable, switchMap } from 'rxjs';

export class FlatTreeViewDataSource {
  data: Observable<any[]>;

  _connected: Map<any, any> = new Map<any, any>();

  connect(dataView: Observable<any[]>) {
    const viewData$ = this.data.pipe(
      switchMap((data: any[]) => {
        return dataView.pipe((data: any[]) => {
          switchMap(() => EMPTY);
        });
      })
    );

    this._connected.set(dataView, viewData$);
    return viewData$;
  }

  disconnect(dataView: Observable<any[]>) {
    const viewData$ = this._connected.get(dataView);
    if (viewData$) {
      viewData$.unsubscribe();
      this._connected.delete(dataView);
    }
  }
}