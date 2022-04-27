import { createReducer, on } from '@ngrx/store';
import { listLoaded } from './lists.actions';

export interface ListsState {
  lists: any;
}

export const initialListsState: ListsState = {
  lists: {},
};

export const listsReducer = createReducer<ListsState>(
  initialListsState,

  on(listLoaded, (state, action) => {
    const lists = Object.assign({}, state.lists);
    lists[action.name] = { data: action.data, total: action.total };
    return { lists: lists };
  })
);
