import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from "react";
import GoogleMapEmbed from '../components/GoogleMapEmbed';
import YouTubeEmbed from '../components/YouTubeEmbed';
import WeatherDisplay from '../components/WeatherDisplay';
import icons from "../utils/icons";
import { path } from '../utils/constant';
import { apiGetAllSector, apiGetAllRoom, apiGetWeather } from "../services";
import { Form, Input, Select, DatePicker, Button, message, Spin } from 'antd';
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);
const dateFormat = "DD/MM/YYYY";

const { Option } = Select;
const { RangePicker } = DatePicker;
const { CiSearch } = icons;

const Home = () => {

    const [disabledDateData, setDisabledDateData] = useState([]);

    const [allSector, setAllSector] = useState();
    const [weatherData, setWeatherData] = useState(null);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

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

    const fetchAllSector = async () => {
        const response = await apiGetAllSector();
        setAllSector(response.data.sectors);
    };

    const fetchWeatherData = async () => {
        try {
            const response = await apiGetWeather();
            setWeatherData(response.data[0]);
        } catch (error) {
            console.error("Error fetching weather data:", error);
        }
    };

    useEffect(() => {
        fetchAllSector();
        fetchWeatherData();
    }, []);

    const onFinish = (values) => {
        setLoading(true);
        try {
            const searchQuery = {
                searchPlace: values.searchPlace,
                dateRange: values.dateRange?.map(date => date.toISOString()),
                roomType: values.roomType,
                sector: values.sector,
            };            

            // Redirect to the room page with search parameters
            navigate(`/${path.ROOMS}`, {
                state: searchQuery, // Pass the search query as state or URL parameters
            });
        } catch (error) {
            message.error("There was an error processing your search.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full">
            <header className="relative py-4 flex flex-col items-center">

                <div
                    className="relative w-full max-w-screen-xl min-h-[500px] header__image__container bg-cover bg-center bg-no-repeat rounded-3xl"
                >
                    {/* Text section */}
                    <div className="max-w-4xl p-8 md:p-20">
                        <h1 className="text-6xl font-semibold mb-4 text-white">Chào mừng bạn đến Homestay</h1>
                        <h1 className="text-xl text-gray-200">Tận hưởng kỳ nghỉ của bạn</h1>
                        <p className="text-xl text-gray-200">
                            Đặt phòng với mức giá thấp nhất.
                        </p>
                    </div>

                    {/* Search Form */}
                    <div className="absolute bottom-[-4rem] left-1/2 transform -translate-x-1/2 w-[calc(100%-3rem)] md:w-[calc(100%-4rem)] flex items-center gap-4 px-6 md:px-8 py-4 rounded-2xl bg-white bg-opacity-70 backdrop-blur-md shadow-lg">
                        <Form
                            layout="vertical"
                            className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-7 gap-0 md:gap-4 w-full"
                            onFinish={onFinish}
                        >

                            <Form.Item name="searchPlace" label="Địa điểm" className="col-span-1 md:col-span-3 lg:col-span-2">
                                <Input
                                    prefix={<CiSearch className="ml-2" size={24} />}
                                    placeholder="Nhập nơi cần tìm ..."
                                    className="w-full h-[40px] px-4 rounded-md focus:outline-none"
                                />
                            </Form.Item>


                            <Form.Item name="dateRange" label="Thời gian" className="col-span-1 md:col-span-3 lg:col-span-2">
                                <RangePicker
                                    className="w-full h-[40px] px-4 rounded-md focus:outline-none"
                                    placeholder={["Ngày đi", "Ngày về"]}
                                    format={dateFormat}
                                    disabledDate={disabledDate}
                                />
                            </Form.Item>


                            <Form.Item name="roomType" label="Loại phòng" className="col-span-1 md:col-span-3 lg:col-span-1">
                                <Select
                                    className="w-full h-[40px] rounded-md"
                                    placeholder="Loại phòng"
                                >
                                    <Option value="1-2 người">1-2 người</Option>
                                    <Option value="3-4 người">3-4 người</Option>
                                    <Option value="5-6 người">5-6 người</Option>
                                </Select>
                            </Form.Item>

                            <Form.Item name="sector" label="Khu vực" className="col-span-1 md:col-span-3 lg:col-span-1">
                                <Select
                                    placeholder="Khu vực ..."
                                    className="w-full h-[40px] rounded-md"
                                >
                                    {allSector?.map((sector) => (
                                        <Option key={sector._id} value={sector._id}>
                                            {sector.nameSector}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            <Form.Item className="col-span-1 md:col-span-3 lg:col-span-1 lg:mt-8">
                                <Button type="primary" htmlType="submit" className="p-4 bg-blue-600 hover:bg-blue-700 rounded-full transition-shadow shadow-md hover:shadow-lg">
                                    <CiSearch className='text-white' size={24} />

                                    {loading ? <Spin /> : "Tìm kiếm"}
                                </Button>
                            </Form.Item>
                        </Form>
                    </div>
                </div>
            </header>

            <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-8 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className='lg:col-span-2'>
                    <p className="text-lg mb-4 text-gray-700 leading-relaxed">
                        Homestay Hòn Sơn tọa lạc tại đảo Hòn Sơn, một điểm đến hoang sơ và đầy thơ mộng thuộc tỉnh Kiên Giang, nằm giữa Rạch Giá và quần đảo Nam Du. Đây là nơi lý tưởng cho những du khách yêu thích khám phá vẻ đẹp tự nhiên, trải nghiệm cuộc sống bình dị của người dân làng chài và hòa mình vào thiên nhiên hoang dã.
                    </p>
                    <p className=" text-lg text-gray-700 leading-relaxed">
                        Với những bãi biển xanh trong, dãy núi hùng vĩ, và các con đường mòn quanh co dẫn vào rừng nhiệt đới, Homestay Hòn Sơn mang đến cơ hội tuyệt vời để khám phá các bãi tắm hoang sơ, ngắm bình minh trên biển và thưởng thức hải sản tươi ngon ngay tại các làng chài địa phương. Đặc biệt, homestay gần các điểm tham quan như Bãi Bàng, Bãi Nhà, và Đỉnh Ma Thiên Lãnh, nơi du khách có thể chinh phục đỉnh núi và tận hưởng khung cảnh tuyệt đẹp từ trên cao.
                    </p>
                </div>
                <div className="col-span-1">
                    <WeatherDisplay weatherData={weatherData} />
                </div>
            </div>

            <div>
                <YouTubeEmbed videoId="-QoxLPKfCGg" />
            </div>

            <div className='mt-4'>
                <GoogleMapEmbed />
            </div>

        </div>
    );
};

export default Home;
