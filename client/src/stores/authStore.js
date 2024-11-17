import { create } from 'zustand';
import swal from "sweetalert";
import Cookies from 'js-cookie';
import { apiRegister, apiLogin, validateToken, apiOauthLogin } from '../services/auth';

const storedUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
const tokenCookie = Cookies.get('accessToken');

const useAuthStore = create((set) => ({
    isLoggedIn: !!storedUser && !!tokenCookie,
    user: storedUser || null,

    initializeAuth: async () => {

        if (tokenCookie) {
            try {
                const response = await validateToken();

                if (response.status === 200) {
                    set({
                        isLoggedIn: true,
                        user: response.data.data.user,
                    });
                    localStorage.setItem('user', JSON.stringify(response.data.data.user));
                } else {
                    swal('Thông Báo !', response.data.msg, 'warning');
                }
            } catch (error) {
                handleAuthError(error);
            }
        }
    },

    login: async (userData) => {
        try {
            const response = await apiLogin(userData);

            if (response.status === 200) {
                swal('Thành Công', response.data.msg, 'success');
                set({
                    isLoggedIn: true,
                    user: response.data.data.user,
                });
                Cookies.set('accessToken', response.data.data.accessToken, { expires: (1 / 24 / 60) * 15 });
                Cookies.set('refreshToken', response.data.data.refreshToken, { expires: 2 });
                localStorage.setItem('user', JSON.stringify(response.data.data.user));
            } else {
                swal('Thông Báo !', response.data.msg, 'warning');
            }
        } catch (error) {
            if (error.response) {
                if (error.response.status === 400) {
                    swal('Thông Báo', error.response.data.msg || 'Yêu cầu không hợp lệ, vui lòng kiểm tra lại thông tin.', 'warning');
                } else if (error.response.status === 500) {
                    swal('Lỗi Server', 'Có lỗi xảy ra trên server. Vui lòng thử lại sau.', 'error');
                } else {
                    swal('Lỗi', `Có lỗi xảy ra (Status: ${error.response.status}). Vui lòng thử lại.`, 'error');
                }
            } else {
                // Handle errors without a response (e.g., network errors)
                console.error('Login error:', error);
                swal("Error!", "Network errors occurred during login.", "error");
            }
        }
    },

    oauthLogin: async (userData) => {
        try {
            const response = await apiOauthLogin(userData);

            if (response.status === 200) {
                swal('Thành Công', response.data.msg, 'success');
                set({
                    isLoggedIn: true,
                    user: response.data.data.user,
                });
                Cookies.set('accessToken', response.data.data.accessToken, { expires: (1 / 24 / 60) * 15 });
                Cookies.set('refreshToken', response.data.data.refreshToken, { expires: 2 }); //2 days
                localStorage.setItem('user', JSON.stringify(response.data.data.user));
            } else {
                swal('Thông Báo !', response.data.msg, 'warning');
            }
        } catch (error) {
            if (error.response) {
                if (error.response.status === 400) {
                    swal('Thông Báo', error.response.data.msg || 'Yêu cầu không hợp lệ, vui lòng kiểm tra lại thông tin.', 'warning');
                } else if (error.response.status === 500) {
                    swal('Lỗi Server', 'Có lỗi xảy ra trên server. Vui lòng thử lại sau.', 'error');
                } else {
                    swal('Lỗi', `Có lỗi xảy ra (Status: ${error.response.status}). Vui lòng thử lại.`, 'error');
                }
            } else {
                // Handle errors without a response (e.g., network errors)
                console.error('Login error:', error);
                swal("Error!", "Network errors occurred during login.", "error");
            }
        }
    },

    register: async (userData) => {
        try {
            const response = await apiRegister(userData);

            if (response?.data.err === 0) {
                swal('Thành Công', response.data.msg, 'success').then((value) => { window.location.reload() })
            } else {
                swal('Thông Báo !', response.data.msg, 'warning')
            }
        } catch (error) {
            swal("Error!", error.response.data.msg || error.message ||"An unexpected error when register!", "error");
            console.log(error.response.data.msg || error.message || error);
        }
    },

    logout: () => {
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        set({
            isLoggedIn: false,
            user: null,
        });
        localStorage.removeItem('user');

        try {
            fetch('https://www.sandbox.paypal.com/signout', {
                method: 'GET',
                credentials: 'include', // Allows cookies to be sent with the request
                mode: 'no-cors' // Prevents CORS issues by not expecting a response
            });
        } catch (error) {
            console.warn('PayPal signout request failed, redirecting directly.');
        }
    },
    setUser: (userData) => {
        set({
            user: userData,
        });
    }
}));

export default useAuthStore;

// Helper function to handle errors
const handleAuthError = (error) => {
    if (error.response) {
        switch (error.response.status) {
            case 400:
            case 401:
                swal("Thông Báo", "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.", "warning");
                break;
            case 500:
                swal('Lỗi Server', 'Có lỗi xảy ra trên server. Vui lòng thử lại sau.', 'error');
                break;
            default:
                swal("Error!", "An unexpected error occurred.", "error");
        }
    } else {
        console.error('Error initializing auth:', error);
        swal("Error!", "Network errors occurred during login.", "error");
    }
};
