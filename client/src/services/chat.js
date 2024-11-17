import axiosConfig from './axiosConfig';

// API to create a conversation
export const apiCreateConversation = (conversationData) => new Promise(async (resolve, reject) => {
    try {
        const response = await axiosConfig({
            method: 'post',
            url: '/user/conversation',
            data: conversationData,
        });
        resolve(response);
    } catch (error) {
        reject(error);
    }
});

// API to add a message to a conversation
export const apiAddMessage = (messageData) => new Promise(async (resolve, reject) => {
    try {
        const response = await axiosConfig({
            method: 'post',
            url: '/user/conversation/message',
            data: messageData,
        });
        resolve(response);
    } catch (error) {
        reject(error);
    }
});

// API to find a conversation by customer ID
export const apiGetConversationsForUser = (userId) => new Promise(async (resolve, reject) => {
    try {
        const response = await axiosConfig({
            method: 'get',
            url: `/user/${userId}/conversation`,
        });
        resolve(response);
    } catch (error) {
        reject(error);
    }
});

// API to get messages for a specific conversation
export const apiGetMessagesForConversation = (conversationId) => new Promise(async (resolve, reject) => {
    try {
        const response = await axiosConfig({
            method: 'get',
            url: `/user/conversation/${conversationId}/message`,
        });
        resolve(response);
    } catch (error) {
        reject(error);
    }
});

// API to end a conversation
export const apiEndConversation = (conversationId) => new Promise(async (resolve, reject) => {
    try {
        const response = await axiosConfig({
            method: 'delete',
            url: `/user/conversation/${conversationId}`,
        });
        resolve(response);
    } catch (error) {
        reject(error);
    }
});

// API to update the admin for a conversation
export const apiUpdateAdmin = (updateData) => new Promise(async (resolve, reject) => {
    try {
        const response = await axiosConfig({
            method: 'put',
            url: '/user/conversation/update-admin',
            data: updateData,
        });
        resolve(response);
    } catch (error) {
        reject(error);
    }
});

// API to get all conversations for a specific admin
export const apiGetConversationsForAdmin = (adminId) => new Promise(async (resolve, reject) => {
    try {
        const response = await axiosConfig({
            method: 'get',
            url: `/user/admins/${adminId}/conversations`,
        });
        resolve(response);
    } catch (error) {
        reject(error);
    }
});

export const apiGetAdmins = () => new Promise(async (resolve, reject) => {
    try {
        const response = await axiosConfig({
            method: 'get',
            url: `/admin/getAllAdmin`,
        });
        resolve(response);
    } catch (error) {
        reject(error);
    }
});