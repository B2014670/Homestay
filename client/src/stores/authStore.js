import { create } from 'zustand';
import swal from "sweetalert";
import Cookies from 'js-cookie';
import { apiRegister, apiLogin, validateToken, apiOauthLogin } from '../services/auth';

const useAuthStore = create((set) => ({
    isLoggedIn: false,
    user: null,

    initializeAuth: async () => {
        const tokenCookie = Cookies.get('accessToken');
        if (tokenCookie) {
            try {
                const response = await validateToken();

                if (response.status === 200) {
                    set({
                        isLoggedIn: true,
                        user: response.data.data.user,
                    });
                } else {
                    swal('Thông Báo !', response.data.msg, 'warning');
                }
            } catch (error) {
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
                Cookies.set('refreshToken', response.data.data.refreshToken, { expires: (1 / 24 / 60) * 60 * 24 });
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
                Cookies.set('refreshToken', response.data.data.refreshToken, { expires: (1 / 24 / 60) * 60 * 24 });
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
            swal("Error!", "An unexpected error when register!", "error");
            console.log(error);
        }
    },

    logout: () => {
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        set({
            isLoggedIn: false,
            user: null,
        });
    },
    // Get the current state
    getState: () => ({
        isLoggedIn: useAuthStore((state) => state.isLoggedIn),
        user: useAuthStore((state) => state.user),
    }),
}));

export default useAuthStore;
