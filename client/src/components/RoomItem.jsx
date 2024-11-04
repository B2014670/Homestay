import React, { useState, useEffect } from "react";
import { Image, Rate } from "antd";
import { path } from "../utils/constant";
import { useNavigate } from "react-router-dom";
import { apiInfoSector } from "../services";
import './component.css';

const RoomItem = (props) => {
  const navigate = useNavigate();
  const {
    _id,
    nameRoom,
    imgRoom,
    danhgiaRoom,
    loaiRoom,
    idSectorRoom,
    discRoom,
    giaRoom,
    cmtRoom,
  } = props.room;

  const detailData = props.room;
  const [imgBig, setImgBig] = useState(imgRoom[0]?.secure_url);
  const [rate, setRate] = useState(4.5); // Temporary rate for testing
  const [infoSector, setInfoSector] = useState();

  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const handleClickPreview = (index) => {
    setImgBig(imgRoom[index]?.secure_url);
  };

  const calculateRatingDescription = () => {
    if (danhgiaRoom <= 2) return "Nên Suy Nghĩ Lại";
    if (danhgiaRoom <= 2.5) return "Bình Thường !";
    if (danhgiaRoom <= 3) return "Tạm Ổn";
    if (danhgiaRoom <= 3.5) return "Tuyệt Vời !";
    if (danhgiaRoom <= 4) return "Quá Tuyệt Vời !";
    if (danhgiaRoom <= 4.5) return "Xuất Sắc !";
    return "Quá Xuất Sắc !";
  };

  const fetchInfoSector = async (idSectorRoom) => {
    try {
      const data = await apiInfoSector({ idSector: idSectorRoom });
      setInfoSector(data.data);
    } catch (error) {
      console.error("Error fetching sector data:", error);
    }
  };

  useEffect(() => {
    setRate(calculateRatingDescription());
    fetchInfoSector(idSectorRoom);
  }, [danhgiaRoom, idSectorRoom]);

  const handleNavigationDetailRoom = () => {
    if (detailData) {
      navigate(`/${path.DETAILROOM}`, { state: { detailData } });
    } else {
      console.log("Detail data is undefined.");
    }
  };

  return (
    <div className="mt-1 flex w-full h-[170px] roomItem" onClick={handleNavigationDetailRoom}>
      <div className="items-center w-[24%] mr-3">
        <div className="flex justify-center items-center">
          <Image className="rounded-md" width={200} height={100} src={imgBig} />
        </div>
        <div className="flex gap-2 justify-center mt-1">
          {imgRoom.map((img, index) => (
            <Image
              key={index}
              className="rounded-sm"
              width={60}
              height={50}
              src={img.secure_url}
              preview={false}
              onClick={() => handleClickPreview(index)}
            />
          ))}
        </div>
      </div>
      <div className="w-[50%]">
        <div className="roomName">
          {nameRoom && capitalizeFirstLetter(nameRoom)}
        </div>
        <div>
          <Rate allowHalf disabled defaultValue={danhgiaRoom} />
        </div>
        <div className="t-sm">
          <div>Loại phòng: {loaiRoom}</div>
          <div className="t-sm flex">
            Khu Vực: <span className="text-md ml-2">{infoSector && capitalizeFirstLetter(infoSector.nameSector)}</span>
          </div>
          <div className="t-sm">
            Mô tả: {discRoom.length > 150 ? `${discRoom.substring(0, 150)}...` : discRoom}
          </div>
        </div>
      </div>
      <div className="giaRoomContainer w-[26%] mr-5">
        <div className="totalComment">
          <div className="w-[120px]">
            <div className="text-sm">{rate}</div>
            <div className="text-sm">{cmtRoom.length} Nhận Xét</div>
          </div>
        </div>
        <div className="giaRoom mt-16">{giaRoom.toLocaleString()} vnđ</div>
      </div>
    </div>
  );
};

export default RoomItem;