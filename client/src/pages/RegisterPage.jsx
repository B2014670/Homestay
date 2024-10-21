import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import useAuthStore from '../stores/authStore';

const Register = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [userData, setUserData] = useState(null);
    const { isLoading, register } = useAuthStore();

    const validationSchema = Yup.object({
        name: Yup.string()
            .min(2, 'Tên tài khoản quá ngắn!')
            .required('Vui lòng nhập tên tài khoản'),
        phone: Yup.string()
            .required('Số điện thoại không được để trống')
            .matches(/^[0-9]{10,}$/, 'Số điện thoại phải có ít nhất 10 chữ số'),
        email: Yup.string()
            .email('Email không hợp lệ')
            .required('Vui lòng nhập email'),
        address: Yup.string().required('Vui lòng nhập địa chỉ'),
        password: Yup.string()
            .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
            .required('Vui lòng nhập mật khẩu'),
    });

    const handleSubmit = (values) => {
        register(values);
    };

    return (
        <div className="sm:mx-0 w-full md:w-1/2 lg:w-1/3 py-4 sm:px-2 md:px-4">
            <div className="bg-gray-50 border border-gray-300 py-8 px-4 shadow sm:rounded-lg sm:px-10">
                <h2 className="mb-6 text-center text-3xl font-bold text-gray-900">Đăng Ký</h2>
                <Formik
                    initialValues={{ name: '', phone: '', email: '', address: '', password: '' }}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                >
                    {({ handleSubmit }) => (
                        <Form className="space-y-6" onSubmit={handleSubmit}>
                            <div>
                                <label htmlFor="name" className="block font-medium text-gray-700">
                                    Tên Tài Khoản
                                </label>
                                <div className="mt-1">
                                    <Field
                                        id="name"
                                        name="name"
                                        type="text"
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        placeholder="Tên tài khoản"
                                    />
                                    <ErrorMessage name="name" component="div" className="text-red-500 text-sm" />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="phone" className="block font-medium text-gray-700">
                                    Số điện thoại
                                </label>
                                <div className="mt-1">
                                    <Field
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        placeholder="Số điện thoại"
                                    />
                                    <ErrorMessage name="phone" component="div" className="text-red-500 text-sm" />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="email" className="block font-medium text-gray-700">
                                    Email
                                </label>
                                <div className="mt-1">
                                    <Field
                                        id="email"
                                        name="email"
                                        type="email"
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        placeholder="Email"
                                    />
                                    <ErrorMessage name="email" component="div" className="text-red-500 text-sm" />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="address" className="block font-medium text-gray-700">
                                    Địa chỉ
                                </label>
                                <div className="mt-1">
                                    <Field
                                        id="address"
                                        name="address"
                                        type="text"
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        placeholder="Địa chỉ"
                                    />
                                    <ErrorMessage name="address" component="div" className="text-red-500 text-sm" />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="password" className="block font-medium text-gray-700">
                                    Mật Khẩu
                                </label>
                                <div className="mt-1 relative">
                                    <Field
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        placeholder="Nhập mật khẩu"
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <FaEyeSlash className="h-5 w-5 text-gray-400" /> : <FaEye className="h-5 w-5 text-gray-400" />}
                                    </button>
                                    <ErrorMessage name="password" component="div" className="text-red-500 text-sm" />
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    disabled={isLoading}
                                >
                                    Đăng Ký
                                </button>
                            </div>
                        </Form>
                    )}
                </Formik>

                <div className="mt-6">
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Đã có tài khoản?{' '}
                        <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                            Đăng nhập ngay!
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
