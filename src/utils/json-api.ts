import fetch, { abortableFetch as aFetch } from '@utils/fetch';
import { getEnv } from '@utils/env';

const apiUrl = getEnv('API_URL', process.env.API_URL || '');

const defaultHeaders = Object.freeze({
  Accept: 'application/json',
});

const defaultOptions = Object.freeze({
  method: 'GET',
  mode: 'cors',
  cache: 'no-cache',
  credentials: 'include',
  headers: defaultHeaders,
});

class FetchError extends Error {
  status: number | string;

  statusCode: number | string;

  error: any;

  response: any;

  jsonResponse: any;

  constructor(message: string, statusCode: number | string, response: any, jsonResponse = {}) {
    super(message);
    if (Error.captureStackTrace && typeof Error.captureStackTrace === 'function') {
      Error.stackTraceLimit = Infinity;
      Error.captureStackTrace(this, FetchError);
    }
    this.statusCode = statusCode;
    this.status = statusCode;
    this.response = response;
    this.jsonResponse = jsonResponse;
  }
}


const status = async (response: Response) => {
  if (response.status >= 200 && response.status < 300) {
    return Promise.resolve(response);
  }
  let error = `[HTTP STATUS: ${response.status}] Error while fetching: ${response.url}.`;
  const hasContentType = response.headers.has('Content-Type');
  if (hasContentType) {
    const contentType = response.headers.get('Content-Type');
    if (contentType && contentType.toLowerCase().indexOf('json') !== -1) {
      const jsonResponse = await response.json();
      if (jsonResponse.error_description) {
        error += ` ${jsonResponse.error_description}`;
      }
      throw new FetchError(
        (
          jsonResponse.error_description
          || error
        ),
        response.status,
        response,
        jsonResponse,
      );
    }
  }
  throw new FetchError(
    error,
    response.status,
    response,
  );
};
function json(response: any) {
  const hasContentType = response.headers.has('Content-Type');
  if (hasContentType) {
    const contentType = response.headers.get('Content-Type');
    if (contentType.toLowerCase().indexOf('json') !== -1) {
      return response.json();
    }
  }
  return response;
}


/**
 * @param params
 */
const queryParams = (params: { [key: string]: any }) => Object.keys(params)
  .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
  .join('&');

/**
 * Create API url
 * @param u
 */
const createUrl = (u: string, options: any = {}) => {
  let url = u;
  if (options.queryParams) {
    url += (url.indexOf('?') === -1 ? '?' : '&') + queryParams(options.queryParams);
  }
  if (url.indexOf('http') === -1) {
    url = url.startsWith('/') ? url.substr(1, url.length) : url;
    const apiEndpoint = apiUrl.endsWith('/') ? apiUrl.substr(0, apiUrl.length - 1) : apiUrl;
    url = `${apiEndpoint}/${url}`;
  }
  return url;
};

/**
 * Create request options for the fetch
 * @param options
 */
const createRequestOptions = (options: any = {}) => {
  let requestHeaders: any = { ...defaultHeaders };
  const method = (options.method || 'GET').toUpperCase();
  if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
    requestHeaders = {
      ...requestHeaders,
      'Content-Type': 'application/json',
    };
  }
  requestHeaders = { ...requestHeaders, ...options.headers };
  if (options.isMultipart) {
    requestHeaders['Content-Type'] = undefined;
    delete requestHeaders['Content-Type'];
  }

  const requestOptions = { ...defaultOptions, ...options };
  requestOptions.method = requestOptions.method
    ? requestOptions.method.toUpperCase()
    : requestOptions.method;
  if (!options.isMultipart && typeof requestOptions.body === 'object') {
    requestOptions.body = JSON.stringify(requestOptions.body);
  }
  requestOptions.headers = requestHeaders;
  return requestOptions;
};

export const abortableFetch = (u: string, options: any = {}): [Promise<any>, any] => {
  const [fPromise, abort] = aFetch(
    createUrl(u, options),
    createRequestOptions(options),
  );
  const fetchPromise = fPromise.then(status).then(json);
  return [fetchPromise, abort];
};

const jsonFetch = (u: string, options: any = {}) => fetch(
  createUrl(u, options),
  createRequestOptions(options),
).then(status).then(json);

export default jsonFetch;
