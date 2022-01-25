import ServerHandler from '@pawjs/pawjs/src/server/handler';
import { getSnapshot } from 'mobx-state-tree';
import { AsyncSeriesHook } from 'tapable';
import { initializeStore, Provider } from '@models/root-store';
import { deepClone } from '@utils/common';

export default class MSTServer {
  hooks: {
    mstInitialState: AsyncSeriesHook<[any, any, any]>,
  };

  rootStore: any;

  getApiFetcher: Function;

  constructor(getFetchFactory: any) {
    this.getApiFetcher = getFetchFactory;
    this.hooks = {
      mstInitialState: new AsyncSeriesHook(['state', 'req', 'res']),
    };
  }

  apply(serverHandler: ServerHandler) {
    serverHandler.hooks.beforeLoadData.tapPromise(
      'AddMSTProvider', async (_, __, req, res) => {
        const fetchFactory = this.getApiFetcher(req, res);
        this.rootStore = initializeStore(fetchFactory);

        if (!this.rootStore) return;
        let initialState: any;
        const state = {
          setInitialState: (iState: any) => {
            initialState = deepClone(iState);
          },
          getInitialState: () => {
            if (typeof initialState === 'undefined') return {};
            return deepClone(initialState);
          },
        };
        await new Promise(r => this.hooks.mstInitialState.callAsync(state, req, res, r));
        initialState = getSnapshot(this.rootStore);
        res.locals.mstStore = this.rootStore;
      },
    );

    serverHandler.hooks.beforeAppRender.tapPromise('AddMSTProvider', async (app, req, res) => {
      app.children = (
        <Provider value={res.locals.mstStore}>
            {app.children}
        </Provider>
      );
    });

    serverHandler.hooks.beforeHtmlRender.tapPromise('AddMSTPreloadState', async (app, req, res) => {
      if (res.locals.mstStore) {
        app.htmlProps.footer.push(
          <script
            key="mstPreloadedState"
            type="text/javascript"
            id="__mstPreloadedState__"
            dangerouslySetInnerHTML={{
              __html: `window.MST__PRELOADED__STATE = ${JSON.stringify(res.locals.mstStore)}`,
            }}
          />,
        );
      }
    });
  }
}
