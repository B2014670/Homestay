import React, { useState, useEffect } from "react";
import { Image } from "antd";
import { Rate } from "antd";
import { path } from "../ultils/constant";
import { useNavigate } from "react-router-dom";
import { apiInfoSector } from "../services";
require("./component.css");

const RoomItem = (props) => {
  const navigate = useNavigate();
  var {
    _id,
    nameRoom,
    imgRoom,
    danhgiaRoom,
    loaiRoom,
    idSectorRoom,
    discRoom,
    orderRoom,
    giaRoom,
    cmtRoom,
  } = props.room;
  const detailData = props.room;
  const [imgBig, setImgBig] = useState(imgRoom[0].secure_url);
  const [rate, setRate] = useState(4.5); //test
  // console.log(imgRoom)
  const [infoSector, setInfoSector] = useState();

  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
  const handleClickPreview0 = () => {
    setImgBig(imgRoom[0].secure_url);
  };
  const handleClickPreview1 = () => {
    setImgBig(imgRoom[1].secure_url);
  };
  const handleClickPreview2 = () => {
    setImgBig(imgRoom[2].secure_url);
  };

  const danhgia = () => {
    let result = "";
    if (danhgiaRoom <= 5) {
      result = "Quá Xuất Sắc !";
      // setRate('Quá Xuất Sắc !')
    }
    if (danhgiaRoom <= 4.5) {
      result = "Xuất Sắc !";
      // setRate('Xuất Sắc !')
    }
    if (danhgiaRoom <= 4) {
      result = "Quá Tuyệt Vời !";
      // setRate('Quá Tuyệt Vời !')
    }
    if (danhgiaRoom <= 3.5) {
      result = "Tuyệt Vời !";
      // setRate('Tuyệt Vời !')
    }
    if (danhgiaRoom <= 3) {
      result = "Tạm Ổn";
      // setRate('Tạm Ổn')
    }
    if (danhgiaRoom <= 2.5) {
      result = "Bình Thường !";
      // setRate('Bình Thường')
    }
    if (danhgiaRoom <= 2) {
      result = "Nên Suy Nghĩ Lại";
      // setRate('Nên Suy Nghĩ Lại')
    }
    setRate(result);
  };
  const fetchInfoSector = async (idSectorRoom) => {
    try {
      const data = await apiInfoSector({ idSector: idSectorRoom });
      const sectorData = data.data;
      // console.log(sectorData)
      setInfoSector(sectorData);
    } catch (error) {
      console.error("Error fetching sector data:", error);
    }
  };
  useEffect(() => {
    danhgia(danhgiaRoom);
    fetchInfoSector(idSectorRoom);
  }, []);

  const handleNavigationDetailRoom = () => {
    if (typeof detailData !== "undefined") {
      navigate(`/${path.DETAILROOM}`, { state: { detailData } });
    } else {
      // Xử lý trường hợp khi detailData không tồn tại
      console.log("Biến detailData không tồn tại.");
    }
  };

  return (
    <div
      className="mt-1 flex w-full h-[170px] roomItem "
      onClick={handleNavigationDetailRoom}
    >
      <div className="items-center w-[24%] mr-3">
        <div className=" flex justify-center items-center ">
          <Image className="rounded-md" width={200} height={100} src={imgBig} />
        </div>
        <div className="flex gap-2 justify-center mt-1 ">
          <div>
            <Image
              className="rounded-sm"
              width={60}
              height={50}
              src={imgRoom[0].secure_url}
              onClick={handleClickPreview0}
              preview={false}
            />
          </div>
          <div>
            <Image
              className="rounded-sm"
              width={60}
              height={50}
              src={imgRoom[1].secure_url}
              preview={false}
              onClick={handleClickPreview1}
            />
          </div>
          <div>
            <Image
              className="rounded-sm"
              width={60}
              height={50}
              src={imgRoom[2].secure_url}
              onClick={handleClickPreview2}
              preview={false}
            />
          </div>
        </div>
      </div>
      <div className="w-[50%]">
        <div className="roomName">
          {nameRoom && capitalizeFirstLetter(nameRoom)}
        </div>

        <div>
          <Rate
            allowHalf
            disabled
            defaultValue={danhgiaRoom}
            // defaultValue={danhgiaRoom}
          />
        </div>
        <div className="">
          <div className="t-sm">Loại phòng : {loaiRoom}</div>
          <div className="t-sm flex">
            Khu Vực :{" "}
            <div className="text-md ml-2">
              {infoSector && capitalizeFirstLetter(infoSector.nameSector)}
            </div>
          </div>
          <div className="t-sm">
            Mô tả :
            <div>
              {discRoom.length > 150
                ? `${discRoom.substring(0, 150)}...`
                : discRoom}
            </div>
          </div>
        </div>
      </div>
      <div className="giaRoomContainer w-[26%] mr-5">
        <div className="totalComment">
          <div className="w-[120px]">
            <div className="text-sm">{rate}</div>
            <div className="text-sm">{cmtRoom.length} Nhận Xét</div>
          </div>
          {/* <div className="totalImg">{danhgiaRoom}</div> */}
        </div>
        <div className="giaRoom  mt-16">{giaRoom.toLocaleString()} vnđ</div>
      </div>
    </div>
  );
};

export default RoomItem;
