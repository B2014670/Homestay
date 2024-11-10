import React from 'react'
import { Typography } from 'antd'
const AppFooter = () => {
  return (
    <div className='AppFooter'>
      <Typography.Link href='SDT : 0987654323456'>+ 0987654323456</Typography.Link>
      <Typography.Link href='https://www.google.com' target={'_blank'}>Privacy pPOlice </Typography.Link>
      <Typography.Link href='https://www.google.com' target={'_blank'}> Term of use</Typography.Link>
    </div>
  )
}

export default AppFooter
