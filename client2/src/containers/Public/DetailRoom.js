import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Image } from "antd";
import { TbSquareRoundedArrowUpFilled } from "react-icons/tb";
import { path } from "../../ultils/constant";
import moment from "moment";
import dayjs from "dayjs";
import { useSelector } from "react-redux";
import { DatePicker, Form, Input, Button, Rate } from "antd";
import customParseFormat from "dayjs/plugin/customParseFormat";
import PayButton from "../../components/PayButton";
import { LoginOutlined } from "@ant-design/icons";
import { apiInfoSector, apiPostOrderRoom } from "../../services";
import Item from "antd/es/list/Item";

import swal from "sweetalert";
const { RangePicker } = DatePicker;

dayjs.extend(customParseFormat);

const dateFormat = "DD/MM/YYYY";

const DetailRoom = () => {
  const navigate = useNavigate();

  const { IsLoggedIn, nameUser, phoneUser, idUser } = useSelector(
    (state) => state.auth
  );
  const location = useLocation();

  var {
    _id,
    nameRoom,
    imgRoom,
    danhgiaRoom,
    loaiRoom,
    idSectorRoom,
    discRoom,
    ordersRoom,
    giaRoom,
    cmtRoom,
  } = location.state.detailData;
  const r = location.state.detailData;
  const [bigImg, setBigImg] = useState(imgRoom[0].secure_url);
  const [arrayDateInput, setArrayDateInput] = useState([]);
  const [paymentByPaypal, setPaymentByPaypal] = useState(false);
  const [disabledDateData, setDisabledDateData] = useState([]);
  const [Sector, setSector] = useState({})
  const [amount, setAmount] = useState(10)
  // const [onError, setOnError] = useState(false)
  const [formData, setFormData] = useState({
    idUser: idUser,
    userInput: nameUser,
    phoneInput: phoneUser,
    idRoom: _id,
    dateInput: arrayDateInput,
    totalMoney: amount,
    pay: paymentByPaypal,
    statusOrder: 1,
  });
  // console.log(formData)
  
  const onChange1 = ({ target: { value } }) => {
    setPaymentByPaypal(value);
    setFormData({ ...formData, pay: value });
    // alert(value)
  };

  const handleSetBigImg = (srcImg) => {
    setBigImg(srcImg);
  };

  const dateFormat = "DD/MM/YYYY";
  const disabledDate = (current) => {
    const formattedDisabledDays = disabledDateData.map((day) =>
      dayjs(day, "DD/MM/YYYY")
    );
    // Kiểm tra xem ngày hiện tại có nằm trong mảng formattedDisabledDays không
    // hoặc ngày hiện tại có phải là ngày trong quá khứ không
    return (
      current < dayjs().startOf("day") ||
      formattedDisabledDays.some((disabledDay) =>
        current.isSame(disabledDay, "day")
      )
    );
  };
  // Hàm nhận vào hai ngày dạng chuỗi (YYYY-MM-DD) và trả về một mảng chứa các ngày từ ngày bắt đầu đến ngày kết thúc
  function getDaysBetween(startDate, endDate) {
    // Sử dụng thư viện dayjs để làm việc với ngày tháng

    // Tạo hai đối tượng dayjs từ hai ngày đầu vào
    let start = dayjs(startDate);
    let end = dayjs(endDate);

    // Tạo một mảng rỗng để lưu kết quả
    let result = [];

    // Lặp từ ngày bắt đầu đến ngày kết thúc
    while (start.isBefore(end) || start.isSame(end)) {
      // Thêm ngày hiện tại vào mảng kết quả
      result.push(start.format("DD/MM/YYYY"));

      // Tăng ngày hiện tại lên một ngày
      start = start.add(1, "day");
    }

    // Trả về mảng kết quả
    setArrayDateInput(result);
  }

  const handleDateChange = (e) => {
    // console.log(e)

   if(e){
    getDaysBetween(e[0].$d, e[1].$d);

    setFormData({ ...formData, dateInput: arrayDateInput });
    const isOverlap = arrayDateInput.some((date) =>
      disabledDateData.includes(date)
    );
    if (isOverlap) {
      swal(
        "Thông báo ! ",
        "Vui lòng không chọn những ngày đã vô hiệu hóa trước đó !",
        "warning"
      );
    }
    setAmount(Number(((arrayDateInput.length*giaRoom)/24000).toFixed(2)))
   
   }
  };
 
  useEffect(() => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      dateInput: arrayDateInput,
      totalMoney: arrayDateInput.length * giaRoom,
    }));
    
    const isOverlap = arrayDateInput.some((date) =>
      disabledDateData.includes(date)
    );
    if (isOverlap) {
      swal(
        "Thông báo ! ",
        "Vui lòng không chọn những ngày đã vô hiệu hóa trước đó !",
        "warning"
      );
    }
    setAmount(Number(((arrayDateInput.length*giaRoom)/24000).toFixed(2)))
  }, [arrayDateInput]);

  useEffect(() => {
    const newDisabledDateData = [...disabledDateData];
    // Assuming ordersRoom is an array of objects and each object has a dateInput array
    ordersRoom.forEach((order) => {
      order.forEach((date) => {
        newDisabledDateData.push(date);
      });
    });
    setDisabledDateData(newDisabledDateData);

    // console.log(disabledDateData)
  }, [ordersRoom]);

  const apiOrder = async (payload) => {
    const result = await apiPostOrderRoom(payload);
    // console.log(result)
    return result;
  };

  const submitFormOrder = async () => {
    const datainput = {
      Room: location.state.detailData,
      infoOrder: formData,
    };
    const response = await apiOrder(datainput);
    if (response.status === 200)
      swal("Thành Công !", " Đặt phòng thành công !", "success" ).then((value) => {
        window.location.reload();
      });
  };

  useEffect(() => {
    const fetchSectors = async () =>{
      const response = await apiInfoSector({"idSector":idSectorRoom})
      setSector(response.data)
    }
    fetchSectors()
    // console.log(Sector)
  }, [])
  

  return (
    <div className=" m-1 w-1100 ">
      <div className="font-semibold flex justify-center w-1100 text_bigSize1">
        Chi Tiết Phòng Homestay
      </div>
      <div className="">
        <div className="flex">
          {/* img preview */}
          <div className="flex w-[720px]">
            {/* img lon */}
            <div className="m-1  w-[500px] ">
              <Image
                className="rounded-md"
                src={bigImg}
                height={400}
                width={500}
              />
            </div>
            {/* dong img lon */}
            {/* img nho */}
            <div className="m-1 b w-[200px] column-1 h-[400px] align-middle">
              <div
                onClick={() => {
                  handleSetBigImg(imgRoom[0].secure_url);
                }}
              >
                <Image
                  preview={false}
                  className=" cursor-pointer rounded-md"
                  src={imgRoom[0].secure_url}
                  height={100}
                  width={200}
                />
              </div>
              <div
                onClick={() => {
                  handleSetBigImg(imgRoom[1].secure_url);
                }}
              >
                <Image
                  preview={false}
                  className=" cursor-pointer rounded-md"
                  src={imgRoom[1].secure_url}
                  height={100}
                  width={200}
                />
              </div>
              <div
                onClick={() => {
                  handleSetBigImg(imgRoom[2].secure_url);
                }}
              >
                <Image
                  preview={false}
                  className=" cursor-pointer rounded-md"
                  src={imgRoom[2].secure_url}
                  height={100}
                  width={200}
                />
              </div>
              <div className="w-full mt-3 ">
                <div className="w-[200px] flex justify-center">
                  <TbSquareRoundedArrowUpFilled size={30} width={60} />
                </div>
                <div className="w-[200px] flex justify-center">
                  Nhấn để xem trước
                </div>
              </div>
            </div>
            {/* dong img nho */}
          </div>
          {/* dong img preview */}
          {/* card thanh toán */}
          <div className=" m-1 w-[400px] z rounded-lg ">
            <Form
              layout="vertical"
              onFinish={submitFormOrder}
              labelCol={{
                span: 200,
              }}
              style={{
                maxWidth: 500,
              }}
            >
              <div className="font-semibold flex justify-around text_bigSize1">
                Đặt Phòng
              </div>
              {/* <div className="flex justify-around items-center">
                <Form.Item
                  label="Tên người Đặt :"
                  name="nameUser"
                  onChange={(e) => {
                    setFormData({ ...formData, userInput: e.target.value });
                  }}
                  className="w-[80%]"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập thông tin người đặt !",
                    },
                  ]}
                >
                  <Input placeholder="Nhập tên người đặt ..." />
                </Form.Item>
              </div> */}
              {/* <div className="flex justify-around items-center">
                <Form.Item
                  label="Số Điện Thoại :"
                  name="phoneUser"
                  className="w-[80%]"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập thông tin người đặt !",
                    },
                    {
                      pattern: /^0\d{9}$/,
                      message:
                        "Số điện thoại phải bắt đầu bằng số 0 và có 10 chữ số.",
                    },
                  ]}
                  onChange={(e) => {
                    setFormData({ ...formData, phoneInput: e.target.value });
                  }}
                >
                  <Input placeholder="Nhập SĐT người đặt ..." />
                </Form.Item>
              </div> */}
              <div className="flex justify-around items-center">
                <Form.Item
                  label="Nhập ngày nhận và trả phòng :"
                  name="dateOrder"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập thông tin ngày đặt phòng !",
                    },
                  ]}
                >
                  <RangePicker
                    className=""
                    disabledDate={disabledDate}
                    placeholder={["Ngày Đi", "Ngày Về"]}
                    initialValues={[
                      dayjs(dayjs().format(dateFormat), dateFormat),
                      dayjs(dayjs().format(dateFormat), dateFormat),
                    ]}
                    format={dateFormat}
                    onChange={handleDateChange}
                  />
                </Form.Item>
              </div>
              <div className=" flex w-full justify-around">
                <div className=" flex justify-center items-center">
                  Số ngày : {arrayDateInput.length}
                </div>
                <div className=" flex justify-center items-center">
                  Đơn giá phòng : {giaRoom.toLocaleString()} VNĐ
                </div>
              </div>
              <div className=" flex w-full justify-around">
                <div className=" flex justify-center items-center text_bigSize2">
                  Tổng tiền phòng :{" "}
                  {(arrayDateInput.length * giaRoom).toLocaleString()} VNĐ
                </div>
              </div>
              <div className="ml-4  text-sm">
                <div className="  flex  items-center">
                  * Vui Lòng đọc kĩ thông tin đặt phòng
                </div>
                <div className="  flex  items-center">
                  * Vui lòng kiểm tra thông tin ngày đi và ngày về
                </div>
                <div className="  flex  items-center pr-2">
                  * Thời gian Checkin và Checkout là 11h trưa hôm trước và 11h
                  trưa hôm sau
                </div>
                <div className="   flex justify-center  items-center pr-4">
                  * Trường hợp đã thanh toán qua Paypal, quý khách muốn hủy đặt
                  phòng, Xin liên hệ qua hostline để hoàn tiền
                </div>
              </div>
              {IsLoggedIn ? (
                <PayButton
                  Room={r}
                  infoOrder={formData}
                  submitFormOrder={submitFormOrder}
                  paymentByPaypal={paymentByPaypal}
                  setPaymentByPaypal={setPaymentByPaypal}
                  onChange1={onChange1}
                  amount={amount}
                />
              ) : (
                <div className="w-full flex justify-center icons-center mt-5 mb-5">
                  <Button
                    danger
                    type="text"
                    icon={<LoginOutlined />}
                    onClick={() => {
                      navigate("/login");
                    }}
                    size={40}
                  >
                    Đăng Nhâp để tiếp tục
                  </Button>
                </div>
              )}
            </Form>
          </div>
          {/* đóng card */}
        </div>
        <div className="bg-black w-1100 h-[2px] mt-5 mb-5 flex justify-center items-center">

        </div>
        <div className="detailRoom_Charactic w-1100  ">
          <div>{nameRoom}</div>
          <div>
            <Rate value={danhgiaRoom} disabled allowHalf />
          </div>
          <div className="text-sm">Mô tả : {discRoom}</div>
        </div>
        <div className="detailRoom_Charactic w-1100  ">
          <div>Khu vực : {Sector.nameSector}</div>
          <div>Vị trí của khu vực : {Sector.addressSector}</div>
          <div className="text-sm">Điểm nổi bật của khu vực : {Sector.discSector}</div>
          
        </div>

        <div className="bg-black w-1100 h-[2px] mt-5 mb-5 flex justify-center items-center"></div>
        <div className="comment_box w-1100  ">
          <div>Bình Luận : {cmtRoom.length}</div>

          {cmtRoom.length === 0 ? (
            <div className=" comment_box">
              <div>Chưa có bình luận nào ... </div>
              <div>Hãy góp ý để HOMESTAY24H hoàn thiện hơn nhé ! </div>
            </div>
          ) : (
            <div>
              {cmtRoom?.map((cmt,index) => (
                <div className=" comment_box" key={index}>
                  <div>
                    <Rate value={cmt.rate} disabled allowHalf />
                  </div>
                  <div>{cmt.content}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetailRoom;
