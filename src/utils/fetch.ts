import fetch from 'cross-fetch';

export const abortableFetch = (url: string, options = {}): [Promise<any>, any] => {
  let abort = () => {};
  let signalOptions = {};
  if (typeof AbortController !== 'undefined') {
    const controller = new AbortController();
    abort = () => controller.abort();
    signalOptions = {
      signal: controller.signal,
    };
  }
  const fetchPromise = fetch(
    url,
    Object.assign(
      signalOptions,
      options,
    ),
  );
  return [fetchPromise, abort];
};

export default fetch;
