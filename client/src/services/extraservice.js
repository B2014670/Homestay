import axiosConfig from './axiosConfig'

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

export const apiGetExtraServiceById = (payload) => new Promise(async (resolve, reject) => {
    try {
        const response = await axiosConfig({
            method: 'get',
            url: `/user/extraservices/${payload._id}}`,
        })
        resolve(response)
    } catch (error) {
        reject(error)
    }
})


