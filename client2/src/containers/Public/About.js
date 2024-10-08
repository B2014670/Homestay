import React from 'react'
import { NavLink } from 'react-router-dom'
import { path } from '../../ultils/constant'
import icons from '../../ultils/icons'
import banner4 from '../../assets/banner4.jpg'
import tieuchi from '../../assets/batieuchi.png'
require('../containers.css')
const { MdOutlineCheckCircleOutline } = icons;

const About = () => {
    return (
        <div className='about mb-5'>
            <div className='flex justify-center items-center '>
                <img className='imgc' alt='' src={banner4}></img>
                <div className='aboutBanner  justify-center items-center'>
                    Giới Thiệu
                    <div className='aboutBannerContent flex justify-center items-center'>
                        <NavLink to={'/trangchu'} className='contentBanner'>Trang Chủ</NavLink>/
                        <NavLink className='contentBanner'>Giới Thiệu</NavLink>
                    </div>
                </div>
            </div>
            <div className='w-1100 h-[400px] '>
                <div className='w-1100 flex justify-center mt-10 aboutTitle'>Về Chúng Tôi</div>
                <div className=' w-1100 mt-5 mb-5 flex col-2 justify-center items-center'>
                    <div className=' w-[50%] justify-center items-center aboutTieuChi '>

                        <div className='flex justify-center items-center  '><img className='imgtieuchi' src={tieuchi}></img></div>
                        <div className=' columns-1 items-center ml-[200px] justify-center'>
                            <div className='flex  items-center'><MdOutlineCheckCircleOutline className='imgabc' /><div className='abc'>Uy tín</div></div>
                            <div className='flex  items-center'><MdOutlineCheckCircleOutline className='imgabc' /><div className='abc'>Chất Lượng</div></div>
                            <div className='flex  items-center'><MdOutlineCheckCircleOutline className='imgabc' /><div className='abc'>Tận Tâm</div></div>
                        </div>

                    </div>

                    <div className='ml-5 w-[50%] aboutTieuChiContent '>
                        <div className='mb-5'>
                            Hiện nay, dịch vụ cho thuê Homestay tại Hòn Sơn có phòng giá rẻ ngày càng nhiều. 
                            Nhưng để tìm được những nhà cung cấp dịch vụ cho thuê Homestay
                            , uy tín và giá cả phải chăng thì không phải dễ.</div>
                        <div className='mb-5'>
                            Nổi bật trong số đó có HOMESTAY24H, 
                            chuyên cho thuê chỗ ở phòng 1-2 người, 3-4 người ,... giá rẻ, phòng mới, 
                           nhân viên vui vẻ nhiệt tình cam kết làm hài lòng quý khách
                             khi đến với dịch vụ cho HOMESTAY24H của chúng tôi.</div>
                        <div className='mb-5'>
                            Trải qua hơn nhiều năm phục vụ, đưa đón hành khách HOMESTAY24H
                             đã từng bước khẳng định và giữ vững vị thế
                              – uy tín chất lượng dịch vụ hàng đầu tại Hòn Sơn nói riêng 
                              và miền Nam nói chung, làm
                               hài lòng hàng trăm triệu lượt khách trong
                                nước cũng như du khách quốc tế đến Việt Nam.</div>

                    </div>

                </div>

            </div>

        </div>
    )
}

export default About