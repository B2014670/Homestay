import React, { useCallback,useEffect } from 'react'
import logo from '../../assets/OIP.png'
import { Button } from '../../components'
import icons from '../../ultils/icons'
import { Link, useNavigate } from 'react-router-dom'
import { path } from '../../ultils/constant'
import { useSelector,useDispatch} from 'react-redux'
import * as actions from '../../store/actions'
// import {apiInfoUser} from '../../services/auth';
import '../containers.css'



const { CgLogIn, CgLogOut, CgNotes } = icons;



const Header = () => {
    
    const dispatch = useDispatch()
    const { IsLoggedIn , nameUser } = useSelector(state => state.auth)
    const navigate = useNavigate()
    const goLogin = useCallback(() => {
        navigate(path.LOGIN)
    }, [])
    const goRegister = useCallback(() => {
        navigate(path.REGISTER)
    }, [])

 

   


    return (
        <div className='w-full flex items-center justify-center headerSticky'>
            <div className='w-1100 flex items-center justify-between'>
                <Link to='/trangchu'>
                    <img className='w-[300px] h-[70px] object-cover'
                        src={logo}
                        alt='logo'
                    /></Link>
                <div className='flex items-center gap-1'>
                    {!IsLoggedIn && <div className='flex items-center gap-1'>
                    <div> Xin Chào Quý Khách !</div>
                    <Button
                        text={'Đăng Nhập'}
                        textColor='text-white'
                        bgColor='bg-[#3961fb]'
                        IcAfter={CgLogIn}
                        onClick={goLogin} />
                    <Button
                        text={'Đăng Kí'}
                        textColor='text-white'
                        bgColor='bg-[#3961fb]'
                        IcAfter={CgNotes}
                        onClick={goRegister} />
                    </div>
                    }
                    {IsLoggedIn && 
                    <div className='flex items-center gap-1'>
                    <div className='font-semibold'> Xin chào  {nameUser}  !</div>
                    <Button 
                    text={'Đăng Xuất'} 
                    textColor='text-white' 
                    bgColor='bg-secondary2' 
                    IcAfter={CgLogOut}
                    onClick={()=>{
                        navigate('/trangchu')
                        dispatch(actions.logout())
                    }}
                    />
                    </div>}
                    
                </div>
            </div>

        </div>
    )
}

export default Header
