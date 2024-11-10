import authReducer from "./authReducer";

import { combineReducers } from "redux";

import storage from "redux-persist/lib/storage";

import autoMergeLevel2 from "redux-persist/es/stateReconciler/autoMergeLevel2";
import persistReducer from "redux-persist/es/persistReducer";

const commonConfig = {
    storage,
    stateReconciler: autoMergeLevel2
}

const authConfig = {
    ...commonConfig,
    key : 'auth',
    whitelist : ['IsLoggedIn','isAdmin', 'password','phoneUser','nameUser']
}

const rootReducer = combineReducers({
    auth : persistReducer(authConfig, authReducer),
})

export default rootReducer

