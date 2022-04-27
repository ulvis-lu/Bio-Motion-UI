import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { concatMap, map } from 'rxjs/operators';
import { loadList, listLoaded } from './lists.actions';
import { CommonDataService } from 'shared/services/common-data.service';

@Injectable()
export class ListsEffects {
  loadList$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadList),
      concatMap((action) =>
        this.commonData
          .block(action.list.name, action.list.params)
          .pipe(
            map((result) => Object.assign({ name: action.list.name }, result))
          )
      ),

      map((result) => {
        if (Array.isArray(result?.data) && result.data.length) {
          if (
            result.data[0].data &&
            typeof result.data[0].total !== 'undefined'
          ) {
            return listLoaded({
              name: result.name,
              data: result.data[0].data,
              total: result.data[0].total,
            });
          }
        }
        return listLoaded({ name: result.name, data: [], total: 0 });
      })
    )
  );
  constructor(
    private actions$: Actions,
    private commonData: CommonDataService
  ) {}
}
