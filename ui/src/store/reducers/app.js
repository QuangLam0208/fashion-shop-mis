import { createReducer } from '@store/utils';
import { appActions } from '@store/actions';

const {
    hideAppLoading,
    showAppLoading,
    toggleActionLoading,
    changeLanguage,
    settingSystem,
    setSelectedRowKey,
} = appActions;

const initialState = {
    appLoading: 0,
    locale: 'vi',
    settingSystem: [],
    selectedRowKey: null,
};

const appReducer = createReducer(
    {
        reducerName: 'app',
        initialState,
        storage: {
            whiteList: [ 'theme', 'locale' ],
        },
    },
    {
        [showAppLoading.type]: (state) => {
            state.appLoading++;
        },
        [hideAppLoading.type]: (state) => {
            state.appLoading = Math.max(0, state.appLoading - 1);
        },
        [toggleActionLoading.type]: (state, action) => {
            if (action.payload.isLoading) {
                state[action.payload.type] = true;
            } else {
                delete state[action.payload.type];
            }
        },
        [changeLanguage.type]: (state, { payload }) => {
            state.locale = payload;
        },
        [settingSystem.type]: (state, { payload }) => {
            state.settingSystem = payload;
        },
        [setSelectedRowKey.type]: (state, { payload }) => {
            state.selectedRowKey = payload;
        },
    },
);

export default appReducer;
