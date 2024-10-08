import { useState } from 'react';
import useAuthStore from '../stores/authStore'

const PhoneNumberForm = ({ userData }) => {
    const [phone, setPhone] = useState('');
    const { oauthLogin } = useAuthStore();

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            await oauthLogin({
                ...userData,
                phone,
            });
        } catch (error) {
            setError('An error occurred while logging in. Please try again.');
        } 
    };

    return (
        <form className='space-y-3' onSubmit={handleSubmit}>
            <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Nhập số điện thoại"
                className='appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                required
            />
            <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
                Bổ sung số điện thoại
            </button>
        </form>
    );
};

export default PhoneNumberForm;
