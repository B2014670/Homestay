import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import swal from "sweetalert";
import { apiResetPassword } from '../services'
import { path } from '../utils/constant';
import { useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa'

const ResetPassword = () => {
    const navigate = useNavigate();
    const { token } = useParams();
    const [showPassword, setShowPassword] = useState(false);

    const validationSchema = Yup.object({
        password: Yup.string()
            .required('Mật khẩu không được để trống')
            .min(6, 'Mật khẩu phải ít nhất 6 ký tự'),
    });

    const handleSubmit = async (data, { setSubmitting }) => {
        try {
            const response = await apiResetPassword(token, { newPassword: data.password });

            if (response.data.err === 0) {
                swal('Thành Công', response.data.msg, 'success').then((value) => { navigate(`/${path.LOGIN}`) })
            } else {
                swal('Thông Báo !', response.data.msg, 'warning')
                alert('Email không tồn tại trong hệ thống.');
            }
        } catch (error) {            
            if (error.response.data.err === -1) {
                swal('Thông Báo !', error.response.data.msg, 'warning')
            }
            else {
                swal('Thông Báo !', error.response.data.msg, 'error')
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="sm:mx-0 w-full md:w-1/2 lg:w-1/3 py-4 sm:px-2 md:px-4 my-auto">
            <div className="bg-gray-50 border border-gray-300 py-8 px-4 shadow sm:rounded-lg sm:px-10">
                <h2 className="mb-6 text-center text-3xl font-bold text-gray-900">Đặt lại mật khẩu</h2>
                <Formik
                    initialValues={{ email: '' }}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                >
                    {({isSubmitting}, errors) => (
                        <Form className="space-y-6">                           
                            <div>
                                <label htmlFor="password" className="block font-medium text-gray-700">Mật khẩu mới</label>
                                <div className="mt-1 relative">
                                    <Field
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        placeholder="Nhập mật khẩu mới"
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

                            <div>
                                <button
                                    type="submit"
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    disabled=''
                                >
                                    {isSubmitting ? 'Đang gửi...' : 'Gửi yêu cầu'}
                                </button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>

        </div>
    );
}

export default ResetPassword;