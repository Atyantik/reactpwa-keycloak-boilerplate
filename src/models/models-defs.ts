import { types } from 'mobx-state-tree';

export const Todo = types.model({
  id: types.identifier,
  title: types.string,
  completed: types.boolean,
});
