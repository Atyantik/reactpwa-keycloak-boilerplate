import {
  getEnv,
  Instance,
  types,
} from 'mobx-state-tree';
import { createContext, useContext } from 'react';
import { TodoStore } from './todo-store';

export let rootStore: any = null;

export const RootStore = types
  .model({
    todoStore: TodoStore,
  })
  .views(self => ({
    get fetcher() {
      return getEnv(self).fetcher;
    },
  }))
  .actions(() => ({
    afterCreate() {},
  }));

export function initializeStore(fetcher: any) {
  rootStore = RootStore.create(
    {
      todoStore: {},
    },
    {
      fetcher,
    },
  );
  return rootStore;
}

export type RootInstance = Instance<typeof RootStore>;
const RootStoreContext = createContext<null | RootInstance>(null);
export const { Provider } = RootStoreContext;

export function useMst(): Instance<typeof RootStore> {
  const store = useContext(RootStoreContext);
  if (store === null) {
    throw new Error('Root store is null, please add a context provider!');
  }
  return store;
}
