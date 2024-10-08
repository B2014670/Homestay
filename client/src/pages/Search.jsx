import React, { useState } from 'react';
import { FaWifi, FaCar, FaShower, FaCoffee, FaTv, FaSearch, FaCalendarAlt, FaUser, FaBed } from 'react-icons/fa';

const amenities = [
  { icon: <FaWifi className="text-gray-600" />, text: 'Wifi Miễn Phí' },
  { icon: <FaCar className="text-gray-600" />, text: 'Miễn phí đậu/đỗ xe' },
  { icon: <FaShower className="text-gray-600" />, text: 'Dụng cụ vệ sinh cá nhân' },
  { icon: <FaCoffee className="text-gray-600" />, text: 'Dụng cụ pha trà/cà phê' },
  { icon: <FaTv className="text-gray-600" />, text: 'TV' },
];

const priceData = [
  { date: '17 Th09', price: 1300000 },
  { date: '18 Th09', price: 1300000 },
  { date: '19 Th09', price: 1300000 },
  { date: '20 Th09', price: 1400000 },
  { date: '21 Th09', price: 1400000 },
  { date: '22 Th09', price: 1300000 },
  { date: '23 Th09', price: 1300000 },
];

const HotelBooking = () => {
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [rooms, setRooms] = useState(1);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <img src="/placeholder.svg?height=40&width=40" alt="Ninh Kieu Logo" className="mr-2 h-10 w-10" />
            <span className="text-lg font-bold">Ninh Kieu Riverside Hotel - 010720</span>
          </div>
          <nav>
            <ul className="flex space-x-4">
              <li><a href="#" className="text-blue-600 hover:text-blue-800">Phòng</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-800">Ưu đãi đặc biệt</a></li>
              <li><a href="#" className="text-gray-600 hover:text-gray-800">Voucher</a></li>
            </ul>
          </nav>
          <select className="border rounded px-2 py-1">
            <option value="vi">🇻🇳 Tiếng Việt</option>
            <option value="en">🇬🇧 English</option>
          </select>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">ngày đặt phòng</label>
              <div className="relative">
                <input type="date" className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <FaCalendarAlt className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Người lớn</label>
              <div className="flex items-center">
                <button onClick={() => setAdults(Math.max(1, adults - 1))} className="border rounded-l px-2 py-1 bg-gray-100">-</button>
                <input type="number" value={adults} onChange={(e) => setAdults(Math.max(1, parseInt(e.target.value) || 1))} className="w-12 text-center border-t border-b px-2 py-1" />
                <button onClick={() => setAdults(adults + 1)} className="border rounded-r px-2 py-1 bg-gray-100">+</button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trẻ em</label>
              <div className="flex items-center">
                <button onClick={() => setChildren(Math.max(0, children - 1))} className="border rounded-l px-2 py-1 bg-gray-100">-</button>
                <input type="number" value={children} onChange={(e) => setChildren(Math.max(0, parseInt(e.target.value) || 0))} className="w-12 text-center border-t border-b px-2 py-1" />
                <button onClick={() => setChildren(children + 1)} className="border rounded-r px-2 py-1 bg-gray-100">+</button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phòng</label>
              <div className="flex items-center">
                <button onClick={() => setRooms(Math.max(1, rooms - 1))} className="border rounded-l px-2 py-1 bg-gray-100">-</button>
                <input type="number" value={rooms} onChange={(e) => setRooms(Math.max(1, parseInt(e.target.value) || 1))} className="w-12 text-center border-t border-b px-2 py-1" />
                <button onClick={() => setRooms(rooms + 1)} className="border rounded-r px-2 py-1 bg-gray-100">+</button>
              </div>
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition duration-300">
              <FaSearch className="inline mr-2" />
              Tìm kiếm
            </button>
          </div>
        </div>

        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative mb-8" role="alert">
          <span className="block sm:inline">tin nhắn mặc định Không còn phòng</span>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="md:flex">
            <div className="md:flex-shrink-0">
              <img className="h-48 w-full object-cover md:w-48" src="/placeholder.svg?height=300&width=400" alt="Room" />
            </div>
            <div className="p-8">
              <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">PHÒNG EXECUTIVE SUPERIOR CITY VIEW TWIN</div>
              <p className="mt-2 text-gray-500">Superior River View Twin Room will meet all the needs of enjoying life in a riverside city with a panoramic view of Can Tho city full of network leaders, with Ninh Kieu wharf and busy streets...</p>
              <div className="mt-4">
                <span className="text-2xl font-bold text-gray-900">₫1.300.000</span>
                <span className="text-gray-600"> / đêm</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {amenities.map((amenity, index) => (
                  <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {amenity.icon}
                    <span className="ml-1">{amenity.text}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="px-8 py-4 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900">GIÁ CƠ SỞ CHO 2 NGƯỜI LỚN</h3>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {priceData.map((item, index) => (
                      <th key={index} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {item.date}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    {priceData.map((item, index) => (
                      <td key={index} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ₫{item.price.toLocaleString()}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-sm text-gray-500">PHÒNG CÓ ĂN SÁNG</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HotelBooking;