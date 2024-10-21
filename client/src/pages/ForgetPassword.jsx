import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import swal from "sweetalert";
import { apiForgotPassword } from '../services'
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const ForgetPassword = () => {
    const navigate = useNavigate();

    const validationSchema = Yup.object({
        email: Yup.string()
            .email('Email không hợp lệ')
            .required('Vui lòng nhập email'),
    });

    const handleSubmit = async (data, { setSubmitting }) => {
        try {
            const response = await apiForgotPassword({ email: data.email });

            if (response.data.err === 0) {
                swal('Thành Công', response.data.msg, 'success').then((value) => { navigate('/login') })
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
                <h2 className="mb-6 text-center text-3xl font-bold text-gray-900">Quên mật khẩu</h2>
                <Formik
                    initialValues={{ email: '' }}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                >
                    {({isSubmitting}, errors) => (
                        <Form className="space-y-6">
                            <div>
                                <label htmlFor="email" className="block font-medium text-gray-700">Email</label>
                                <div className="mt-1">
                                    <Field
                                        id="email"
                                        name="email"
                                        type="text"
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        placeholder="Nhập số email"
                                    />
                                    <ErrorMessage name="email" component="div" className="text-red-500 text-sm mt-1" />
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

export default ForgetPassword;