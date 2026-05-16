import { getData, removeItem, setData } from "./localStorage";

const storageKeys = (appName) => ({
    USER_ACCESS_TOKEN: `${appName}-user-access-token`,
    USER_REFRESH_TOKEN: `${appName}-user-refresh-token`,
    USER_KIND: `${appName}-user-kind`,
    USER_EMAIL: `${appName}-user-email`,
    LOGIN_SSO: `${appName}-login-sso`,
});

export const getCacheAccessToken = (appName) => getData(storageKeys(appName).USER_ACCESS_TOKEN);

export const getCacheRefreshToken = (appName) => getData(storageKeys(appName).USER_REFRESH_TOKEN);

export const setCacheAccessToken = (appName, accessToken) => setData(storageKeys(appName).USER_ACCESS_TOKEN, accessToken);

export const setCacheRefreshToken = (appName, refreshToken) => setData(storageKeys(appName).USER_REFRESH_TOKEN, refreshToken);

export const setCacheToken = (accessToken, refreshToken) => {
    setCacheAccessToken(accessToken);
    setCacheRefreshToken(refreshToken);
};

export const removeCacheAccessToken = (appName) => removeItem(storageKeys(appName).USER_ACCESS_TOKEN);

export const removeCacheRefreshToken = (appName) => removeItem(storageKeys(appName).USER_REFRESH_TOKEN);

export const removeUserKind = (appName) => removeItem(storageKeys(appName).USER_KIND);

export const removeCacheToken = () => {
    removeCacheAccessToken();
    removeCacheRefreshToken();
    removeUserKind();
};

export const setCacheUserEmail = (appName, email) => setData(storageKeys(appName).USER_EMAIL, email);

export const getCacheUserEmail = (appName) => getData(storageKeys(appName).USER_EMAIL);
