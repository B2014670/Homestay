import actionTypes from "../actions/actionTypes";

const initState = {
    IsLoggedIn: false,
    msg: "",
    phoneUser: null,
    nameUser: null,
};

const authReducer = (state = initState, action) => {
    // console.log(action.type)
    switch (action.type) {
       
        case actionTypes.LOGIN_SUCCESS:{
            // console.log(action.data);
            return {
                ...state,
                IsLoggedIn: true,
                phoneUser: action.data.phone,
                nameUser : action.data.username,
                isAdmin: action.data.isAdmin,
                password : action.data.password,
            };}

        case actionTypes.REGISTER_FAIL:
        case actionTypes.LOGIN_FAIL:
            return {
                ...state,
                IsLoggedIn: false,
                msg: action.data,
                phoneUser: null
            };
        case actionTypes.LOGOUT:
            return {
                ...state,
                IsLoggedIn: false,
                msg: "",
                phoneUser: null,
                nameUser: null
            };

        default:
            return state;
    }
};
export default authReducer;
