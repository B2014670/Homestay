import React, {useState,useEffect} from 'react'
import { Link, useNavigate  } from 'react-router-dom'
import { InputForm, Button } from '../../components'
import { useDispatch, useSelector } from 'react-redux'
import * as actions from '../../store/actions'

const Login = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { IsLoggedIn } = useSelector(state => state.auth)
  
  const [payload,setPayload] = useState({
    phone :   '',
    password : '',  
  })

  const [invalidatefield, setInvalidatefield] = useState([])

 
  const validate = (payload) => {
    // console.log(payload)
    let invalids = 0
    let fields = Object.entries(payload)
    fields.forEach(item => {
      if (item[1] === '') {
        setInvalidatefield(prev => [...prev, {
          name: item[0],
          message: 'Bạn không được bỏ trống trường này .! '
        }])
        invalids++
      }
    })
    fields.forEach(item => {
      switch (item[0]) {
        case 'password':
          if (item[1].length < 8) {
            setInvalidatefield(prev => [...prev, {
              name: item[0],
              message: 'Mật khẩu không hợp lệ (Lớn hơn 8 chữ số)) .! '
            }])
            invalids++
          }
          break;
        case 'phone':
          if ((!+item[1]) || (item[1].length !== 10)) {
            setInvalidatefield(prev => [...prev, {
              name: item[0],
              message: 'Số điện thoại không hợp lệ (bao gồm 10 số) .! '
            }])
            invalids++
          }
          break;
        default: break;
      }
    })
    return invalids
  }

  useEffect(() => {
    IsLoggedIn && navigate('/trangchu')
  }, [IsLoggedIn])

 
  const handleSubmit = () => {
    let invalids = validate(payload)

    if (invalids === 0) dispatch(actions.login(payload))
  }
  

  return (
    <div className=' flex items-center justify-center'>
      <div className='mt-3 bg-white w-[600px] p-[30px] rounded-md shadow-md pb-[100px]'>
        <h1 className='font-semibold text-2xl'>Đăng Nhập</h1>
        <div className='w-full flex flex-col gap-3 mb-4 mt-3'>
        <InputForm setInvalidatefield={setInvalidatefield} invalidatefield={invalidatefield} placeholder="Số điện thoại ..." label={'Số điện thoại : '} value={payload.phone} setValue={setPayload} type={'phone'} typeinput={'text'} />
        <InputForm setInvalidatefield={setInvalidatefield} invalidatefield={invalidatefield} placeholder="Mật khẩu ..." label={'Mật Khẩu : '} value={payload.password} setValue={setPayload} type={'password'} typeinput={'password'} />
        </div>
        <div className='flex justify-center items-center '>
          <Button
            text='Đăng Nhập'
            bgColor='bg-secondary1'
            textColor='text-white'
            fullwidth
            onClick={handleSubmit}
          />
        </div >
        <div className=' m-2 '> Bạn chưa có tài khoản ? 
          <small className='text-[blue] hover:underline hover:text-[orange] cursor-pointer ml-2'>
             <Link to="/register">Tạo tài khoản mới !</Link>
          </small>
        </div>
      </div>
    </div>
  )
}

export default Login
