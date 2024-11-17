
import actionTypes from './actionTypes';

import { apiAdminRegister, apiAdminLogin } from '../../api';
import swal from 'sweetalert';
export const register = (payload) => async (dispatch) => {
    try {
        const response = await apiAdminRegister(payload)
        // console.log(response)
        if (response?.data.err === 0) {
            dispatch({
                type: actionTypes.REGISTER_SUCCESS,
                data: {
                    token: response.data.data.token,
                    User: {
                        phone: response.data.data.phone,
                        name: response.data.data.name,
                    }
                }

            })
        } else {
            dispatch({
                type: actionTypes.REGISTER_FAIL,
                data: response.data.msg
            })
        }

    } catch (error) {
        dispatch({
            type: actionTypes.REGISTER_FAIL,
            data: null,
        })
    }
}

export const login = (payload, navigate) => async (dispatch) => {

    try {
        const response = await apiAdminLogin(payload)
        if (response?.data.err === 0) {
            dispatch({
                type: actionTypes.LOGIN_SUCCESS,
                data: {
                    phone: response.data.admin.phone,
                    isAdmin: response.data.admin.isAdmin,
                    username: response.data.admin.userName,
                }
            })
            swal("Thành Công ! ", response.data.msg, 'success')
            navigate('../')
        } else {
            dispatch({
                type: actionTypes.LOGIN_FAIL,
                data: response.data.msg
            })
            swal("Thông báo ! ", response.data.msg, 'warning')
        }

    } catch (error) {
        dispatch({
            type: actionTypes.LOGIN_FAIL,
            data: null,
        })
    }
}

export const logout = () => ({
    type: actionTypes.LOGOUT
})