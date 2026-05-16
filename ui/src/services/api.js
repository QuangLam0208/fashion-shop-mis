import apiConfig from '@constants/apiConfig';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import {
    getCacheAccessToken,
    getCacheRefreshToken,
    removeCacheToken
} from './userService';

// Handle refresh token
const axiosInstance = axios.create();
let isRefreshing = false;
let subscribers = [];

const onRefreshed = (newAccessToken) => {
    subscribers.map((cb) => cb(newAccessToken));
};

const subscribeTokenRefresh = (cb) => {
    subscribers.push(cb);
};

axiosInstance.interceptors.response.use(
    (res) => res,
    async (err) => {
        const originalConfig = err.config;

        if (originalConfig?.url !== apiConfig.account.loginBasic.baseURL && err.response) {
            // Access Token was expired
            if (err.response?.status === 401 && !originalConfig._retry) {
                const handleExpireAll = () => {
                    removeCacheToken();
                    window.location.reload();
                };

                if (!getCacheRefreshToken()) {
                    handleExpireAll();
                }

                originalConfig._retry = true;

                return new Promise((resolve) => {
                    subscribeTokenRefresh((newAccessToken) => {
                        originalConfig.headers.Authorization = `Bearer ${newAccessToken}`;
                        return resolve(axiosInstance(originalConfig));
                    });
                });
            }
        }
        return Promise.reject(err);
    },
);

const sendRequest = (options, payload, cancelToken) => {
    const { params = {}, pathParams = {}, data = {}, error = {},mixinFuncs   } = payload;
    let { method, baseURL, headers, ignoreAuth, authorization } = options;
    const userAccessToken = getCacheAccessToken();
    if (userAccessToken) {
        const currentTimestamp = Math.floor(Date.now() / 1000);
        const decodeAccessToken = jwtDecode(userAccessToken);
        if (decodeAccessToken?.exp < currentTimestamp) {
            removeCacheToken();
        }
    }
    if (!ignoreAuth && userAccessToken) {
        headers.Authorization = `Bearer ${userAccessToken}`;
    }

    if (authorization) {
        headers.Authorization = authorization;
    }
    headers['X-Client-Type'] = 'WEB';
    if (params.token) {
        headers.Authorization = `Bearer ${params.token}`;
        delete params.token;
    }
    // update path params
    for (let key of Object.keys(pathParams)) {
        const keyCompare = `:${key}`;
        if (baseURL.indexOf(keyCompare) !== -1) {
            baseURL = baseURL.replace(keyCompare, pathParams[key]);
        }
    }

    // handle multipart
    if (options.headers['Content-Type'] === 'multipart/form-data') {
        let formData = new FormData();
        Object.keys(data).map((item) => {
            formData.append(item, data[item]);
        });

        return axios
            .post(options.path, formData, {
                headers: {
                    Authorization: headers.Authorization,
                    'Content-type': 'multipart/form-data',
                },
                ...mixinFuncs,
                // onUploadProgress : e => {
                //     console.log(e.progress);
                //     process(e);
                // },
            })
            .then((res) => {
                return { data: res.data };
            })
            .catch((err) => {
                console.log(err);
                return { error: err };
            });
    }
    // ...
    return axiosInstance.request({
        method,
        baseURL,
        headers,
        params,
        data,
        error,
        cancelToken,
    });
};

export { sendRequest };
