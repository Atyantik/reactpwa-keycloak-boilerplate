import shortid from 'shortid';

const localForageRef: { current: null | LocalForage } = {
  current: null,
};
export const getLocalForage = async (): Promise<LocalForage> => {
  if (
    typeof window === 'undefined'
    || typeof document === 'undefined'
  ) {
    throw new Error('Require dom to load local storage mechanism');
  }
  if (!localForageRef.current) {
    const module = await import('localforage');
    try {
      const localForage = module.default ? module.default : module;
      localForageRef.current = localForage.createInstance({
        driver: localForage.INDEXEDDB,
      });
      await localForageRef.current.setItem('_write', 1);
      await localForageRef.current.getItem('_write');
      await localForageRef.current.removeItem('_write');
    } catch (ex) {
      try {
        const localForage = module.default ? module.default : module;
        localForageRef.current = localForage.createInstance({
          driver: localForage.WEBSQL,
        });
        await localForageRef.current.setItem('_write', 1);
        await localForageRef.current.getItem('_write');
        await localForageRef.current.removeItem('_write');
      } catch (ex2) {
        try {
          const localForage = module.default ? module.default : module;
          localForageRef.current = localForage.createInstance({
            driver: localForage.LOCALSTORAGE,
          });
          await localForageRef.current.setItem('_write', 1);
          await localForageRef.current.getItem('_write');
          await localForageRef.current.removeItem('_write');
        } catch (ex3) {
          // eslint-disable-next-line no-console
          console.log('No storage device found. Do not open in incognito mode.');
        }
      }
    }
  }
  // @ts-ignore
  return localForageRef.current;
};

export const getItem = async <T>(
  // eslint-disable-next-line
  key: string,
  callback?: (err: any, value: T) => void,
): Promise<T> => {
  const localForage = await getLocalForage();
  // @ts-ignore
  return localForage.getItem(key, callback);
};

export const setItem = async <T>(
  // eslint-disable-next-line
  key: string,
  value: T,
  callback?: (err: any, value: T) => void,
): Promise<T> => {
  const localForage = await getLocalForage();
  return localForage.setItem(key, value, callback);
};

export const removeItem = async (
  key: string,
  callback?: (err: any) => void,
): Promise<void> => {
  const localForage = await getLocalForage();
  return localForage.removeItem(key, callback);
};

/**
 * Get current Tab ID
 */
const tabIdRef: any = {
  current: null,
};
export const getTabId = async () => {
  if (tabIdRef.current) {
    return tabIdRef.current;
  }
  let tabId;
  if ('sessionStorage' in window) {
    tabId = sessionStorage.getItem('tab_id');
    if (tabId) {
      tabIdRef.current = tabId;
    } else {
      tabIdRef.current = shortid();
      sessionStorage.setItem('tab_id', tabIdRef.current);
    }
  }
  if (!tabIdRef.current) {
    tabIdRef.current = shortid();
  }
  return tabIdRef.current;
};
export const createTabId = async () => {
  const tabId = shortid();
  if ('sessionStorage' in window) {
    sessionStorage.setItem('tab_id', tabId);
  }
  tabIdRef.current = tabId;
  return tabIdRef.current;
};

export const getTabHistory = async () => {
  const tabId = await getTabId();
  const persistedHistory = await getItem(`tab_history_${tabId}`);
  if (Array.isArray(persistedHistory)) {
    return persistedHistory;
  }
  return [];
};

const searchWithoutRecommended = (search: string) => {
  let searchStr = search;
  if (typeof window !== 'undefined' && window.innerWidth >= 1280) {
    searchStr = search
      .replace('?', '');
  } else {
    searchStr = search
      .replace('&sort=recommended', '')
      .replace('sort=recommended', '')
      .replace('?&', '?')
      .replace('?', '');
    try {
      const searchParams = new URLSearchParams(search);
      if (searchParams.get('sort') === 'recommended') {
        searchParams.delete('sort');
      }
      // searchStr = searchParams.toString();

      // Storing encoded string value to solve '+' issue in toString method
      const searchParamsArr: any = [];
      searchParams.forEach((value, key) => searchParamsArr.push(`${key}=${encodeURIComponent(value)}`));
      searchStr = `${searchParamsArr.join('&')}`;
    } catch {
      searchStr = search
        .replace('&sort=recommended', '')
        .replace('sort=recommended', '')
        .replace('?&', '?')
        .replace('?', '');
    }
  }

  if (searchStr.length) {
    return `?${searchStr}`;
  }
  return '';
};

export const saveTabHistory = async (newTabHistory: Location[]) => {
  const tabId = await getTabId();
  if (newTabHistory.length > 30) {
    newTabHistory.splice(0, newTabHistory.length - 30);
  }
  const newPersistedHistory: any = [];
  newTabHistory.forEach((i) => {
    if (!newPersistedHistory.length) {
      const currentSearch = searchWithoutRecommended(i.search);
      const currentPathname = i.pathname.endsWith('/') ? i.pathname : `${i.pathname}/`;
      newPersistedHistory.push({ ...i, pathname: currentPathname, search: currentSearch });
    } else {
      const lastHistory = newPersistedHistory[newPersistedHistory.length - 1];

      /** we want to ignore sort for recommended */
      const lastSearch = searchWithoutRecommended(lastHistory.search);
      const currentSearch = searchWithoutRecommended(i.search);
      const lastPathname = lastHistory.pathname.endsWith('/') ? lastHistory.pathname : `${lastHistory.pathname}/`;
      const currentPathname = i.pathname.endsWith('/') ? i.pathname : `${i.pathname}/`;
      if (!(
        lastPathname === currentPathname
        && lastHistory.hash === i.hash
        && lastSearch === currentSearch
      )) {
        newPersistedHistory.push({ ...i, pathname: currentPathname, search: currentSearch });
      }
    }
  });
  await setItem(`tab_history_${tabId}`, newPersistedHistory);
  return newPersistedHistory;
};
