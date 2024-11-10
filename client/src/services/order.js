import axiosConfig from './axiosConfig'

export const apiHistoryOrder = (userId) => new Promise(async (resolve, reject) => {
    try {
        const response = await axiosConfig({
            method: 'get',
            url: `/user/${userId}/orders`,
        })
        resolve(response)
    } catch (error) {
        reject(error)
    }
})

export const apiPostOrderRoom = (payload) => new Promise(async (resolve, reject) => {
    try {
        console.log(payload)
        const response = await axiosConfig({
            method: 'post',
            url: '/user/orderRoom',
            params: payload
        })
        resolve(response)
    } catch (error) {
        reject(error)
    }
})

export const apiCancelRoom = (payload) => new Promise(async (resolve, reject) => {
    try {
        // console.log(payload)
        const response = await axiosConfig({
            method: 'post',
            url: '/user/cancelOrderRoom',
            data: payload,
        })
        resolve(response)
    } catch (error) {
        reject(error)
    }
})


export const apiUpdatePaypalOrder = (payload) => new Promise(async (resolve, reject) => {
    try {
        // console.log(payload)
        const response = await axiosConfig({
            method: 'post',
            url: '/user/updatePaypalOrder',
            data: payload,
        })
        resolve(response)
    } catch (error) {
        reject(error)
    }
})
