import React, { useState, useEffect } from "react";
import icons from "../../ultils/icons";
import moment from "moment";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { DatePicker, Select, Slider, Input } from "antd";
import { useLocation } from "react-router-dom";
import { ListRooms, RoomItem } from "../../components";
import { apiGetAllSector, apiGetAllRoom } from "../../services";

dayjs.extend(customParseFormat);

const { RangePicker } = DatePicker;

const dateFormat = "DD/MM/YYYY";

require("../containers.css");
const { Option } = Select;
const { CiSearch } = icons;

const Rooms = () => {
  const location = useLocation();
  
  const [rollSliderStart, setRollSliderStart] = useState(100000);
  const [rollSliderEnd, setRollSliderEnd] = useState(2000000);
  const [allSector, setAllSector] = useState();
 
  const { search } = location.state || {};
  const [searchPlace, setSearchPlace] = useState(search);
  const [selectedTypeRoom, setSelectedTypeRoom] = useState(null);
  const [selectSector, setSelectSector] = useState();
  const formatter = (value) => `${value.toLocaleString()} nvđ`;

  const [rooms, setRooms] = useState([]);
  const [filterRoom, setFilterRoom] = useState(rooms);
  const getdataRooms = async () => {
    const data = await apiGetAllRoom();
    setRooms(data.data);
  };
  useEffect(() => {
    getdataRooms();
  }, []);

  const normalize = (str) => {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  useEffect(() => {
    let filteredData = rooms;

    // if (searchPlace) {
    //   filteredData = filteredData.filter((item) =>
    //     item.nameRoom.toLowerCase().includes(searchPlace)
    //   );
    // }
    if (searchPlace) {
      const searchPlaceNormalized = normalize(searchPlace.toLowerCase());
      filteredData = filteredData.filter((item) =>
        normalize(item.nameRoom.toLowerCase()).includes(searchPlaceNormalized)
      );
    }
    if (rollSliderStart && rollSliderEnd) {
      filteredData = filteredData.filter(
        (item) =>
          item.giaRoom >= rollSliderStart && item.giaRoom < rollSliderEnd
      );
    }
    if (selectedTypeRoom) {
      filteredData = filteredData.filter(
        (item) => item.loaiRoom === selectedTypeRoom
      );
    }

    if (selectSector) {
      filteredData = filteredData.filter(
        (item) => item.idSectorRoom === selectSector
      );
    }
    setFilterRoom(filteredData);
  }, [
    searchPlace,
    selectedTypeRoom,
    selectSector,
    rooms,
    rollSliderStart,
    rollSliderEnd,
  ]);

  const handleChangeSelectRoomType = (value) => {
    setSelectedTypeRoom(value);
  };

  const handleChangePlace = (e) => {
    // console.log(e.target.value)
    setSearchPlace(e.target.value);
  };

  const handleChangeSelectSector = (value) => {
    setSelectSector(value);
  };

  // Hàm xử lý khi người dùng nhấn tìm kiếm
  const handleReset = () => {
    // Bạn có thể thực hiện hành động tìm kiếm ở đây, ví dụ hiển thị kết quả lọc
    setFilterRoom(rooms)
    // window.location.reload();
  };

  


  const handleOnChangeSlider = (value) => {
    setRollSliderStart(value[0]);
    setRollSliderEnd(value[1]);
  
  };

  useEffect(() => {
    const fetchAllSector = async () => {
      const response = await apiGetAllSector();
      //   console.log(response.data);
      setAllSector(response.data.sectors);
    };
    fetchAllSector();
    // console.log(allSector);
  }, []);

  return (
    <div className="w-1100 ml-10 ">
      <div className="h-[70px] w-full rounded-md bg-slate-500 searchRooms flex justify-center items-center">
        <div className="flex items-center h-full">
          <Input
            prefix={<CiSearch className="ml-2" size={24} />}
            placeholder="Nhập nơi cần tìm ..."
            onChange={handleChangePlace}
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

        <button className="searchRoomsButton" onClick={handleReset}>
          Đặt lại
        </button>
      </div>
      <div className="column-2 flex">
        <div className="w-[200px] h-[500px]  ">
          <div className="filterUnder p-3   m-1">
            <div> Giá mỗi đêm</div>
            <div>
              <Slider
                className="w-[160px mt-7"
                min={100000}
                max={10000000}
                step={10000}
                range
                defaultValue={[rollSliderStart, rollSliderEnd]}
                onChange={handleOnChangeSlider}
                tooltip={{
                  formatter,
                }}
              />
            </div>
            <div className="flex w-full gap-2 rollSliderContent">
              <div className="w-[50%] justify-start  flex">Từ :</div>
              <div className="  justify-center items-center flex">Đến :</div>
            </div>
            {/* <div className="flex w-full gap-2 rollSliderContent">
              <div className=" justify-center items-center flex">
                {rollSliderStart.toLocaleString()} vnđ
              </div>
              <div className="  justify-center items-center flex">
                {rollSliderEnd.toLocaleString()} vnđ
              </div>
            </div> */}
            <div className="flex w-full gap-2 rollSliderContent">
              <div className="justify-center items-center flex">
                <input
                  type="text"
                  value={rollSliderStart.toLocaleString()}
                  onChange={(e) =>
                    setRollSliderStart(Number(e.target.value.replace(/,/g, "")))
                  }
                  className="input-class-name w-[60px] rounded-md mr-1 pl-1" // Thêm class CSS của bạn ở đây
                />{" "}
               
              </div>
              <div className="justify-center items-center flex">
                <input
                  type="text"
                  value={rollSliderEnd.toLocaleString()}
                  onChange={(e) =>
                    setRollSliderEnd(Number(e.target.value.replace(/,/g, "")))
                  }
                  className="input-class-name w-[70px] rounded-md mr-1 pl-1" // Thêm class CSS của bạn ở đây
                />{" "}
                vnđ
              </div>
            </div>
            {/* <div className="mt-1 mb-1">
              <button
                className="w-full flex justify-center bg-blue-500 border rounded-lg"
                onClick={handleSubmitSearch}
              >
                Tìm
              </button>
            </div> */}
          </div>
        </div>
        <div className="w-full">
          <div>
            <ListRooms rooms={filterRoom} />
          </div>
        </div>

        <div></div>
      </div>
    </div>
  );
};

export default Rooms;
