import { Link } from 'react-router-dom';
import { useState, useEffect } from "react";
import useAuthStore from '../stores/authStore'
import GoogleMapEmbed from '../components/GoogleMapEmbed';
import YouTubeEmbed from '../components/YouTubeEmbed';
import icons from "../ultils/icons";
import { apiGetAllSector, apiGetAllRoom } from "../services";
import { Form, Input, Select, DatePicker, Button } from 'antd';
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

const { Option } = Select;
const { RangePicker } = DatePicker;
const dateFormat = "DD/MM/YYYY";

const { CiSearch } = icons;

const Home = () => {

    const [disabledDateData, setDisabledDateData] = useState([]);
    const [searchPlace, setSearchPlace] = useState(null);
    const [selectedTypeRoom, setSelectedTypeRoom] = useState(null);
    const [selectSector, setSelectSector] = useState();
    const [allSector, setAllSector] = useState();

    const fetchAllSector = async () => {
        const response = await apiGetAllSector();
        setAllSector(response.data.sectors);
    };

    useEffect(() => {
        fetchAllSector();
    }, []);

    const onFinish = (values) => {
        console.log('Form values:', values);
        // Handle form submission logic here
    };

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

    const handleChangeSelectRoomType = (value) => {
        setSelectedTypeRoom(value);
    };

    const handleChangePlace = (e) => {
        setSearchPlace(e.target.value);
    };

    const handleChangeSelectSector = (value) => {
        setSelectSector(value);
    };

    return (
        <div className="w-full">
            <header className="relative py-4 flex flex-col items-center">
                <div
                    className="relative w-full max-w-screen-xl min-h-[500px] header__image__container bg-cover bg-center bg-no-repeat rounded-3xl"
                >
                    {/* Text section */}
                    <div className="max-w-4xl p-8 md:p-20">
                        <h1 className="text-6xl font-semibold mb-4 text-white">Chào mừng bạn đến Homestay7d</h1>
                        <h1 className="text-xl text-gray-200">Tận hưởng kỳ nghỉ của bạn</h1>
                        <p className="text-xl text-gray-200">
                            Đặt phòng với mức giá thấp nhất.
                        </p>
                    </div>

                    {/* Search Form */}
                    <div className="absolute bottom-[-4rem] left-1/2 transform -translate-x-1/2 w-[calc(100%-3rem)] md:w-[calc(100%-6rem)] flex items-center gap-4 p-6 md:p-8 rounded-2xl bg-white bg-opacity-70 backdrop-blur-md shadow-lg">
                        <form className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
                            <div className="relative">
                                <Input
                                    prefix={<CiSearch className="ml-2" size={24} />}
                                    placeholder="Nhập nơi cần tìm ..."
                                    value={searchPlace}
                                    onChange={handleChangePlace}
                                    className="w-full h-[40px] px-4 py-2 rounded-md focus:outline-none"
                                />
                                <label className="absolute left-0 transform -translate-y-6 text-gray-600 text-sm">
                                    Địa điểm
                                </label>
                            </div>

                            <div className="relative">
                                <RangePicker
                                    className="w-full h-[40px] px-4 py-2 rounded-md focus:outline-none"
                                    placeholder={["Ngày đi", "Ngày về"]}
                                    format={dateFormat}
                                    disabledDate={disabledDate}
                                // onChange={handleDateChange}
                                />
                                <label className="absolute left-0 transform -translate-y-6 text-gray-600 text-sm">
                                    Thời gian
                                </label>
                            </div>

                            <div className="relative">
                                <Select
                                    className="w-full h-[40px] rounded-md"
                                    placeholder="Loại phòng"
                                    value={selectedTypeRoom}
                                    onChange={handleChangeSelectRoomType}
                                    options={[
                                        {
                                            options: [
                                                { label: "1-2 người", value: "1-2 người" },
                                                { label: "3-4 người", value: "3-4 người" },
                                                { label: "5-6 người", value: "5-6 người" },
                                            ],
                                        },
                                    ]}
                                />
                                <label className="absolute left-0 transform -translate-y-6 text-gray-600 text-sm">
                                    Loại phòng
                                </label>
                            </div>

                            <div className="relative">
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
                                <label className="absolute left-0 top-0 transform -translate-y-6 text-sm pointer-events-none transition-all duration-300">
                                    Khu vực
                                </label>
                            </div>
                        </form>

                        <button className="p-4 bg-blue-600 hover:bg-blue-700 rounded-full transition-shadow shadow-md hover:shadow-lg">
                            <CiSearch className='text-white' size={24} />
                        </button>
                    </div>
                </div>
            </header>
            <div className='mt-16'>
                <YouTubeEmbed videoId="ZdM2zp7ZcnI" />
            </div>
            <div className='mt-4'>
                <GoogleMapEmbed />
            </div>
        </div>
    );
};

export default Home;
