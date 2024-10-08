import React, { useState } from "react";
import bg from "../../assets/bg.jpg";
import banner1 from "../../assets/banner1.jpg";
import banner2 from "../../assets/banner2.jpg";
import banner3 from "../../assets/banner3.jpg";
import bannerIntro from "../../assets/banner-intro.jpg";
import icons from "../../ultils/icons";

require("../containers.css");

const { FaHome, MdPeopleAlt, BsImage, MdOutlineCheckCircleOutline } = icons;

const images = [
  {
    url: banner1,
    className: "banner_active",
    defaultclass: "bannerImg1",
  },
  {
    url: banner2,
    className: "banner_active",
    defaultclass: "bannerImg2",
  },
  {
    url: banner3,
    className: "banner_active",
    defaultclass: "bannerImg3",
  },
];
const Image = ({ url, className, selected, onClick, defaultclass }) => {
  // Nếu tấm hình được chọn, thì class sẽ là class của props, ngược lại sẽ là class mặc định
  const imageClass = selected ? className : defaultclass;

  // Đây là style cho tấm hình, bao gồm kích thước và bo góc
  const style = {
    margin: 10,
    width: 200,
    height: 200,
  };

  return (
    <img
      src={url}
      style={style}
      alt=""
      className={`${imageClass} ${defaultclass} rounded-full`}
      onClick={onClick}
    />
  );
};

const TrangChu = () => {
  const [dataImgBanner, setdataImgBanner] = useState(bg);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const handleClick = (index) => {
    if (index === selectedIndex) {
      setSelectedIndex(-1);
    } else {
      setSelectedIndex(index);
      console.log(index);
    }
  };

  return (
    <div className="trangchu">
      <div className="tc-bg-banner ">
        <img src={`${dataImgBanner}`} alt="" />
      </div>
      <div className="banner">
        <div className="bannerImage">
          {images.map((image, index) => (
            <Image
              key={index}
              url={image.url}
              className={image.className}
              selected={index === selectedIndex}
              onClick={() => {
                setdataImgBanner(image.url);
                handleClick(index);
              }}
              defaultclass={image.defaultclass}
              setdataImgBanner={setdataImgBanner}
            />
          ))}
        </div>
        <div className="bannerTilte">
          <div className="bannerItem">ThueHomestay24h</div>
          <div className="bannerDisc font-semibold ">
            “Uy Tín - Chất Lượng - Tận Tâm”
          </div>
        </div>
      </div>
      <div className="banner-total ">
        <div className="flex justify-center items-center gap-2">
          <FaHome size={50} className="" />
          <div className="row banner-total-content ">
            <div>10+</div>
            <div>Homestay</div>
          </div>
        </div>
        <div className="flex justify-center items-center gap-2">
          <MdPeopleAlt size={50} className="" />
          <div className="row banner-total-content ">
            <div>500+</div>
            <div>Khách Hàng</div>
          </div>
        </div>
        <div className="flex justify-center items-center gap-2">
          <BsImage size={50} className="" />
          <div className="row banner-total-content ">
            <div>100+</div>
            <div>Dịch Vụ</div>
          </div>
        </div>
      </div>
      <div className="banner-intro">
        <div className="w-[550px] intro">
          <div className="intro-title">Dịch Vụ Thuê Homestay</div>
          <div className="intro-disc1">
            Thông qua những trãi nghiệm của những khác hàng trước , Thuê
            Homestay 24h từng bước khẳng định và giữ vững vị thế, uy tín chất
            lượng dịch vụ hàng đầu tại Hòn Sơn nói riêng và miền Nam nói chung ,
            làm hài lòng khách hàng trăm ngìn lượt khách trong và ngoài nước
            cũng như du khách quốc tế đến với Hòn Sơn .
          </div>
          <div className="intro-disc2">
            Ba điểm mạng nổi bật của ThueHomestay24h :
            <div className="flex  items-center">
              <MdOutlineCheckCircleOutline className="imgabc" />
              <div className="abc">Uy tín</div>
            </div>
            <div className="flex  items-center">
              <MdOutlineCheckCircleOutline className="imgabc" />
              <div className="abc">Chất Lượng</div>
            </div>
            <div className="flex  items-center">
              <MdOutlineCheckCircleOutline className="imgabc" />
              <div className="abc">Tận Tâm</div>
            </div>
          </div>
        </div>
        <img alt="" src={bannerIntro}></img>
      </div>
    </div>
  );
};

export default TrangChu;
