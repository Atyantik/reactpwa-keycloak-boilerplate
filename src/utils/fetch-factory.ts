import { deepClone } from '@utils/common';
import jsonFetch, { abortableFetch } from '@utils/json-api';


export default class FetchFactory {
  token: string = '';

  isGuestUser: Boolean = true;

  retry401 = {};

  res: Response | null = null;

  req: Request | null = null;

  options: any = {};

  setTokenCallbacks: any[] = [];

  constructor(token = '', options = {}) {
    this.token = token;
    this.setOptions(options);
    this.fetch = this.fetch.bind(this);
  }

  setToken(token: string) {
    if (token) {
      this.token = token.trim();
      this.setTokenCallbacks.forEach((cb) => {
        if (typeof cb === 'function') {
          cb(this.token);
        }
      });
    }
  }

  setIsGuestUser(isGuest: Boolean) {
    this.isGuestUser = isGuest;
  }

  onSetToken(callback: typeof Function) {
    this.setTokenCallbacks.push(callback);
  }

  getOptions() {
    return deepClone(this.options);
  }

  setOptions(options: any, forceOverride = false) {
    if (forceOverride) {
      this.options = options;
    }
    const optionHeaders = {
      ...(this.options.headers || {}),
      ...(options.headers || {}),
    };
    this.options = {
      ...this.options,
      ...options,
    };
    this.options.headers = optionHeaders;
    return this;
  }

  setResponse(response: Response) {
    this.res = response;
  }

  setRequest(request: Request) {
    this.req = request;
  }

  getDefaultFetchParams() {
    const defaultFetchParams: {
      abortable: boolean,
      abortChain: any [],
    } = {
      abortable: false,
      abortChain: [],
    };
    return defaultFetchParams;
  }

  getRequestOptions(requestOptions: any) {
    let requestHeaders = { ...(requestOptions?.headers ?? {}) };
    const options = this.getOptions();
    if (options.headers) {
      requestHeaders = {
        ...options.headers,
        ...requestHeaders,
      };
    }
    if (this.token) {
      requestHeaders.Authorization = `Bearer ${this.token}`;
    }
    const mergedOptions = { ...requestOptions };
    mergedOptions.headers = requestHeaders;
    return mergedOptions;
  }

  /**
   * A fetch method that can take care of abortable fetch along with
   * abortChain
   * @param params : { abortable, abortChain }
   */
  fetch(params: any = this.getDefaultFetchParams()) {
    // set fetch params as merge of default params and passed params
    const fetchParams = { ...this.getDefaultFetchParams(), ...params };

    // return a function that can execute a cross-fetch request
    return async (u: string, options: any = {}) => {

      // Get request options
      const requestOptions = this.getRequestOptions(options);

      if (
        true
        || process.env.PAW_ENV === 'development'
        || process.env.NODE_ENV === 'development'
      ) {
        // eslint-disable-next-line no-console
        console.log(u, requestOptions);
      }
      let errorHandler: any = async (er: any) => {
        throw er;
      };

      // If abortable return it with abort function
      if (fetchParams.abortable) {
        const [fetchPromise, abort] = abortableFetch(u, requestOptions);
        fetchParams.abortChain.push(abort);
        const abortAll = () => {
          fetchParams.abortChain.forEach((a: any) => a?.());
        };
        return [
          fetchPromise
            .catch(errorHandler),
          abortAll,
        ];
      }
      return jsonFetch(u, requestOptions)
        .catch(errorHandler);
    };
  }
}
