import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { useLocation, useNavigate } from "react-router-dom";
import { apiGetAllSector, apiGetAllRoom, apiSearchRoom } from "../services";
import '../layouts/containers.css'
import { FaStar } from 'react-icons/fa';
import { Pagination, Input, Select, Slider, DatePicker } from 'antd';
import icons from "../ultils/icons";

dayjs.extend(customParseFormat);
const dateFormat = "DD/MM/YYYY";

const { RangePicker } = DatePicker;
const { Option } = Select;
const { CiSearch, AiOutlineReload } = icons;

const Rooms = () => {

  const navigate = useNavigate();
  const location = useLocation();

  // Initial states for search filters
  const [rollSliderStart, setRollSliderStart] = useState(100000);
  const [rollSliderEnd, setRollSliderEnd] = useState(10000000);
  const [allSector, setAllSector] = useState([]);
  const searchQuery = location.state || {};
  const initialDateRange = location.state?.dateRange
    ? [dayjs(location.state.dateRange[0]), dayjs(location.state.dateRange[1])]
    : [];
  const [disabledDateData, setDisabledDateData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRooms, setTotalRooms] = useState(0);


  // Search-related states with default values from location
  const [searchPlace, setSearchPlace] = useState(searchQuery.searchPlace || '');
  const [selectedDateRange, setSelectedDateRange] = useState(initialDateRange);
  const [selectedTypeRoom, setSelectedTypeRoom] = useState(searchQuery.roomType || '');
  const [selectSector, setSelectSector] = useState(searchQuery.sector || '');

  // Data and filtering states
  const [rooms, setRooms] = useState([]);
  const [filterRoom, setFilterRoom] = useState(rooms);

  // Formatter function for currency
  const formatter = (value) => `${value.toLocaleString()} vnđ`;

  // Date disabling logic
  const disabledDate = (current) => {
    const formattedDisabledDays = disabledDateData.map((day) =>
      dayjs(day, "DD/MM/YYYY")
    );
    // hoặc ngày hiện tại có phải là ngày trong quá khứ không
    return (
      current < dayjs().startOf("day") ||
      formattedDisabledDays.some((disabledDay) =>
        current.isSame(disabledDay, "day")
      )
    );
  };

  const getdataRooms = async (page = 1) => {
    const formattedDateRange = selectedDateRange?.map(date => date.toISOString());

    const searchParams = {
      place: searchPlace,
      dateRange: formattedDateRange.join(","),
      roomType: selectedTypeRoom,
      sector: selectSector,
      page: page,
      limit: pageSize,
    };
    const response = await apiSearchRoom(searchParams);

    // const data = await apiGetAllRoom();
    setRooms(response.data.paginatedRooms);
    setTotalRooms(response.data.totalRooms);
  };

  const fetchAllSector = async () => {
    const response = await apiGetAllSector();
    setAllSector(response.data.sectors);
  };

  // const fetchAllTypeRoom = async () => {
  //   const response = await apiGetAllTypeRoom();
  //   setAllTypeRoom(response.data.types);
  // };

  useEffect(() => {
    getdataRooms(currentPage);
  }, [currentPage]);

  useEffect(() => {
    fetchAllSector();
    // fetchAllTypeRoom();
  }, []);

  // Filtering the rooms based on the selected filters
  useEffect(() => {
    let filteredData = rooms;

    if (rollSliderStart && rollSliderEnd) {
      filteredData = filteredData.filter(
        (item) =>
          item.giaRoom >= rollSliderStart && item.giaRoom < rollSliderEnd
      );
    }

    setFilterRoom(filteredData);
  }, [rooms, rollSliderStart, rollSliderEnd]);

  const handleChangeSelectRoomType = (value) => {
    setSelectedTypeRoom(value);
  };

  const handleChangePlace = (e) => {
    setSearchPlace(e.target.value);
  };

  const handleDateChange = (dates) => {
    setSelectedDateRange(dates);
  };

  const handleChangeSelectSector = (value) => {
    setSelectSector(value);
  };

  const handleReset = () => {
    setSearchPlace('');
    setSelectedDateRange([]);
    setSelectedTypeRoom('');
    setSelectSector('');
    setFilterRoom(rooms);
    setRollSliderStart(100000);
    setRollSliderEnd(10000000);
    navigate(window.location.pathname, { state: {} });
  };

  const handleOnChangeSlider = (value) => {
    setRollSliderStart(value[0]);
    setRollSliderEnd(value[1]);
  };

  const handleSearch = async () => {
    getdataRooms();
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    getdataRooms(page);
  };

  return (
    <div className="container mx-auto lg:px-20 md:px-2 px-1 sm:px-6 py-8">

      <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-7 gap-4 p-4 mb-4 bg-slate-500 rounded-md w-full h-auto items-center">
        {/* Search Input */}
        <div className="col-span-1 md:col-span-3 lg:col-span-2">
          <label className="text-white mb-1" htmlFor="searchPlace">
            Tên phòng
          </label>
          <Input
            prefix={<CiSearch className="ml-2" size={24} />}
            placeholder="Nhập nơi cần tìm ..."
            value={searchPlace}
            onChange={handleChangePlace}
            className="w-full h-[40px] px-4 py-2 rounded-md focus:outline-none"
          />
        </div>

        {/* Date Range Picker */}
        <div className="col-span-1 md:col-span-3 lg:col-span-2">
          <label className="text-white mb-1" htmlFor="searchPlace">
            Thời gian
          </label>
          <RangePicker
            className="w-full h-[40px] px-4 py-2 rounded-md focus:outline-none"
            placeholder={["Ngày đi", "Ngày về"]}
            format={dateFormat}
            disabledDate={disabledDate}
            onChange={handleDateChange}
            value={selectedDateRange}
          />
        </div>

        {/* Room Type Selector */}
        <div className="col-span-1 md:col-span-2 lg:col-span-1">
          <label className="text-white mb-1" htmlFor="searchPlace">
            Loại phòng
          </label>
          <Select
            className="w-full h-[40px] rounded-md"
            placeholder="Loại phòng"
            value={selectedTypeRoom}
            onChange={handleChangeSelectRoomType}
            options={[
              { label: "1-2 người", value: "1-2 người" },
              { label: "3-4 người", value: "3-4 người" },
              { label: "5-6 người", value: "5-6 người" },
            ]}
          />
        </div>

        {/* Sector Selector */}
        <div className="col-span-1 md:col-span-2 lg:col-span-1">
          <label className="text-white mb-1" htmlFor="searchPlace">
            Khu vực
          </label>
          <Select
            placeholder="Khu vực ..."
            value={selectSector}
            onChange={handleChangeSelectSector}
            className="w-full h-[40px] rounded-md"
          >
            {allSector?.map((sector) => (
              <Option key={sector._id} value={sector._id}>
                {sector.nameSector}
              </Option>
            ))}
          </Select>
        </div>

        {/* Reset Button */}
        <div className="col-span-1 md:col-span-2 lg:col-span-1 mt-2">
          <label className="block text-white mb-1">
            Thao tác
          </label>
          <div className="grid grid-cols-2 gap-2">
            {/* Search Button */}
            <button
              className="flex items-center justify-center w-full h-[40px] rounded-md bg-blue-600 hover:bg-blue-700 text-white transition-shadow"
              onClick={handleSearch}
            >
              <CiSearch size={26} />
              <span className="ml-1">Tìm</span>
            </button>

            {/* Reset Button */}
            <button
              className="flex items-center justify-center w-full h-[40px] mb-2 rounded-md bg-[#17e9e0] hover:bg-[#0ec4b7] transition-all"
              onClick={handleReset}
            >
              <AiOutlineReload size={20} />
              <span className="ml-1">Đặt lại</span>
            </button>

          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Filters */}
        <div className="w-full md:w-1/4">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg p-4">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Lọc theo:</h2>
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Giá (mỗi đêm)</h3>
              <Slider
                className="w-[160px mt-7"
                min={100000}
                max={20000000}
                step={10000}
                range
                value={[rollSliderStart, rollSliderEnd]}
                onChange={handleOnChangeSlider}
                tooltip={{
                  formatter,
                }}
              />

              <div className="flex w-full gap-2 rollSliderContent">
                <div className="w-[50%] justify-start flex">Từ :</div>
                <div className="justify-center items-center flex">Đến :</div>
              </div>
              <div className="flex justify-between w-full gap-2 rollSliderContent">
                <div className="justify-center items-center flex">
                  <input
                    type="text"
                    value={rollSliderStart.toLocaleString()}
                    onChange={(e) =>
                      setRollSliderStart(Number(e.target.value.replace(/,/g, "")))
                    }
                    className="input-class-name w-[70px] rounded-md mr-1 pl-1"
                  />vnđ
                </div>
                <div className="justify-center items-center flex">
                  <input
                    type="text"
                    value={rollSliderEnd.toLocaleString()}
                    onChange={(e) =>
                      setRollSliderEnd(Number(e.target.value.replace(/,/g, "")))
                    }
                    className="input-class-name w-[70px] rounded-md mr-1 pl-1"
                  />vnđ
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Room List */}
        <div className="w-full md:w-3/4">

          <div className="space-y-4">
            {filterRoom.map(room => (
              <div key={room._id} className="bg-white overflow-hidden shadow rounded-lg flex">
                <div className="md:w-1/3 w-full">
                  <img className="h-full w-full object-cover" src={room.imgRoom[0].secure_url} alt={room.name} />
                </div>
                <div className="md:w-2/3 w-full flex flex-col justify-between">
                  <div className="mx-4">
                    <h3 className="text-lg font-medium text-gray-900">{room.nameRoom}</h3>
                    <p className="mt-1 text-sm text-gray-500">{room.sectorDetails.nameSector}</p>
                    <p className="mt-1 text-sm text-gray-500">{room.loaiRoom}</p>
                    <div className="mt-2 flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <FaStar
                          key={i}
                          className={`h-5 w-5 ${i < Math.floor(room.danhgiaRoom) ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                        />
                      ))}
                      <span className="ml-2 text-sm text-gray-500">{room.cmtRoom.length} nhận xét</span>
                    </div>
                  </div>
                  <div className="mx-4 flex items-center justify-between">
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">giá chỉ từ</p>
                      <p className="text-2xl font-bold text-orange-700 font-sans">₫{room.giaRoom.toLocaleString()}</p>
                      <p className="text-sm text-gray-500">cho 1 đêm</p>
                    </div>
                    <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                      Xem
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination filterRoom.length */}
          {1 > 0 ?
            <>
              {/* <div className="mt-6">
                <nav className="flex items-center justify-between border-t border-gray-200 px-4 sm:px-0">
                  <div className="-mt-px w-0 flex-1 flex">
                    <a
                      href="#"
                      className="border-t-2 border-transparent pt-4 pr-1 inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    >
                      Trang trước
                    </a>
                  </div>
                  <div className="hidden md:-mt-px md:flex">
                    {[1, 2, 3].map(page => (
                      <a
                        key={page}
                        href="#"
                        className={`border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 border-t-2 pt-4 px-4 inline-flex items-center text-sm font-medium ${page === 1 ? 'border-blue-500 text-blue-600' : ''
                          }`}
                      >
                        {page}
                      </a>
                    ))}
                  </div>
                  <div className="-mt-px w-0 flex-1 flex justify-end">
                    <a
                      href="#"
                      className="border-t-2 border-transparent pt-4 pl-1 inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    >
                      Trang sau
                    </a>
                  </div>
                </nav>
              </div> */}
              {/* Pagination */}
              <div className="pagination flex justify-center mt-6">
                <Pagination
                  current={currentPage}
                  pageSize={pageSize}
                  total={totalRooms} // total number of rooms
                  onChange={handlePageChange} // handle page change
                  showSizeChanger={false} // Disable page size changer if not needed
                  className="pagination" // Optionally add custom Tailwind classes for styling
                />
              </div>
            </> : <></>
          }
        </div>
      </div>
    </div>
  );
};

export default Rooms;