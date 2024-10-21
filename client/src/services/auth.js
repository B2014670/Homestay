import axiosConfig from './axiosConfig'

export const apiRegister = (payload) => new Promise(async(resolve, reject)=>{
    try {
        
        const response = await axiosConfig({
            method: 'post',
            url: '/user/register',
            data: payload
        })
        resolve(response)
    } catch (error) {
        reject(error)
    }
})

export const apiLogin = (payload) => new Promise(async(resolve, reject)=>{
    try {
        
        const response = await axiosConfig({
            method: 'post',
            url: '/user/login',
            data: payload
        })
        resolve(response)
    } catch (error) {
        reject(error)
    }
})

export const checkEmailLinked = (payload) => new Promise(async(resolve, reject)=>{
    try {
        
        const response = await axiosConfig({
            method: 'post',
            url: '/user/checkEmailLinked',
            data: payload
        })
        resolve(response.data)
    } catch (error) {
        reject(error)
    }
})

export const apiOauthLogin = (payload) => new Promise(async(resolve, reject)=>{
    try {
        
        const response = await axiosConfig({
            method: 'post',
            url: '/user/oauthLogin',
            data: payload
        })
        resolve(response)
    } catch (error) {
        reject(error)
    }
})

export const validateToken = () => new Promise(async (resolve, reject) => {
    try {
        
        const response = await axiosConfig({
            method: 'post',
            url: '/user/validateToken',
            withCredentials: true
        });
        resolve(response);
    } catch (error) {
        reject(error);
    }
});

export const apiInfoUser = (payload) => new Promise(async(resolve, reject)=>{
    try {
        // console.log(payload)
        const response = await axiosConfig({
            method: 'post',
            url: '/user/info',
            data: payload
        })
        resolve(response)
    } catch (error) {
        reject(error)
    }
})


export const apiUpdateInfoUser = (payload) => new Promise(async(resolve, reject)=>{
    try {
        // console.log(payload)
        const response = await axiosConfig({
            method: 'post',
            url: '/user/updateInfoUser',
            data: payload
        })
        resolve(response)
    } catch (error) {
        reject(error)
    }
})

export const apiChangePassword= (payload) => new Promise(async(resolve, reject)=>{
    try {
        // console.log(payload)
        const response = await axiosConfig({
            method: 'post',
            url: '/user/changePassword',
            data: payload
        })
        resolve(response)
    } catch (error) {
        reject(error)
    }
})

export const apiForgotPassword= (payload) => new Promise(async(resolve, reject)=>{
    try {
        // console.log(payload)
        const response = await axiosConfig({
            method: 'post',
            url: `/user/forgot-password`,
            data: payload
        })
        resolve(response)
    } catch (error) {
        reject(error)
    }
})

export const apiResetPassword= (token, payload) => new Promise(async(resolve, reject)=>{
    try {
        // console.log(payload)
        const response = await axiosConfig({
            method: 'post',
            url: `/user/reset-password/${token}`,
            data: payload
        })
        resolve(response)
    } catch (error) {
        reject(error)
    }
})












