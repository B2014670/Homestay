import actionTypes from "../actions/actionTypes";

const initState = {
  IsLoggedIn: false,
  token: null,
  msg: "",
  phoneUser: null,
  nameUser: null,
};

const authReducer = (state = initState, action) => {
  switch (action.type) {
    case actionTypes.REGISTER_SUCCESS: {
      // console.log(action.data.User);
      return {
        ...state,
        IsLoggedIn: true,
        token: action.data.token,
        phoneUser: action.data.User.phone,
        nameUser: action.data.User.name,
        idUser: action.data.User.id,
      };
    }
    case actionTypes.LOGIN_SUCCESS: {
      // console.log(action.data.User);
      return {
        ...state,
        IsLoggedIn: true,
        token: action.data.token,
        phoneUser: action.data.User.phone,
        nameUser: action.data.User.name,
        idUser: action.data.User._id,
      };
    }

    case actionTypes.REGISTER_FAIL:
    case actionTypes.LOGIN_FAIL:
      return {
        ...state,
        IsLoggedIn: false,
        msg: action.data,
        token: null,
        phoneUser: null,
        idUser: null,
      };
    case actionTypes.LOGOUT:
      return {
        ...state,
        IsLoggedIn: false,
        token: null,
        msg: "",
        phoneUser: null,
        nameUser: null,
        idUser: null,
      };

    default:
      return state;
  }
};
export default authReducer;
