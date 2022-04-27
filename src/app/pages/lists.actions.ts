import { createAction, props } from '@ngrx/store';

export const loadList = createAction(
  '[Load list] Load list data',
  props<{ list: { name: string; params: any } }>()
);

export const listLoaded = createAction(
  '[Load list] List loaded',
  props<{ name: string; data: any[]; total: number }>()
);
