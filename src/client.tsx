import ClientHandler from '@pawjs/pawjs/src/client/handler';
import FetchFactory from '@utils/fetch-factory';
import MSTClient from '@plugins/mst-plugin/client';
import { initializeKeycloak } from '@utils/auth';
import './resources/css/style.scss';
import { trackPageView } from '@utils/tracker';

export default class Client {
  clientHandler: null | ClientHandler = null;

  fetchFactory: FetchFactory;

  constructor({ addPlugin }: any) {
    this.fetchFactory = new FetchFactory();
    const mstClient = new MSTClient(this.fetchFactory);
    addPlugin(mstClient);
  }

  initAuth() {
    if (!this.clientHandler) return;
    this.clientHandler.hooks.appStart.tapPromise('initAuth', async () => {
      return initializeKeycloak(this.fetchFactory);
    });
  }

  trackLocationChange() {
    if (!this.clientHandler) return false;
    this.clientHandler.hooks.postMetaUpdate.tapPromise(
      'TrackPageView',
      async () => {
        window.scrollTo(0, 0);
        // Go with Google analytics
        // The below works
        trackPageView();
      },
    );
    this.clientHandler.hooks.renderComplete.tap(
      'TrackInitialPageView',
      () => {
        trackPageView();
      },
    );
    return true;
  }

  disableHTMLSmoothScroll() {
    const HTMLTag = document.querySelector('html');
    if (!HTMLTag?.classList.contains('no-smooth-scroll')) {
      HTMLTag?.classList.add('no-smooth-scroll');
    }
  }

  addMstStoreToLoadData() {
    if (!this.clientHandler) return false;
    this.clientHandler.hooks.beforeLoadData.tapPromise(
      'AddMstStoreToLoadData',
      async (setParams, getParams) => {
        setParams('mstStore', getParams('mstStore'));
      },
    );
    return true;
  }

  initializeMSTState() {
    if (!this.clientHandler) return false;
    this.clientHandler.hooks.mstInitialState
      // @ts-ignore
      .tapPromise(
        'AppInitialState',
        async ({ getInitialState, setInitialState }: any) => {
          setInitialState(getInitialState());
        },
      );
    return true;
  }

  async apply(clientHandler: ClientHandler) {
    this.clientHandler = clientHandler;
    this.initAuth();
    this.trackLocationChange();
    this.disableHTMLSmoothScroll();
    this.addMstStoreToLoadData();

    // Add query to Load Data
    this.initializeMSTState();
  }
}
