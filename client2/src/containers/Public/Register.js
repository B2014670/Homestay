import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { InputForm, Button } from "../../components";
import { useDispatch, useSelector } from "react-redux";
import * as actions from "../../store/actions";

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { IsLoggedIn } = useSelector((state) => state.auth);

  const [payload, setPayload] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    password: "",
  });

  useEffect(() => {
    IsLoggedIn && navigate("/");
  }, [IsLoggedIn]);

  const [invalidatefield, setInvalidatefield] = useState([]);
  const validate = (payload) => {
    // console.log(payload)
    let invalids = 0;
    let fields = Object.entries(payload);
    const phoneRegex = /^[0-9]{10}$/;

    fields.forEach((item) => {
      if (item[1] === "") {
        setInvalidatefield((prev) => [
          ...prev,
          {
            name: item[0],
            message: "Bạn không được bỏ trống trường này .! ",
          },
        ]);
        invalids++;
      }
    });
    fields.forEach((item) => {
      switch (item[0]) {
        case "password":
          if (item[1].length < 9) {
            setInvalidatefield((prev) => [
              ...prev,
              {
                name: item[0],
                message: "Mật khẩu không hợp lệ .! ",
              },
            ]);
            invalids++;
          }
          break;
        case "phone":
          if (!phoneRegex.test(item[1])) {
            setInvalidatefield((prev) => [
              ...prev,
              {
                name: item[0],
                message: "Số điện thoại phải là 10 chữ số .! ",
              },
            ]);
            invalids++;
          }
          break;
        case "email":
          if (!validateEmail(item[1])) {
            // console.log(item[1])
            setInvalidatefield((prev) => [
              ...prev,
              {
                name: item[0],
                message: "Email không hợp lệ .! ",
              },
            ]);
            invalids++;
          }
          break;
        default:
          break;
      }
    });
    return invalids;
  };

  const validateEmail = (email) => {
    const res = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    return res.test(String(email).toLowerCase());
  };

  const handleSubmit = async () => {
    let invalids = validate(payload);
    // console.log(invalids)
    // console.log(invalidatefield)
    if (invalids === 0) dispatch(actions.register(payload));
  };
  return (
    <div className=" flex items-center justify-center">
      <div className="mt-3 bg-white w-[600px] p-[30px] rounded-md shadow-md pb-[100px]">
        <h1 className="font-semibold text-2xl">Đăng Ký</h1>
        <div className="w-full flex flex-col gap-3 mb-4 mt-3">
          <InputForm
            setInvalidatefield={setInvalidatefield}
            invalidatefield={invalidatefield}
            placeholder="Tên tài khoản ..."
            label={"Tên Tài Khoản : "}
            value={payload.name}
            setValue={setPayload}
            type={"name"}
            typeinput={"text"}
          />
          <InputForm
            setInvalidatefield={setInvalidatefield}
            invalidatefield={invalidatefield}
            placeholder="Số điện thoại ..."
            label={"Số điện thoại : "}
            value={payload.phone}
            setValue={setPayload}
            type={"phone"}
            typeinput={"text"}
          />
          <InputForm
            setInvalidatefield={setInvalidatefield}
            invalidatefield={invalidatefield}
            placeholder="Email ..."
            label={"Email : "}
            value={payload.email}
            setValue={setPayload}
            type={"email"}
            typeinput={"email"}
          />
          <InputForm
            setInvalidatefield={setInvalidatefield}
            invalidatefield={invalidatefield}
            placeholder="Địa chỉ ..."
            label={"Địa chỉ : "}
            value={payload.address}
            setValue={setPayload}
            type={"address"}
            typeinput={"text"}
          />
          <InputForm
            setInvalidatefield={setInvalidatefield}
            invalidatefield={invalidatefield}
            placeholder="Mật khẩu ..."
            label={"Mật Khẩu : "}
            value={payload.password}
            setValue={setPayload}
            type={"password"}
            typeinput={"password"}
          />
        </div>
        <div className="flex justify-center items-center ">
          <Button
            text="Đăng Ký"
            bgColor="bg-secondary1"
            textColor="text-white"
            fullwidth
            onClick={handleSubmit}
          />
        </div>
        <div className=" m-2 ">
          Bạn đã có tài khoản ?
          <small className="text-[blue] hover:underline hover:text-[orange] cursor-pointer ml-2">
            <Link to="/login"> Đăng Nhập ngay !</Link>
          </small>
        </div>
      </div>
    </div>
  );
};

export default Register;
