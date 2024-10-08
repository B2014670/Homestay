import React, { useEffect, useState } from "react";
import { apiInfoUser } from "../../services";
import { useSelector } from "react-redux";
import ListOrderRoom from "../../components/ListOrderRoom";
import icons from "../../ultils/icons";
import dayjs from "dayjs";
import moment from "moment";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { DatePicker, Select, Slider, Input } from "antd";
import { apiGetAllSector, apiGetAllRoom,apiInfoSector ,apiGetInfoRoom,apiGetInfoSector} from "../../services";
dayjs.extend(customParseFormat);
const { Option } = Select;

const { CiSearch } = icons;
const OrderRoom = () => {
  const [dataOrder, setDataOrder] = useState([]);
  const [allSector, setAllSector] = useState();

  const { IsLoggedIn, nameUser, phoneUser, idUser } = useSelector(
    (state) => state.auth
  );
  useEffect(() => {
    const fetchAllSector = async () => {
      const response = await apiGetAllSector();
      //   console.log(response.data);
      setAllSector(response.data.sectors);
    };
    fetchAllSector();
    // console.log(allSector);
  }, []);

  const [searchPlace, setSearchPlace] = useState("");
  const [selectedTypeRoom, setSelectedTypeRoom] = useState(null);
  const [selectSector, setSelectSector] = useState();
  const [filterRoom, setFilterRoom] = useState(dataOrder);
//   useEffect(() => {
//     let filteredData = dataOrder;
// // console.log(filterRoom)
//     if (searchPlace) {
//       filteredData = filteredData.filter((item) =>
//         item.nameRoom.toLowerCase().includes(searchPlace)
//       );
//     }
//     if (selectedTypeRoom) {
//       filteredData = filteredData.filter(
//         (item) => item.loaiRoom === selectedTypeRoom
//       );
//     }
//     if (selectSector) {
//       filteredData = filteredData.filter(
//         (item) => item.idSectorRoom === selectSector
//       );
//     }
//     setFilterRoom(filteredData);
//   }, [searchPlace, selectedTypeRoom, selectSector, dataOrder]);



  const handleChangeSelectRoomType = (value) => {
    setSelectedTypeRoom(value);
  };

  // const handleChangePlace = () => {
  //   console.log(e.target.value)
  //   setSearchPlace(e.target.value);
  //   // console.log(searchPlace)
  // };

  const handleChangeSelectSector = (value) => {
    setSelectSector(value);
  };

  // Hàm lấy thông tin phòng và khu vực từ API
const fetchRoomAndSectorInfo = async (order) => {
  const roomInfo = await apiGetInfoRoom({ "idRoom": order.idRoom });
  // console.log(roomInfo)
  const sectorInfo = await apiInfoSector({ "idSector": "65e6f99bfd15b4972b02bfe0"});
  // console.log(sectorInfo.data)
  return { ...order, ...roomInfo.data[0], ...sectorInfo.data };
};


const normalize = (str) => {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

const filterOrders = async () => {
  const fetchedOrders = await Promise.all(dataOrder.map(fetchRoomAndSectorInfo));
  const filteredData = fetchedOrders.filter(order => {
    const nameRoomNormalized = normalize(order?.nameRoom.toLowerCase());
    const searchPlaceNormalized = normalize(searchPlace.toLowerCase());
    return (
      (selectedTypeRoom ? order.loaiRoom === selectedTypeRoom : true) &&
      (selectSector ? order.idSectorRoom === selectSector : true) &&
      (searchPlace ? nameRoomNormalized.includes(searchPlaceNormalized) : true)
    );
  });
  setFilterRoom(filteredData);
};

// const filterOrders = async () => {
//   const fetchedOrders = await Promise.all(dataOrder.map(fetchRoomAndSectorInfo));
// // console.log(fetchedOrders)
//   const filteredData = fetchedOrders.filter(order => {
//     // console.log(order)
//     return (
//       (selectedTypeRoom ? order.loaiRoom === selectedTypeRoom : true) &&
//       (selectSector ? order.idSectorRoom === selectSector : true) &&
//       (searchPlace ? order?.nameRoom.toLowerCase().includes(searchPlace.toLowerCase()) : true)
//     );
//   });
//   // console.log(filteredData)
//   setFilterRoom(filteredData);
// };

// Gọi hàm lọc khi có sự thay đổi trong các tiêu chí lọc hoặc danh sách orders
useEffect(() => {
  filterOrders();
}, [selectedTypeRoom, selectSector, searchPlace, dataOrder]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const getOrderInfo = async () => {
    const res = await apiInfoUser({ phone: phoneUser });
    const result = res.data.order;
    return result;
  };

  useEffect(() => {
    const fetchInfoOrder = async () => {
      const data = await getOrderInfo();
      setDataOrder(data);
    };
    fetchInfoOrder();
  }, []);

  return (
    <div className="w-1100 ">
      <div className="font-semibold text-[25px] flex justify-center items-center">
        Thông tin các phòng đã đặt
      </div>
      <div>
        <div className="h-[70px] w-full rounded-md bg-slate-500 searchRooms flex justify-center items-center">
          <div className="flex items-center h-full">
            <Input
              prefix={<CiSearch className="ml-2" size={24} />}
              placeholder="Nhập nơi cần tìm ..."
              // onChange={handleChangePlace}
              onChange={(e)=>{console.log(e.target.value); setSearchPlace(e.target.value);}}
              className="flex items-center h-full"
            />
          </div>
          <Select
            className="round-md"
            placeholder="Loại phòng"
            style={{ width: 150 }}
            onChange={handleChangeSelectRoomType}
            options={[
              {
                label: "Loại Phòng",
                options: [
                  { label: "1-2 người", value: "1-2 người" },
                  { label: "3-4 người", value: "3-4 người" },
                  { label: "5-6 người", value: "5-6 người" },
                ],
              },
            ]}
          />
          <Select
            placeholder="Khu vực ..."
            style={{ width: 120 }}
            label="khu vực"
            onChange={handleChangeSelectSector}
          >
            {allSector?.map((sector) => (
              <Option key={sector._id} value={sector._id}>
                {sector.nameSector}
              </Option>
            ))}
          </Select>

          <button className="searchRoomsButton"
          onClick={()=>{
            window.location.reload();
          }}
          >Đặt lại</button>
        </div>
      </div>
      <div>
        <ListOrderRoom dataOrder={filterRoom}></ListOrderRoom>
      </div>
    </div>
  );
};

export default OrderRoom;
