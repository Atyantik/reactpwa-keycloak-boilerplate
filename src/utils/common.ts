/**
 * Deep clone an array/object, beware it will remove all bindings
 * & functions
 * @param item Array|Object
 * @returns Array|Object
 */
export const deepClone = (obj: object) => JSON.parse(JSON.stringify(obj));

/**
 * Freeze the object and return it, so no one can modify it directly
 * @param o Object
 * @returns Object
 */
export const freeze = (o: any) => (typeof o.freeze !== 'undefined' ? o.freeze() : o);

export const precise = (number: number, precision: number = 2) => {
  const regExp = new RegExp(`^-?\\d+(?:.\\d{0,${precision || -1}})?`);
  const matchedString = number.toString().match(regExp);
  if (!matchedString || !matchedString.length) {
    return number;
  }
  return Number(matchedString[0]);
};

/**
 * @param callback
 * @param wait in milli-seconds
 * @param immediate
 */
export const debounce = (callback: any, wait: number, immediate = false) => {
  let timeout: any = null;
  return (...args: any) => {
    const maybeEvent = args.length ? args[0] : false;
    if (
      maybeEvent
      && maybeEvent.persist
    ) {
      maybeEvent.persist();
    }
    const callNow = immediate && !timeout;
    const next = () => {
      callback(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(next, wait);
    if (callNow) {
      next();
    }
  };
};

export const getQueryStringParams = (query: string) => (query
  ? (/^[?#]/.test(query) ? query.slice(1) : query)
    .split('&')
    .reduce(
      (params, param) => {
        let [key] = param.split('=');
        const [, value] = param.split('=');
        key = /[?]/.test(key) ? key.split('?')[1] : key;
        // @ts-ignore
        params[key] = value ? decodeURIComponent(value.replace(/\+/g, ' ')) : '';
        return params;
      },
      {},
    )
  : {});

export const getQueryParam = (
  location: typeof window.location,
  query: string,
  defaultValue: any = '',
) => {
  const search = location?.search ?? '';
  if (!search || !search.length) {
    return defaultValue;
  }
  if (typeof window !== 'undefined' && 'URLSearchParams' in window) {
    const urlParams = new URLSearchParams(search);
    return urlParams.get(query) || defaultValue;
  }
  const params: any = getQueryStringParams(search);
  return params?.[query] ?? defaultValue;
};

/**
 * Get extraclassnames from combination of className added to the
 * component
 * @param styles
 * @param className
 */
export const getExtraClasses = (styles: any, className?: string) => {
  if (!className) return '';
  const extraClasses = (className || '')
    .split(/\s/g)
    .filter(c => !!c)
    .map((c) => {
      if (typeof styles[c] !== 'undefined') {
        return styles[c];
      }
      return c;
    }).join(' ');
  return extraClasses;
};

/**
 * Returns an array with arrays of the given size.
 *
 * @param arr {Array} array to split
 * @param chunkSize {number} Size of every group
 */
export const chunkArray = (arr: any[], chunkSize = 10) => {
  const arrayLength = arr.length;
  const chunkedArray: any = [];

  for (let index = 0; index < arrayLength; index += chunkSize) {
    const chunk = arr.slice(index, index + chunkSize);
    // Do something if you want with the group
    chunkedArray.push(chunk);
  }
  return chunkedArray;
};

/**
 * Create form data that we pass along
 * http requests
 * @return URLSearchParams
 * @param data
 */
export const createFormData = (data: any): URLSearchParams => {
  const searchParams = new URLSearchParams();
  Object.keys(data).forEach(key => searchParams.append(key, data[key]));
  return searchParams;
};

/**
 * Create url from url segments by concatenation
 * & append data to url if provided any
 * @param urlParts
 * @param data
 */
export const createUrl = (urlParts: string | string[], data: any = {}): string => {
  let url;
  if (typeof urlParts === 'string') {
    url = urlParts;
  } else if (Array.isArray(urlParts)) {
    if (urlParts.length === 1) {
      [url] = urlParts;
    } else {
      url = urlParts.map((urlPart, index) => {
        if (index === 0 && urlPart.endsWith('/')) {
          return urlPart.substr(0, urlPart.length - 1);
        }
        if (index !== 0 && urlPart.startsWith('/')) {
          return urlPart.substr(1);
        }
        return urlPart;
      }).join('/');
    }
  }
  const URL_C = typeof window !== 'undefined' && 'URL' in window ? window.URL : URL;
  const urlObj = new URL_C(url || '');
  Object.keys(data).forEach(key => urlObj.searchParams.append(key, data[key]));
  return urlObj.toString();
};

// Verify
export const isIpad = () => {
  return !!(navigator.userAgent.includes('Mac') && 'ontouchend' in document);
};

export const isMobile = () => {
  // @ts-ignore
  const a = navigator.userAgent || navigator.vendor || window.opera;
  return !!(
    // eslint-disable-next-line no-useless-escape
    /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas-|your|zeto|zte-/i.test(a.substr(0, 4))
  );
};

export let recentImageLoadedTimeout: ReturnType<typeof setTimeout>;
export const handleImageLoaded = () => {
  if (recentImageLoadedTimeout) {
    clearTimeout(recentImageLoadedTimeout);
  }
};
