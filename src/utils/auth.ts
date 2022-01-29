import { getEnv } from '@utils/env';
import FetchFactory from './fetch-factory';

const keycloakRef: any = {
  instance: null,
  module: null,
};

const KEYCLOAK_BASE_URL = getEnv('KEYCLOAK_BASE_URL', process.env.KEYCLOAK_BASE_URL);
const KEYCLOAK_REALM = getEnv('KEYCLOAK_REALM', process.env.KEYCLOAK_REALM);
const KEYCLOAK_CLIENT_ID = getEnv('KEYCLOAK_REALM', process.env.KEYCLOAK_CLIENT_ID);

export const getKeycloak = () => {
  if (!keycloakRef.instance) {
    throw new Error('Keycloak not initialized.');
  }
  return keycloakRef.instance;
};

export const refreshToken = async (checkDistance = 5) => {
  try {
    const keycloak = getKeycloak();
    await keycloak.updateToken(checkDistance);
    return true;
  } catch {
    return false;
  }
};

export const initializeKeycloak = async (fetcher: FetchFactory) => {
  if (
    !KEYCLOAK_BASE_URL
    || !KEYCLOAK_REALM
    || !KEYCLOAK_CLIENT_ID
  ) {
    throw new Error('Keycloak parameters missing in Environment');
  }
  let Keycloak;
  if (!keycloakRef.module) {
    const keycloakModule = await import('keycloak-js');
    Keycloak = keycloakModule.default;
    keycloakRef.module = Keycloak;
  } else {
    Keycloak = keycloakRef.module;
  }
  if (keycloakRef.instance) {
    return keycloakRef.instance;
  }
  const keycloak = Keycloak({
    url: KEYCLOAK_BASE_URL,
    realm: KEYCLOAK_REALM,
    clientId: KEYCLOAK_CLIENT_ID,
  });
  await keycloak.init({
    onLoad: 'check-sso',
    silentCheckSsoRedirectUri: window.location.origin + '/sso',
  });
  // @ts-ignore
  window.k = keycloak;

  if (keycloak.authenticated && keycloak.tokenParsed?.exp) {
    fetcher.setToken(keycloak.token);
    const updateToken = () => {
      // Keep distance of 10 seconds
      const checkDistance = 10;
      const nextTimeToUpdate = (keycloak.tokenParsed.exp * 1000) - new Date().getTime() - (checkDistance * 1000);
      setTimeout(() => {
        refreshToken(checkDistance)
          .then((refreshed: boolean) => {
            if (refreshed) {
              fetcher.setToken(keycloak.token);
              updateToken();
            }
          })
          .catch(() => {
            return keycloak.login({
              redirectUri: window.location.href,
            });
          });
      }, nextTimeToUpdate);
    };
    updateToken();
  }
  keycloakRef.instance = keycloak;
  return keycloakRef.instance;
};

export const isLoggedIn = () => !!(
  keycloakRef.instance &&
  keycloakRef.instance?.authenticated
);

export const login = async () => {
  if (!keycloakRef.instance) {
    throw new Error('Cannot login. Keycloak not initialized.');
  }
  return keycloakRef.instance.login();
};


export const logout = async () => {
  if (!keycloakRef.instance) {
    throw new Error('Cannot logout. Keycloak not initialized.');
  }
  return keycloakRef.instance.logout({
    redirectUri: `${window.location.protocol}//${window.location.host}`,
  });
};
