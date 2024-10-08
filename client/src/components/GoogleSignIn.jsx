import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';

const GoogleSignIn = ({ onSignIn }) => {
  const login = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        const res = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: {
            Authorization: `Bearer ${response.access_token}`,
          },
        });
        const userData = {
          name: res.data.name,
          email: res.data.email,
          img: {url:res.data.picture},
          oauth: "google"
        };
        onSignIn(userData);
      } catch (error) {
        console.error('Google Sign-In Error:', error);
      }
    },
    onError: () => {
      console.log('Login Failed');
    },
  });

  return (
    <button
      onClick={() => login()}
      className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white font-medium hover:bg-gray-50"
    >
      <img className="h-5 w-5 mr-2" src='/googleIcon.svg' alt="Google icon" />
      Google
    </button>
  );
};

export default GoogleSignIn;
