import React, { useState } from "react";
import { Card, Button, Input, Pagination } from "antd";
import { CalendarOutlined, ReloadOutlined, PhoneOutlined } from "@ant-design/icons";

const RoomManagement = ({ data }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchText, setSearchText] = useState("");

  const roomsPerPage = 20; // 4 cột x 5 hàng
  const filteredRooms = data.paginatedRooms.filter((room) =>
    room.nameRoom.toLowerCase().includes(searchText.toLowerCase())
  );

  const paginatedRooms = filteredRooms.slice(
    (currentPage - 1) * roomsPerPage,
    currentPage * roomsPerPage
  );

  return (
    <div className="p-5">
      {/* Thanh tìm kiếm và phân trang */}
      <div className="flex justify-between items-center mb-5">
        <Input.Search
          placeholder="Tìm kiếm phòng..."
          enterButton
          allowClear
          onSearch={(value) => setSearchText(value)}
          style={{ width: "300px" }}
        />
        <Pagination
          current={currentPage}
          pageSize={roomsPerPage}
          total={filteredRooms.length}
          onChange={(page) => setCurrentPage(page)}
        />
      </div>

      {/* Hiển thị danh sách phòng dạng grid */}
      <div className="grid grid-cols-4 gap-4">
        {paginatedRooms.map((room) => (
          <Card
            key={room._id}
            title={room.nameRoom}
            extra={
              <span
                className={`${
                  room.ordersRoom.length ? "text-red-500" : "text-green-500"
                } font-bold`}
              >
                {room.ordersRoom.length ? "Đang có khách" : "Trống"}
              </span>
            }
            className="border border-gray-200 shadow-lg"
          >
            <p>{room.giaRoom.toLocaleString()} VND ({room.loaiRoom})</p>
            <p>Đơn tiếp theo: {room.ordersRoom[0]?.[0] || "Không có"}</p>
            <div className="flex justify-between mt-4">
              <Button
                icon={<CalendarOutlined />}
                onClick={() => alert("Check-in/Check-out")}
              >
                Check-in/out
              </Button>
              <Button
                icon={<PhoneOutlined />}
                onClick={() => alert("Gọi dịch vụ")}
              >
                DV
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => alert("Làm mới")}
              >
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RoomManagement;
