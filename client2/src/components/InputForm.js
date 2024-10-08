import React from 'react'

const InputForm = ({label, value, setValue,type, typeinput, required, placeholder, invalidatefield, setInvalidatefield}) => {
  return (
    <div>
      <label htmlFor='phone'>{label}</label>
      <input 
      placeholder={placeholder} 
      type={typeinput}
      className='outline-none bg-[#e8f0fe] p-2  rounded-md w-full '
      value={value}
      onChange={ (e) => setValue(prev => ({...prev,[type]: e.target.value}))}
      required={required}
      onFocus={()=>setInvalidatefield([])}
      />
      {invalidatefield.length > 0 && 
       invalidatefield.some(i => i.name===type ) && 
       <small className='text-red-400 italic'>
        {invalidatefield.find(i=>i.name === type)?.message}
        </small>}
    </div>
  )
}

export default InputForm
