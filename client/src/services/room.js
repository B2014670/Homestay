import axiosConfig from './axiosConfig'

export const apiSearchRoom = (payload) => new Promise(async (resolve, reject) => {
    try {

        const response = await axiosConfig({
            method: 'post',
            url: '/user/searchRoom',
            data: payload
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
            url: '/user/getAllRoom',
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



export const apiGetInfoRoom = (payload) => new Promise(async (resolve, reject) => {
    try {
        // console.log(payload)
        const response = await axiosConfig({
            method: 'post',
            url: '/user/infoRoom',
            data: payload,
        })
        resolve(response)
    } catch (error) {
        reject(error)
    }
})

export const apiGetRoomWithSector = (payload) => new Promise(async (resolve, reject) => {
    try {
        // console.log(payload)
        const response = await axiosConfig({
            method: 'post',
            url: '/user/getRoomWithSector',
            data: payload,
        })
        resolve(response)
    } catch (error) {
        reject(error)
    }
})

export const apiCancleRoom = (payload) => new Promise(async (resolve, reject) => {
    try {
        // console.log(payload)
        const response = await axiosConfig({
            method: 'post',
            url: '/user/cancleOrderRoom',
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

export const apiInfoSector = (payload) => new Promise(async (resolve, reject) => {
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


// create a user's wishlist
export const apiCreateWishlist = (payload) => new Promise(async (resolve, reject) => {
    try {
        const response = await axiosConfig({
            method: 'post',
            url: '/user/wishlist',
            data: payload
        });
        resolve(response);
    } catch (error) {
        reject(error);
    }
});

// Get a user's wishlist
export const apiGetUserWishlist = (userId) => new Promise(async (resolve, reject) => {
    try {
        const response = await axiosConfig({
            method: 'get',
            url: `/user/wishlist/${userId}`
        });
        resolve(response);
    } catch (error) {
        reject(error);
    }
});

// Get a user's wishlist detail Room
export const apiGetUserWishlistRooms = (userId) => new Promise(async (resolve, reject) => {
    try {
        const response = await axiosConfig({
            method: 'get',
            url: `/user/wishlist/${userId}/room`
        });
        resolve(response);
    } catch (error) {
        reject(error);
    }
});

// Update a wishlist item
export const apiUpdateWishlist = (id, payload) => new Promise(async (resolve, reject) => {
    try {
        const response = await axiosConfig({
            method: 'put',
            url: `/user/wishlist/${id}`,
            data: payload
        });
        resolve(response);
    } catch (error) {
        reject(error);
    }
});

// Delete a wishlist item
export const apiDeleteWishlist = (payload) => new Promise(async (resolve, reject) => {
    try {
        const response = await axiosConfig({
            method: 'delete',
            url: '/user/wishlist',
            data: payload,
        });
        resolve(response);
    } catch (error) {
        reject(error);
    }
});
