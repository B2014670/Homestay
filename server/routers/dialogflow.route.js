const express = require("express");
const dialogflow = require("../controllers/dialogflow.controller");

const router = express.Router();

router.post("", async (req, res) => {
  // console.log(req.body);
  const intent = req.body.queryResult.intent.displayName;
  const parameters = req.body.queryResult.parameters;
  // console.log(parameters);

  // Hàm viết hoa chữ cái đầu của một chuỗi
  function capitalizeFirstLetter(s) {
    // Split the string into words
    const words = s.split();

    // Capitalize the first letter of each word
    const capitalizedWords = words.map(
      (word) => word.charAt(0).toUpperCase() + word.slice(1)
    );

    // Join the words back into a string
    return capitalizedWords.join(" ");
  }

  // Hàm này sẽ liệt kê tất cả các phòng

  async function inTotalRoom() {
    try {
      const data = await dialogflow.getAllRoom();

      // Tạo custom payload cho thẻ accordion
      const accordionPayload = {
        type: "accordion",
        title: `Danh sách phòng tại Homestay24h bao gồm ${data.length} phòng`,
        subtitle: 'gõ "&lt;Tên phòng&gt;" để thực hiện đặt phòng',
      };

      // Tạo custom payload cho danh sách các phòng
      const listItemsPayload = {
        type: "list",
        title: "",
        subtitle: "",
        // event: {
        //   name: "",
        //   languageCode: "",
        //   parameters: {},
        // },
      };

      // Tạo danh sách các phòng dựa trên dữ liệu từ API
      const listItems = data.map((room) => {
        const listItem = { ...listItemsPayload };
        listItem.title = `${capitalizeFirstLetter(room.nameRoom)} - ${
          room.loaiRoom
        } `;
        listItem.subtitle = `${room.giaRoom} vnđ/Đêm`;
        return listItem;
      });

      // Tạo cấu trúc rich content
      const richContent = [
        [accordionPayload],
        listItems,
        [{ type: "divider" }],
      ];

      // Tạo message fulfillment cuối cùng
      const fulfillmentMessage = {
        fulfillmentMessages: [
          {
            payload: {
              richContent: richContent,
            },
          },
        ],
      };

      // Trả về fulfillment message (bạn có thể gửi nó cho client theo nhu cầu)
      return res.send(fulfillmentMessage);
    } catch (error) {
      return {
        fulfillmentText: "Xin lỗi, có lỗi xảy ra khi xử lý yêu cầu của bạn.",
      };
    }
  }

  // Hàm này sẽ tìm phòng theo khu vực
  async function orderRoomBySector() {
    try {
      const data = await dialogflow.findRoomsByIdSector(parameters);
      // const rooms = data.map(
      //   (room) =>
      //     `phòng ${room.nameRoom} - giá ${room.giaRoom}vnđ/Đêm - loại phòng : ${room.loaiRoom}.`
      // );
      // const roomListString = `Sau đây là danh sách các phòng cùng với giá phòng: ${rooms.join(
      //   ", "
      // )}. Bạn đã chọn được phòng ưng ý nào ạ?`;

      const accordionPayload = {
        type: "accordion",
        title: "Danh sách phòng tại khu vực bạn đã chọn :",
        subtitle: `gõ "&lt;Tên phòng&gt;" để thực hiện đặt phòng`,
      };

      // Tạo custom payload cho danh sách các phòng
      const listItemsPayload = {
        type: "list",
        title: "",
        subtitle: "",
      };

      // Tạo danh sách các phòng dựa trên dữ liệu từ API
      const listItems = data.map((room) => {
        const listItem = { ...listItemsPayload };
        listItem.title = `${capitalizeFirstLetter(room.nameRoom)} - ${
          room.loaiRoom
        } `;
        listItem.subtitle = `${room.giaRoom} vnđ/Đêm`;
        return listItem;
      });

      // Tạo cấu trúc rich content
      const richContent = [
        [accordionPayload],
        listItems,
        [{ type: "divider" }],
      ];

      // Tạo message fulfillment cuối cùng
      const fulfillmentMessage = {
        fulfillmentMessages: [
          {
            payload: {
              richContent: richContent,
            },
          },
        ],
      };
      return res.send(fulfillmentMessage);
    } catch (error) {
      return res.send({
        fulfillmentText: "Xin lỗi, có lỗi xảy ra khi xử lý yêu cầu của bạn.",
      });
    }
  }

  // Hàm này sẽ xác nhận đơn đặt phòng
  async function confirmOrderRoom(agent) {
    try {
      const { enTenPhong, enTen, enNgayCheckIn, enNgayCheckOut, enSdt } =
        parameters;
      //  console.log(parameters)
      const room = await dialogflow.getInfoRoom({ idRoom: enTenPhong });
      console.log(room);

      // Hàm này sẽ tạo một mảng các ngày từ ngày check-in đến ngày check-out
      function generateDateArrayWithTimezone(startTimestamp, endTimestamp) {
        const dateArray = [];
        let currentDate = new Date(startTimestamp);
        const lastDate = new Date(endTimestamp);

        while (currentDate <= lastDate) {
          const formattedDate = `${currentDate
            .getDate()
            .toString()
            .padStart(2, "0")}/${(currentDate.getMonth() + 1)
            .toString()
            .padStart(2, "0")}/${currentDate.getFullYear()}`;
          dateArray.push(formattedDate);
          currentDate = new Date(
            currentDate.setDate(currentDate.getDate() + 1)
          );
        }
        return dateArray;
      }
      const arrayDate = generateDateArrayWithTimezone(
        enNgayCheckIn,
        enNgayCheckOut
      );
      console.log('arrayDate', arrayDate);
      const orderDetails = {
        enTenPhong,
        dateOrderRoom: arrayDate,
        enTen: enTen.name,
        enSdt,
        totalMoney: arrayDate.length * room.giaRoom,
      };

      console.log('orderDetails', orderDetails);

      const data = await dialogflow.orderRoomByChatBot(orderDetails);

      console.log('data', data);

      const confirmationMessage = `Chào anh/chị ${
        enTen.name
      }! Homestay24h xin xác nhận thông tin đơn đặt phòng của mình lần nữa ạ. 
        Anh/chị ${enTen.name} đặt phòng ${room.nameRoom} ngày nhận phòng : ${
        arrayDate[0]
      }, ngày trả phòng: ${arrayDate[arrayDate.length - 1]}. 
        Tổng số ngày là ${arrayDate.length}.
        Tổng tiền: ${arrayDate.length * room.giaRoom}vnđ.
        Khi nhận phòng tại quầy, vui lòng cung cấp tên và SĐT để nhận phòng hoặc mã đặt phòng: ${
          data.order[data.order.length - 1].idOrder
        }.`;
      return res.send({
        fulfillmentText: confirmationMessage,
      });
    } catch (error) {
      return res.send({
        fulfillmentText: "Xin lỗi, có lỗi xảy ra khi xử lý yêu cầu của bạn. confirmOrderRoom",
      });
    }
  }
  // hàm này lấy danh sách phòng
  async function listRooms(agent) {
    // console.log(agent.intent)
    try {
      const data = await dialogflow.getAllRoom();
      if (!Array.isArray(data) || !data.length) {
        return res.send({
          fullfilmentText: "Không có dữ liệu phòng.",
        });
      }
      // console.log(data);
      const rooms = data.map(
        (room) =>
          `phòng ${
            room.nameRoom
          } - giá ${room.giaRoom.toLocaleString()}vnđ/Đêm - loại phòng : ${
            room.loaiRoom
          }.`
      );
      const roomListString = `Sau đây là danh sách các phòng cùng với giá phòng: ${rooms.join(
        ", "
      )}. Bạn đã chọn được phòng ưng ý nào ạ?`;

      // agent.add(roomListString);
      return res.send({
        fulfillmentText: roomListString,
      });
    } catch (error) {
      return res.send({
        fullfilmentText: "Xin lỗi, có lỗi xảy ra khi xử lý yêu cầu của bạn.",
      });
    }
  }
  // thanh toán qua thẻ
  async function payOrderByBank() {
    try {
      const data = await dialogflow.updatePaypalOrder({
        idOrder: parameters.enIdOrder,
      });
      console.log(data);
      if (!data || !data.order || !data.order.length) {
        return res.send({
          fulfillmentText: "Không có dữ liệu đơn đặt phòng.",
        });
      }

      // Tìm order con có idOrder khớp với idOrder được cung cấp
      const matchingOrder = data.order.find(
        (order) => order.idOrder === parameters.EnIdOrder
      );
      if (!matchingOrder) {
        return res.send({
          fulfillmentText: "Không tìm thấy đơn đặt phòng với ID cung cấp.",
        });
      }

      // Tạo thông báo kết quả để trả về
      const result = `Xin chào ${matchingOrder.userInput}, đơn đặt phòng của bạn với ID: ${matchingOrder.idOrder} nếu được thanh toán qua ngân hàng thành công , chúng tôi sẽ liên hệ và xác nhận thông tin sớm nhất !.`;

      return res.send({
        fulfillmentText: result,
      });
    } catch (error) {
      console.error(error);
      return res.send({
        fulfillmentText: "Xin lỗi, có lỗi xảy ra khi xử lý yêu cầu của bạn.",
      });
    }
  }

  // tìm phòng trống
  async function checkRoomDate() {
    try {
      function convertISOToDDMMYYYY(isoString) {
        const date = new Date(isoString);
        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const year = date.getFullYear();
        if (day > 12) return `${day}/${month}/${year}`;

        return `${month}/${day}/${year}`;
      }

      function getDatesList(startDateISO, endDateISO) {
        const startDate = convertISOToDDMMYYYY(startDateISO);
        const endDate = convertISOToDDMMYYYY(endDateISO);
        const start = new Date(startDate.split("/").reverse().join("-"));
        const end = new Date(endDate.split("/").reverse().join("-"));
        const dateList = [];

        for (
          let dt = new Date(start);
          dt <= end;
          dt.setDate(dt.getDate() + 1)
        ) {
          dateList.push(dt.toLocaleDateString("vi-VN"));
        }

        return dateList.map((date) =>
          date
            .split("/")
            .reverse()
            .join("/")
            .replace(
              /(\d{4})\/(\d{1,2})\/(\d{1,2})/,
              (match, year, month, day) =>
                `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`
            )
        );
      }

      // Sử dụng hàm
      const enNgayCheckIn = parameters.enNgayCheckIn;
      const enNgayCheckOut = parameters.enNgayCheckOut;
      const enIn = convertISOToDDMMYYYY(enNgayCheckIn);
      const enOut = convertISOToDDMMYYYY(enNgayCheckOut);
      console.log(enNgayCheckOut);
      const dateList = getDatesList(enNgayCheckIn, enNgayCheckOut);
      console.log("các ngày cần tìm :" + dateList); // Danh sách các ngày từ ngày check-in đến ngày check-out
      // hàm lấy danh sách các phòng có ngày trống

      const data = await dialogflow.checkRoomByChatBot({ date: dateList });
      if (data.length > 0) {
        // const rooms = data.map(
        //   (room) =>
        //     `phòng ${
        //       room.nameRoom
        //     } - giá ${room.giaRoom.toLocaleString()}vnđ/Đêm - loại phòng : ${
        //       room.loaiRoom
        //     }.`
        // );
        const accordionPayload = {
          type: "accordion",
          title: "Danh sách phòng tại khu vực bạn đã chọn :",
          subtitle: `gõ "tôi muốn đặt phòng" để thực hiện đặt phòng`,
        };

        // // Tạo custom payload cho danh sách các phòng
        const listItemsPayload = {
          type: "list",
          title: "",
          subtitle: "",
          image : {
            src: {
              rawUrl: "",
            },
          }
        };

        // // Tạo danh sách các phòng dựa trên dữ liệu từ API
        const listItems = data.map((room) => {
          const listItem = { ...listItemsPayload };
          listItem.title = `${capitalizeFirstLetter(room.nameRoom)} - ${
            room.loaiRoom
          } `;
          listItem.subtitle = `${room.giaRoom} vnđ/Đêm`;
          listItem.image.src.rawUrl = `${room.imgRoom[0].secure_url}`
          return listItem;
        });

        // Tạo cấu trúc rich content
        const richContent = [
          [accordionPayload],
          listItems,
          [{ type: "divider" }],
        ];

        // // Tạo message fulfillment cuối cùng
        const fulfillmentMessage = {
          fulfillmentMessages: [
            {
              payload: {
                richContent: richContent,
              },
            },
          ],
        };
        return res.send(fulfillmentMessage);
        // return res.send({
        //   fulfillmentText: `Chúng tôi sẽ tìm phòng trống cho bạn từ ngày ${enIn} đến ngày ${enOut}, Sau đây là danh sách ${data.length} phòng trống bao gồm tên phòng và giá phòng  : ${rooms} . Vui lòng gõ "tôi muốn đặt phòng" và làm theo hướng dẫn để tiến hành đặt phòng ."`,
        // });
      }

      return res.send({
        fulfillmentText: `Xin lỗi vì sự bất tiện này ! Hiện tại từ ngày ${enIn} đến ngày ${enOut} chúng tôi đã hết phòng trống . Xin cảm ơn quý khách đã tin tưởng đến với Homestay24h`,
      });
    } catch (error) {
      console.error(error);
      return res.send({
        fulfillmentText: "Xin lỗi, có lỗi xảy ra khi xử lý yêu cầu của bạn.",
      });
    }
  }

  //Huy dat phong
  async function canleOrderRoom() {
    try {
      // console.log(parameters)
      const idOrder = parameters.EnIdOrder;
      // console.log(idOrder)
      const data = await dialogflow.cancleOrderRoomByChatBot({
        idOrder: idOrder,
      });
      console.log(data.status);
      if (data.status === 1)
        return res.send({
          fulfillmentText: data.msg,
        });
      if (data.status === 2)
        return res.send({
          fulfillmentText: data.msg,
        });
      if (data.status === 0) {
        return res.send({
          fulfillmentText: `Đơn đặt phòng ${idOrder} đã được hủy thành công !`,
        });
      }
    } catch (error) {
      console.error(error);
      return res.send({
        fulfillmentText: "Xin lỗi, có lỗi xảy ra khi xử lý yêu cầu của bạn.",
      });
    }
  }

  //hàm lấy thông tin đặt phòng từ IdOrder
  async function getInfoOrder() {
    try {
      // console.log(parameters)
      const idOrder = parameters.EnIdOrder;
      // console.log(idOrder)
      const data = await dialogflow.getInfoOrderRoomByChatBot({
        idOrder: idOrder,
      });
      if(data === 2) {
        return res.send({
          fulfillmentText: "Không tìm thấy mã đơn đặt phòng trùng khớp với mã đơn đã cung cấp.",
        });
      }
      console.log(data);
      const paymentStatus = data.pay ? "Đã thanh toán" : "Chưa thanh toán";
      let orderStatus = "";
      if (data.statusOrder === "1") {
        orderStatus = "Chờ xác nhận";
      }
      if (data.statusOrder === "2") {
        orderStatus = "Đã xác nhận thông tin";
      }
      if (data.statusOrder === "3") {
        orderStatus = "Đã hoàn thành đơn";
      }
      if (data.statusOrder === "10") {
        orderStatus = "Đã hủy đơn";
      }
      const fulfillmentMessage = {
        fulfillmentMessages: [
          {
            payload: {
              richContent: [
                [
                  {
                    type: "accordion",
                    title: "Thông Tin Đơn Đặt Phòng",
                    subtitle: `Mã Đơn hàng : ${data.idOrder}`,
                    text: [
                      `Họ và Tên : ${data.userInput}\n`,
                      `Số điện thoại : ${data.phoneInput}\n`,
                      `Ngày nhận phòng : ${data.dateInput[0]}\n`,
                      `Ngày trả phòng : ${
                        data.dateInput[data.dateInput.length - 1]
                      }\n`,
                      `Tổng tiền : ${data.totalMoney}`,
                      `Thanh toán : ${paymentStatus}`,
                      `Trạng thái đơn  : ${orderStatus}`,
                    ],
                  },
                ],
              ],
            },
          },
        ],
      };
      return res.send(fulfillmentMessage);
    } catch (error) {
      console.error(error);
      return res.send({
        fulfillmentText: "Xin lỗi, có lỗi xảy ra khi xử lý yêu cầu của bạn.",
      });
    }
  }

  // Đây là hàm chính để xử lý các yêu cầu

  if (intent === "inTotalRoom") {
    inTotalRoom();
  }
  if (intent === "orderRoom - khuvuc") {
    orderRoomBySector();
  }
  if (intent === "orderRoom - khuvuc - confirmOrder") {
    confirmOrderRoom();
  }
  if (intent === "orderRoom - tenPhong") {
    // listRooms();
    inTotalRoom();
  }
  if (intent === "orderRoom - tenPhong - confirmOrder") {
    confirmOrderRoom();
  }
  if (intent === "inGiaPhong") {
    inTotalRoom();
  }
  if (intent === "inThanhToan - yes") {
    payOrderByBank();
  }
  if (intent === "inCheckPhongTrong") {
    checkRoomDate();
  }
  if (intent === "InCancleOrder - yes") {
    canleOrderRoom();
  }
  if (intent === "inTraCuuDonDatPhong") {
    getInfoOrder();
  }
  // console.log(intent)
});

module.exports = router;
