import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import { path } from '../ultils/constant'
import { checkEmailLinked } from "../services"
import useAuthStore from '../stores/authStore'
import GoogleSignIn from '../components/GoogleSignIn'
import PhoneNumberForm from '../components/PhoneNumberForm'

const Login = () => {

    const location = useLocation();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [userData, setUserData] = useState(null);
    const [emailLinked, setEmailLinked] = useState(false);
    const { isLoggedIn, login, oauthLogin } = useAuthStore();

    const from = location.state?.from?.pathname || path.HOME;
      
    useEffect(() => {
        isLoggedIn && navigate(from, { replace: true })
    }, [isLoggedIn])

    const validationSchema = Yup.object({
        phone: Yup.string()
            .required('Số điện thoại không được để trống')
            .matches(/^[0-9]{10,}$/, 'Số điện thoại phải có ít nhất 10 chữ số'),
        password: Yup.string()
            .required('Mật khẩu không được để trống')
            .min(6, 'Mật khẩu phải ít nhất 6 ký tự'),
    });

    const handleGGSignIn = async (data) => {
        setUserData(data);

        const isEmailLinked = await checkEmailLinked({ email: data.email });
        setEmailLinked(isEmailLinked);

        if (isEmailLinked) {
            try {
                await oauthLogin({ ...data });
            } catch (error) {
                setError('An error occurred while logging in. Please try again.');
            }
        }
    };

    return (
        <div className="sm:mx-0 w-full md:w-1/2 lg:w-1/3 py-4 sm:px-2 md:px-4">
            <div className="bg-gray-50 border border-gray-300 py-8 px-4 shadow sm:rounded-lg sm:px-10">
                <h2 className="mb-6 text-center text-3xl font-bold text-gray-900">Đăng nhập</h2>
                <Formik
                    initialValues={{ phone: '', password: '' }}
                    validationSchema={validationSchema}
                    onSubmit={(values) => {
                        login(values); // Call login from authStore with form values
                    }}
                >
                    {(errors) => (
                        <Form className="space-y-6">
                            <div>
                                <label htmlFor="phone" className="block font-medium text-gray-700">Số điện thoại</label>
                                <div className="mt-1">
                                    <Field
                                        id="phone"
                                        name="phone"
                                        type="text"
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        placeholder="Nhập số điện thoại"
                                    />
                                    <ErrorMessage name="phone" component="div" className="text-red-500 text-sm mt-1" />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="password" className="block font-medium text-gray-700">Mật khẩu</label>
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
                                        {showPassword ? (
                                            <FaEyeSlash className="cursor-pointer h-5 w-5 text-gray-400" />
                                        ) : (
                                            <FaEye className="cursor-pointer h-5 w-5 text-gray-400" />
                                        )}
                                    </button>
                                </div>
                                <div>
                                    <ErrorMessage name="password" component="div" className="text-red-500 text-sm mt-1" />
                                </div>

                            </div>

                            <div className="flex items-center justify-between">
                                <div className="text-sm">
                                    <Link
                                        className="font-medium text-indigo-600 hover:text-indigo-500"
                                        to={`/${path.FORGET}`}
                                    >
                                        Quên mật khẩu?
                                    </Link>
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    disabled=''
                                >
                                    Đăng nhập
                                </button>
                            </div>
                        </Form>
                    )}
                </Formik>

                <div className="mt-6">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">Đăng nhập với</span>
                        </div>
                    </div>

                    <div className="mt-6 space-y-3">
                        <GoogleSignIn onSignIn={handleGGSignIn} />
                        {!emailLinked && userData && <PhoneNumberForm userData={userData} />}
                    </div>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Chưa có tài khoản?{' '}
                        <Link to={`/${path.REGISTER}`} className="font-medium text-indigo-600 hover:text-indigo-500" >Đăng ký !</Link>
                    </p>
                </div>
            </div>

        </div>
    );
}

export default Login