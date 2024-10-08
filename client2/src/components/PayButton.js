import React, { useState, useEffect } from "react";

import { PayPalButton } from "react-paypal-button-v2";
import swal from "sweetalert";
import { Form, Button, Radio, Space } from "antd";
import { apiPostOrderRoom } from "../services";

const PayButton = (props) => {
 

  return (
    <div>
      <div className="flex justify-around items-center mt-3 ">
        <Radio.Group onChange={props.onChange1} value={props.paymentByPaypal}>
          <Space direction="vertical">
            <Radio value={true}>Thanh Toán qua tài khoản ngân hàng.</Radio>
            <Radio value={false}>
              Nhận Phòng và thanh toán trực tiếp tại quầy.
            </Radio>
          </Space>
        </Radio.Group>
      </div>
      {props.paymentByPaypal ? (
        <div className="mt-3 w-full p-5">
        <Form.Item>
          <PayPalButton
            amount={props.amount}
            // options={{
            //   clientId: process.env.PAYPAL_CLIENT_ID
            // }}
            // shippingPreference="NO_SHIPPING" // default is "GET_FROM_FILE"
            onSuccess={(details, data) => {
              props.submitFormOrder()
              // OPTIONAL: Call your server to save the transaction
            }}
            onError={() => {
              swal(
                "Báo lỗi ! ",
                "Xảy ra lỗi trong quá trình thanh toán ! ",
                "warning"
              );
            }}
          />
        </Form.Item>
      </div>
      ) : (
        <div className="w-full flex justify-center items-center mt-3 mb-5">
          <Button
            htmlType="submit"
            className=" flex justify-center items-center button_editAntd"
          >
            Đặt Phòng
          </Button>
        </div>
        
      )}
    </div>
  );
};

export default PayButton;
