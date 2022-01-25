import ClientHandler from '@pawjs/pawjs/src/client/handler';
import { AsyncSeriesHook } from 'tapable';
import { applySnapshot } from 'mobx-state-tree';
import { initializeStore, Provider } from '@models/root-store';
import { deepClone } from '@utils/common';

declare global {
  interface Window {
    MST__PRELOADED__STATE: any;
    mstStore: any;
  }
}

export default class MSTClient {
  hooks: any;

  rootStore: any;

  apiFetcher: any;

  constructor(fetcher: any) {
    this.apiFetcher = fetcher;
    this.hooks = {
      mstInitialState: new AsyncSeriesHook(['state']),
    };
  }

  apply(clientHandler: ClientHandler) {
    clientHandler.hooks.beforeLoadData.tapPromise(
      'AddMSTProvider', async (setParams) => {
        this.rootStore = window.mstStore ?? undefined;
        if (!this.rootStore) {
          this.rootStore = initializeStore(this.apiFetcher);
          if (!this.rootStore) return;

          let initialState = window.MST__PRELOADED__STATE;
          delete window.MST__PRELOADED__STATE;
          const state = {
            setInitialState: (iState: any) => {
              initialState = deepClone(iState);
            },
            getInitialState: () => {
              if (typeof initialState === 'undefined') return {};
              return deepClone(initialState);
            },
          };

          await new Promise(r => this.hooks.mstInitialState.callAsync(state, r));
          applySnapshot(this.rootStore, deepClone(initialState));
        }
        window.mstStore = window.mstStore || this.rootStore;
        setParams('mstStore', window.mstStore || {});
      },
    );

    clientHandler.hooks.beforeRender.tapPromise('AddMSTProvider', async (app) => {
      app.children = (
        <Provider value={window.mstStore}>
          {app.children}
        </Provider>
      );
    });
  }
}
