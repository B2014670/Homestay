import axios from "axios";
import Cookies from 'js-cookie';

const instance = axios.create({
  baseURL: import.meta.env.VITE_REACT_APP_SERVER_URL
})

// Add a request interceptor
instance.interceptors.request.use(function (config) {
  // Set Content-Type
  if (config && config.data instanceof FormData) {
    config.headers['Content-Type'] = 'multipart/form-data';
  } else {
    config.headers['Content-Type'] = 'application/json';
  }

  const token = localStorage.getItem('accessToken'); // or from Zustand store
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  return config;
}, function (error) {
  // Do something with request error
  return Promise.reject(error);
});

// Add a response interceptor
instance.interceptors.response.use(function (response) {
  return response;
},
  async function (error) {
    const originalRequest = error.config;

    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // try {
        // Send request to refresh the token
        const { data } = await instance.post('/user/token', {}, {
          withCredentials: true
        });        

        // Ensure data contains accessToken and refreshToken
        if (data && data.data && data.data.accessToken && data.data.refreshToken) {
          // Update cookies with the new tokens
          Cookies.set('accessToken', data.data.accessToken, { expires: 15 / 24 /60 }); // 15 minutes
          Cookies.set('refreshToken', data.data.refreshToken, { expires: 2 }); // 2 days

          // Retry the original request with the new access token
          return instance(originalRequest);
        } 
      // } catch (refreshError) {
      //   console.error('Token refresh error:', refreshError);
      //   const { logout } = useAuthStore.getState();
      //   logout(); // Clear state and log out the user
      //   swal("Thông Báo", "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.", "warning");
      //   return Promise.reject(refreshError);
      // }
    }

    return Promise.reject(error);
  }
);

export default instance