import { deepClone } from '@utils/common';
import jsonFetch, { abortableFetch } from '@utils/json-api';
import { getKeycloak, isLoggedIn, refreshToken } from './auth';

const ERROR_CODES = {
  AUTHORIZATION_INVALID: 401,
};

export default class FetchFactory {
  token: string = '';

  retry401: Record<string, any> = {};

  res: Response | null = null;

  req: Request | null = null;

  options: any = {};

  setTokenCallbacks: any[] = [];

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

  constructor(token = '', options = {}) {
    this.token = token;
    this.setOptions(options);
    this.handleFetchFailure = this.handleFetchFailure.bind(this);
    this.fetch = this.fetch.bind(this);
  }

  getRequestOptions(requestOptions: any) {
    let requestHeaders = { ...requestOptions.headers };
    const options = this.getOptions();
    if (options.headers) {
      requestHeaders = {
        ...options.headers,
        ...requestHeaders,
      };
    }
    if (this.token) {
      requestHeaders.Authorization = `Bearer ${this.token}`;
    } else if (requestHeaders.Authorization) {
      delete requestHeaders.Authorization;
    }
    const mergedOptions = { ...requestOptions };
    mergedOptions.headers = requestHeaders;
    return mergedOptions;
  }

  handleFetchFailure(
    previousFetchParams: {
      abortChain: any [],
      url: string,
      requestOptions: any,
      abortable: boolean,
    },
  ) {
    return async (response: Response) => {
      if (response.status === ERROR_CODES.AUTHORIZATION_INVALID) {
        try {
          const refreshed = await refreshToken();
          if (refreshed) {
            const keycloak = getKeycloak();
            this.setToken(keycloak.token);
          }
        } catch {}
        if (!isLoggedIn()) {
          /** Todo: Do something about the errors in this section. */
          /**
           * Handle gracefully.
           */
          throw new Error('User not logged in');
        }

        const queryParamsStr = (previousFetchParams.requestOptions
          && previousFetchParams.requestOptions.queryParams)
          ? JSON.stringify(previousFetchParams.requestOptions.queryParams)
          : '';
        const prevFetchKey = `${previousFetchParams.url}_${queryParamsStr}`;
        if (
          typeof this.retry401[prevFetchKey] !== 'undefined'
          && (
            this.retry401[prevFetchKey] === 1
            || this.retry401[prevFetchKey] === -1
          )
        ) {
          this.retry401[prevFetchKey] = -1;
          // eslint-disable-next-line
          throw response;
        }
        this.retry401[prevFetchKey] = 1;

        const requestOptions = this.getRequestOptions(previousFetchParams.requestOptions);

        // Re-execute the previous request
        let fetchPromise: any = this.fetch(
          {
            abortable: previousFetchParams.abortable,
            abortChain: previousFetchParams.abortChain,
          },
        )(previousFetchParams.url, requestOptions);
        if (Array.isArray(fetchPromise)) {
          [fetchPromise] = fetchPromise;
        }
        return fetchPromise
          .then((res: any) => {
            if (Array.isArray(res)) {
              const [rs] = res;
              return rs;
            }
            return res;
          })
          .catch((err: any) => {
            throw err;
          });
      }
      // eslint-disable-next-line
      throw response;
    };
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

  onSetToken(callback: typeof Function) {
    this.setTokenCallbacks.push(callback);
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

  /**
   * A fetch method that can take care of abortable fetch along with
   * abortChain
   * @param params : { abortable, abortChain }
   */
  fetch(params: any = this.getDefaultFetchParams()) {
    // set fetch params as merge of default params and passed params
    const fetchParams = { ...this.getDefaultFetchParams(), ...params };

    // return a function that can execute a cross-fetch request
    return async (u: string, options: any = {}, extraOptions = { handleError: true }) => {

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
      if (extraOptions.handleError) {
        errorHandler = this.handleFetchFailure({
          requestOptions,
          abortChain: fetchParams.abortChain,
          abortable: fetchParams.abortable,
          url: u,
        });
      }

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
