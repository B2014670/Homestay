import React from 'react'
import axiosConfig from '../axiosConfig'

export const apiAdminRegister = (payload) => new Promise(async (resolve, reject) => {
    try {

        const response = await axiosConfig({
            method: 'post',
            url: '/admin/register',
            data: payload,
        })
        resolve(response)
    } catch (error) {
        reject(error)
    }
})
export const apiAdminLogin = (payload) => new Promise(async (resolve, reject) => {
    try {

        const response = await axiosConfig({
            method: 'post',
            url: '/admin/login',
            data: payload,
        })
        resolve(response)
    } catch (error) {
        reject(error)
    }
})

export const apiGetAllSector = () => new Promise(async (resolve, reject) => {
    try {

        const response = await axiosConfig({
            method: 'get',
            url: '/admin/getAllSector',
        })
        resolve(response)
    } catch (error) {
        reject(error)
    }
})
export const apiGetAllRoom = () => new Promise(async (resolve, reject) => {
    try {

        const response = await axiosConfig({
            method: 'get',
            url: '/admin/getAllRoom',
        })
        resolve(response)
    } catch (error) {
        reject(error)
    }
})



export const apiGetAllUser = () => new Promise(async (resolve, reject) => {
    try {

        const response = await axiosConfig({
            method: 'get',
            url: '/admin/getAllUser',
        })
        resolve(response)
    } catch (error) {
        reject(error)
    }
})


export const apiGetAllUserOrder = () => new Promise(async (resolve, reject) => {
    try {

        const response = await axiosConfig({
            method: 'get',
            url: '/admin/getAllUserOrder',
        })
        resolve(response)
    } catch (error) {
        reject(error)
    }
})


export const apiGetAllAdmin = () => new Promise(async (resolve, reject) => {
    try {

        const response = await axiosConfig({
            method: 'get',
            url: '/admin/getAllAdmin',
        })
        resolve(response)
    } catch (error) {
        reject(error)
    }
})

export const apiAddRoom = (payload) => new Promise(async (resolve, reject) => {
    try {
        console.log(payload)
        const response = await axiosConfig({
            method: 'post',
            url: '/admin/addRoom',
            data: payload,
        })
        resolve(response)
    } catch (error) {
        reject(error)
    }
})


export const apiDeleteRoom = (payload) => new Promise(async (resolve, reject) => {
    try {
        console.log(payload)
        const response = await axiosConfig({
            method: 'post',
            url: '/admin/deleteRoom',
            data: payload,
        })
        resolve(response)
    } catch (error) {
        reject(error)
    }
})


export const apiConfirmOrderRoom = (payload) => new Promise(async (resolve, reject) => {
    try {
        console.log(payload)
        const response = await axiosConfig({
            method: 'post',
            url: '/admin/confirmOrderRoom',
            data: payload,
        })
        resolve(response)
    } catch (error) {
        reject(error)
    }
})

export const apiCheckinOrderRoom = (payload) => new Promise(async (resolve, reject) => {
    try {
        console.log(payload)
        const response = await axiosConfig({
            method: 'post',
            url: '/admin/checkinOrderRoom',
            data: payload,
        })
        resolve(response)
    } catch (error) {
        reject(error)
    }
})

export const apiCompleteOrderRoom = (payload) => new Promise(async (resolve, reject) => {
    try {
        console.log(payload)
        const response = await axiosConfig({
            method: 'post',
            url: '/admin/completeOrderRoom',
            data: payload,
        })
        resolve(response)
    } catch (error) {
        reject(error)
    }
})
export const apiDeleteOrderRoom = (payload) => new Promise(async (resolve, reject) => {
    try {
        console.log(payload)
        const response = await axiosConfig({
            method: 'post',
            url: '/admin/deleteOrderRoom',
            data: payload,
        })
        resolve(response)
    } catch (error) {
        reject(error)
    }
})

export const apiCancelOrderRoom = (payload) => new Promise(async (resolve, reject) => {
    try {
        console.log(payload)
        const response = await axiosConfig({
            method: 'post',
            url: '/admin/cancelOrderRoom',
            data: payload,
        })
        resolve(response)
    } catch (error) {
        reject(error)
    }
})

export const apiGetInfoRoom = (payload) => new Promise(async (resolve, reject) => {
    try {

        const response = await axiosConfig({
            method: 'post',
            url: '/admin/infoRoom',
            data: payload,
        })
        resolve(response)
    } catch (error) {
        reject(error)
    }
})

export const apiAddSector = (payload) => new Promise(async (resolve, reject) => {
    try {
        console.log(payload)
        const response = await axiosConfig({
            method: 'post',
            url: '/admin/addSector',
            data: payload,
        })
        resolve(response)
    } catch (error) {
        reject(error)
    }
})

export const apiGetInfoSector = (payload) => new Promise(async (resolve, reject) => {
    try {

        const response = await axiosConfig({
            method: 'post',
            url: '/admin/infoSector',
            data: payload,
        })
        resolve(response)
    } catch (error) {
        reject(error)
    }
})
export const apiEditSector = (payload) => new Promise(async (resolve, reject) => {
    try {

        const response = await axiosConfig({
            method: 'post',
            url: '/admin/editSector',
            data: payload,
        })
        resolve(response)
    } catch (error) {
        reject(error)
    }
})
export const apiDeleteSector = (payload) => new Promise(async (resolve, reject) => {
    try {

        const response = await axiosConfig({
            method: 'post',
            url: '/admin/deleteSector',
            data: payload,
        })
        resolve(response)
    } catch (error) {
        reject(error)
    }
})


export const apiAddAdmin = (payload) => new Promise(async (resolve, reject) => {
    try {
        console.log(payload)
        const response = await axiosConfig({
            method: 'post',
            url: '/admin/addAdmin',
            data: payload,
        })
        resolve(response)
    } catch (error) {
        reject(error)
    }
})

export const apiDeleteAdmin = (payload) => new Promise(async (resolve, reject) => {
    try {
        // console.log(payload)
        const input = {
            "idAdmin": payload._id
        }
        const response = await axiosConfig({
            method: 'post',
            url: '/admin/deleteAdmin',
            data: input,
        })
        resolve(response)
    } catch (error) {
        reject(error)
    }
})
export const apiEditAdmin = (payload) => new Promise(async (resolve, reject) => {
    try {

        const response = await axiosConfig({
            method: 'post',
            url: '/admin/editAdmin',
            data: payload,
        })
        resolve(response)
    } catch (error) {
        reject(error)
    }
})

export const apiEditRoom = (payload) => new Promise(async (resolve, reject) => {
    try {
        const response = await axiosConfig({
            method: 'post',
            url: '/admin/editRoom',
            data: payload,
        })
        resolve(response)
    } catch (error) {
        reject(error)
    }
})

export const apiDeleteCustomer = (payload) => new Promise(async (resolve, reject) => {
    try {
        // console.log(payload)
        const input = {
            "idAdmin": payload._id
        }
        const response = await axiosConfig({
            method: 'post',
            url: '/admin/deleteCustomer',
            data: input,
        })
        resolve(response)
    } catch (error) {
        reject(error)
    }
})

export const apiGetAllExtraService = (payload) => new Promise(async (resolve, reject) => {
    try {
        const response = await axiosConfig({
            method: 'get',
            url: '/admin/extraservices',
            data: payload,
        })
        resolve(response)
    } catch (error) {
        reject(error)
    }
})

export const apiAddExtraService = (payload) => new Promise(async (resolve, reject) => {
    try {
        const response = await axiosConfig({
            method: 'post',
            url: '/admin/extraservices',
            data: payload,
        })
        resolve(response)
    } catch (error) {
        reject(error)
    }
})

export const apiEditExtraService = (payload) => new Promise(async (resolve, reject) => {
    try {
        const response = await axiosConfig({
            method: 'put',
            url: `/admin/extraservices/${payload.id}`,
            data: payload,
        })
        resolve(response)
    } catch (error) {
        reject(error)
    }
})

export const apiDeleteExtraService = (payload) => new Promise(async (resolve, reject) => {
    try {
        const response = await axiosConfig({
            method: 'delete',
            url: `/admin/extraservices/${payload.id}`,
        })
        resolve(response)
    } catch (error) {
        reject(error)
    }
})

export const apiGetAllComment = () => new Promise(async (resolve, reject) => {
    try {
        const response = await axiosConfig({
            method: 'get',
            url: '/admin/comments',
        })
        resolve(response)
    } catch (error) {
        reject(error)
    }
})

export const apiDeleteComment = (payload) => new Promise(async (resolve, reject) => {
    try {
        const response = await axiosConfig({
            method: 'delete',
            url: '/admin/comments',
            data: payload,
        })
        resolve(response)
    } catch (error) {
        reject(error)
    }
})

export const apiUnDeleteComment = (payload) => new Promise(async (resolve, reject) => {
    try {
        const response = await axiosConfig({
            method: 'post',
            url: '/admin/comments',
            data: payload,
        })
        resolve(response)
    } catch (error) {
        reject(error)
    }
})

export const apiGetExtraService = () => new Promise(async (resolve, reject) => {
    try {
        const response = await axiosConfig({
            method: 'get',
            url: `/user/extraservices`,
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

