import axiosConfig from './axiosConfig'

export const apiGetAllRoom = () => new Promise(async(resolve, reject)=>{
    try {
        
        const response = await axiosConfig({
            method: 'get',
            url: '/user/getAllRoom',
        })
        resolve(response)
    } catch (error) {
        reject(error)
    }
})
export const apiGetAllSector = () => new Promise(async(resolve, reject)=>{
    try {
        
        const response = await axiosConfig({
            method: 'get',
            url: '/user/getAllSector',
        })
        resolve(response)
    } catch (error) {
        reject(error)
    }
})

// export const apiGetAllTypeRoom = () => new Promise(async(resolve, reject)=>{
//     try {
        
//         const response = await axiosConfig({
//             method: 'get',
//             url: '/user/getAllSector',
//         })
//         resolve(response)
//     } catch (error) {
//         reject(error)
//     }
// })

export const apiPostOrderRoom = (payload) => new Promise(async(resolve, reject)=>{
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



export const apiGetInfoRoom = (payload) => new Promise(async(resolve, reject)=>{
    try {
        // console.log(payload)
        const response = await axiosConfig({
            method: 'post',
            url: '/user/infoRoom',
            data : payload,
        })
        resolve(response)
    } catch (error) {
        reject(error)
    }
})
export const apiCancleRoom = (payload) => new Promise(async(resolve, reject)=>{
    try {
        // console.log(payload)
        const response = await axiosConfig({
            method: 'post',
            url: '/user/cancleOrderRoom',
            data : payload,
        })
        resolve(response)
    } catch (error) {
        reject(error)
    }
})


export const apiUpdatePaypalOrder = (payload) => new Promise(async(resolve, reject)=>{
    try {
        // console.log(payload)
        const response = await axiosConfig({
            method: 'post',
            url: '/user/updatePaypalOrder',
            data : payload,
        })
        resolve(response)
    } catch (error) {
        reject(error)
    }
})

export const apiInfoSector = (payload) => new Promise(async(resolve, reject)=>{
    try {
        // console.log(payload)
        const response = await axiosConfig({
            method: 'post',
            url: '/user/infoSector',
            data: payload
        })
        resolve(response)
    } catch (error) {
        reject(error)
    }
})