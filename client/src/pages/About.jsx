import React from 'react'
import { NavLink } from 'react-router-dom'
import { path } from '../ultils/constant'
import icons from '../ultils/icons'
import banner4 from '../assets/banner4.jpg'
import tieuchi from '../assets/tieuchi.png'

const { MdOutlineCheckCircleOutline } = icons;

const About = () => {
    return (
        <div className="w-full">
            <div className="relative py-4 flex flex-col items-center">
                <div
                    className="relative w-full max-w-screen-xl min-h-[350px] about_banner bg-cover bg-center bg-no-repeat shadow-lg shadow-gray-500 rounded-3xl"
                >
                    {/* Text section */}
                    <div className='aboutBanner flex justify-center items-end'>
                        Giới Thiệu
                        <div className='aboutBannerContent flex justify-center items-center'>
                            /<NavLink to={'/trangchu'} className='contentBanner'>Trang Chủ</NavLink>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className='relative max-w-screen-xl mx-auto flex flex-col items-center'>
                <h2 className='aboutTitle font-semibold'>Về Chúng Tôi</h2>

                <div className='w-full flex flex-col md:flex-row justify-center mt-5 mb-5 space-y-6 md:space-y-0 md:space-x-6'>
                    {/* Left Column - Image and Icons */}
                    <div className='w-full md:w-[50%] flex flex-col items-center'>

                        <div className='flex flex-col items-start justify-center space-y-2 mt-5'>
                            <div className='flex  items-center'><MdOutlineCheckCircleOutline className='imgabc' /><div className='abc'>Uy tín</div></div>
                            <div className='flex  items-center'><MdOutlineCheckCircleOutline className='imgabc' /><div className='abc'>Chất Lượng</div></div>
                            <div className='flex  items-center'><MdOutlineCheckCircleOutline className='imgabc' /><div className='abc'>Tận Tâm</div></div>
                        </div>
                        <img src={tieuchi} alt="Tiêu Chí" />
                    </div>

                    {/* Right Column - Text Content */}
                    <div className='w-full md:w-[50%] flex flex-col space-y-5 p-4 md:p-0'>
                        <p className='text-justify'>
                            HOMESTAY là lựa chọn tuyệt vời cho những ai cần homestay giá rẻ tại Hòn Sơn. Chúng tôi cung cấp các phòng từ 1-4 người, đầy đủ tiện nghi, sạch sẽ, với mức giá hợp lý, đáp ứng nhiều nhu cầu khác nhau.
                        </p>

                        <p className='text-justify'>
                            Nhân viên tại HOMESTAY luôn phục vụ tận tâm và chuyên nghiệp, đảm bảo mang đến trải nghiệm thoải mái cho khách hàng. Chúng tôi cam kết sự hài lòng và dịch vụ tốt nhất.
                        </p>

                        <p className='text-justify'>
                            HOMESTAY đã khẳng định uy tín qua nhiều năm hoạt động, thu hút không chỉ khách trong nước mà còn du khách quốc tế nhờ vào chất lượng và dịch vụ hàng đầu.
                        </p>
                    </div>
                </div>
            </div>

        </div>
    );
}

export default About;
