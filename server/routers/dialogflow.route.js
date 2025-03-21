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
        title: `Danh sách phòng tại Homestay  bao gồm ${data.length} phòng`,
        // subtitle: 'gõ "&lt;Tên phòng&gt;" để thực hiện đặt phòng',
        subtitle: 'Chọn phòng để thực hiện đặt phòng',
      };

      // Tạo custom payload cho danh sách các phòng
      const listItemsPayload = {
        type: "list",
        title: "",
        subtitle: "",
        // event: {
        //   name: "",
        //   languageCode: "vi",
        //   parameters: {},
        // },
      };

      // Tạo danh sách các phòng dựa trên dữ liệu từ API
      // const listItems = data.map((room) => {
      //   const listItem = { ...listItemsPayload };
      //   listItem.title = `${capitalizeFirstLetter(room.nameRoom)} - ${
      //     room.loaiRoom
      //   } `;
      //   listItem.subtitle = `${room.giaRoom} vnđ/Đêm`;
      //   return listItem;
      // });

      const listItems = data.map((room) => {
        return {
          ...listItemsPayload,
          title: `${capitalizeFirstLetter(room.nameRoom)} - ${room.loaiRoom}`,
          subtitle: `${room.giaRoom} vnđ/Đêm`,
          event: {
            name: "select_room",
            languageCode: "en",
            parameters: { enTenPhong: room._id },
          },
        };
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

  // Hàm này sẽ liệt kê tất cả các khu vực
  async function inNumberRoomOfSector() {
    try {
      const data = await dialogflow.getAllSectorChatbot();
      // console.log(data);

      // // Check if data is available
      if (!data || !data.sectors || data.sectors.length === 0) {
        return {
          fulfillmentText: "Không có khu vực nào được tìm thấy.",
        };
      }

      // Tạo custom payload cho thẻ accordion
      const accordionPayload = {
        type: "accordion",
        title: `Homestay bao gồm ${data.length} khu vực`,
        subtitle: 'Chọn khu vực để xem phòng',
      };

      // Tạo custom payload cho danh sách các khu vực
      const listItemsPayload = {
        type: "list",
        title: "",
        subtitle: "",
      };

      // Tạo danh sách các khu vực dựa trên dữ liệu từ API

      const listItems = data.sectors.map((sector) => {
        return {
          ...listItemsPayload,
          title: `${capitalizeFirstLetter(sector.nameSector)}: ${sector.totalRoomInSector} phòng`,
          subtitle: `${sector.discSector}`,
          event: {
            name: "select_sector",
            languageCode: "en",
            parameters: { enKhuVuc: sector._id },
          },
        };
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

      if (!Array.isArray(data) || data.length === 0) {
        return res.send({
          fulfillmentMessages: [{
            text: {
              text: ["Xin lỗi, hiện tại không có phòng nào khả dụng."]
            }
          }]
        });
      }

      const accordionPayload = {
        type: "accordion",
        title: `Danh sách phòng tại khu vực ${data[0]?.sectorDetails?.nameSector || ""}  :`,
        subtitle: 'Chọn phòng để thực hiện đặt phòng',
      };

      // Tạo custom payload cho danh sách các phòng
      const listItemsPayload = {
        type: "list",
        title: "",
        subtitle: "",
      };

      // Tạo danh sách các phòng dựa trên dữ liệu từ API
      // const listItems = data.map((room) => {
      //   const listItem = { ...listItemsPayload };
      //   listItem.title = `${capitalizeFirstLetter(room.nameRoom)} - ${
      //     room.loaiRoom
      //   } `;
      //   listItem.subtitle = `${room.giaRoom} vnđ/Đêm`;
      //   return listItem;
      // });

      const listItems = data.map((room) => {
        return {
          ...listItemsPayload,
          title: `${capitalizeFirstLetter(room.nameRoom)} - ${room.loaiRoom}`,
          subtitle: `${room.giaRoom} vnđ/Đêm`,
          event: {
            name: "select_room",
            languageCode: "en",
            parameters: { enTenPhong: room._id },
          },
        };
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
      // console.log(room);


      function convertISOToDDMMYYYY(isoString) {
        const date = new Date(isoString);
        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const year = date.getFullYear();
        if (day > 12) return `${day}/${month}/${year}`;

        return `${month}/${day}/${year}`;
      }

      const arrayDate = [convertISOToDDMMYYYY(enNgayCheckIn), convertISOToDDMMYYYY(enNgayCheckOut)];
      const days = (new Date(arrayDate[1].split('/').reverse().join('-')) - 
              new Date(arrayDate[0].split('/').reverse().join('-'))) / (1000 * 3600 * 24);
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

      // const confirmationMessage = `Chào anh/chị ${enTen.name
      //   }! Homestay xin xác nhận thông tin đơn đặt phòng của mình lần nữa ạ. 
      //   Anh/chị ${enTen.name} đặt phòng ${room.nameRoom} ngày nhận phòng : ${arrayDate[0]
      //   }, ngày trả phòng: ${arrayDate[arrayDate.length - 1]}. 
      //   Tổng số ngày là ${arrayDate.length}.
      //   Tổng tiền: ${arrayDate.length * room.giaRoom}vnđ.
      //   Khi nhận phòng tại quầy, vui lòng cung cấp tên và SĐT để nhận phòng hoặc mã đặt phòng: ${data.order[data.order.length - 1].idOrder
      //   }.`;
      // return res.send({
      //   fulfillmentText: confirmationMessage,
      // });
      const confirmationMessage = `Chào anh/chị ${enTen.name
        }! Homestay xin xác nhận thông tin đơn đặt phòng của mình lần nữa ạ.`;

      const roomDetails = {
        "type": "info",
        "title": "Thông tin đặt phòng",
        "subtitle": `Phòng: ${room.nameRoom}`,
      };

      const bookingDetails = {
        "type": "description",
        "text": [
          `Ngày nhận: ${arrayDate[0]}`,
          `Ngày trả: ${arrayDate[arrayDate.length - 1]}`,
          `Tổng số ngày: ${days}`,
          `Tổng tiền: ${data.totalMoney.toLocaleString()} vnđ`
        ]
      };

      const bookingCode = {
        "type": "description",
        "text": [
          `Khi nhận phòng tại quầy, vui lòng cung cấp tên và SĐT để nhận phòng hoặc mã đặt phòng: ${data.order[data.order.length - 1].idOrder}`
        ]
      };

      return res.send({
        fulfillmentMessages: [
          {
            text: {
              text: [confirmationMessage]
            }
          },
          {
            payload: {
              richContent: [
                [roomDetails, bookingDetails, bookingCode]
              ]
            }
          }
        ]
      });
    } catch (error) {
      console.log(error);
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
          `phòng ${room.nameRoom
          } - giá ${room.giaRoom.toLocaleString()}vnđ/Đêm - loại phòng : ${room.loaiRoom
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

      // function getDatesList(startDateISO, endDateISO) {
      //   const startDate = convertISOToDDMMYYYY(startDateISO);
      //   const endDate = convertISOToDDMMYYYY(endDateISO);
      //   const start = new Date(startDate.split("/").reverse().join("-"));
      //   const end = new Date(endDate.split("/").reverse().join("-"));
      //   const dateList = [];

      //   for (let dt = new Date(start); dt <= end; dt.setDate(dt.getDate() + 1)) {
      //     dateList.push(dt.toLocaleDateString("vi-VN"));
      //   }

      //   return dateList.map((date) =>
      //     date
      //       .split("/")
      //       .reverse()
      //       .join("/")
      //       .replace(
      //         /(\d{4})\/(\d{1,2})\/(\d{1,2})/,
      //         (match, year, month, day) =>
      //           `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`
      //       )
      //   );
      // }

      // function getDatesList(startDateISO, endDateISO) {
      //   const startDate = convertISOToDDMMYYYY(startDateISO);
      //   const endDate = convertISOToDDMMYYYY(endDateISO);
      //   const start = new Date(startDate.split("/").reverse().join("-"));
      //   const end = new Date(endDate.split("/").reverse().join("-"));
      //   const dateList = [];

      //   // Lặp qua các ngày từ start đến end
      //   for (let dt = new Date(start); dt <= end; dt.setDate(dt.getDate() + 1)) {
      //     // Lấy ngày, tháng, năm và chuyển thành định dạng DD/MM/YYYY
      //     const day = dt.getDate().toString().padStart(2, '0');
      //     const month = (dt.getMonth() + 1).toString().padStart(2, '0');
      //     const year = dt.getFullYear();
      //     dateList.push(`${day}/${month}/${year}`);
      //   }

      //   return dateList;
      // }


      // Sử dụng hàm
      const enNgayCheckIn = parameters.enNgayCheckIn;
      const enNgayCheckOut = parameters.enNgayCheckOut;
      const enIn = convertISOToDDMMYYYY(enNgayCheckIn);
      const enOut = convertISOToDDMMYYYY(enNgayCheckOut);
      // console.log('enNgayCheckIn', enNgayCheckIn);
      // console.log('enNgayCheckOut', enNgayCheckOut);
      // console.log('enIn', enIn);
      // console.log('enOut', enOut);
      // const dateList = getDatesList(enNgayCheckIn, enNgayCheckOut);
      // console.log("các ngày cần tìm: " + dateList); // Danh sách các ngày từ ngày check-in đến ngày check-out

      // hàm lấy danh sách các phòng có ngày trống
      const data = await dialogflow.checkRoomByChatBot({ date: [enIn, enOut] });
      if (data.length > 0) {
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
          image: {
            src: {
              rawUrl: "",
            },
          }
        };

        // // Tạo danh sách các phòng dựa trên dữ liệu từ API
        const listItems = data.map((room) => {
          const listItem = { ...listItemsPayload };
          listItem.title = `${capitalizeFirstLetter(room.nameRoom)} - ${room.loaiRoom} `;
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
        fulfillmentText: `Xin lỗi vì sự bất tiện này ! Hiện tại từ ngày ${enIn} đến ngày ${enOut} chúng tôi đã hết phòng trống . Xin cảm ơn quý khách đã tin tưởng đến với Homestay `,
      });
    } catch (error) {
      console.error(error);
      return res.send({
        fulfillmentText: "Xin lỗi, có lỗi xảy ra khi xử lý yêu cầu của bạn.",
      });
    }
  }

  //Huy dat phong
  async function cancelOrderRoom() {
    try {
      const idOrder = parameters.EnIdOrder;
      // console.log(idOrder)
      const data = await dialogflow.cancelOrderRoomByChatBot({
        idOrder: idOrder,
      });
      console.log('data.status',data.status);
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
      const idOrder = parameters.EnIdOrder;
      // console.log(idOrder)
      const data = await dialogflow.getInfoOrderRoomByChatBot({
        idOrder: idOrder,
      });
      if (data === 2) {
        return res.send({
          fulfillmentText: "Không tìm thấy mã đơn đặt phòng trùng khớp với mã đơn đã cung cấp.",
        });
      }
      // console.log(data);

      // Định nghĩa trạng thái đơn hàng
      const statusMapping = {
        "1": "Chờ xác nhận",
        "2": "Đã xác nhận thông tin",
        "3": "Đã hoàn thành đơn",
        "10": "Đã hủy đơn",
      };

      const paymentStatus = data.pay === "true" ? "Đã thanh toán" : "Chưa thanh toán";
      const orderStatus = statusMapping[data.statusOrder] || "Chưa xác định";
      // Build extra services information
      let extraServicesInfo = [];
      if (data.extraServices && data.extraServices.length > 0) {
        extraServicesInfo = data.extraServices.map(service => ({
          type: "description",
          title: `Bao gồm: ${service.serviceType}`,
          text: [
            `Số khách: ${service.guests || "Chưa có thông tin"}`,
            `Ngày sử dụng: ${service.dates ? service.dates.join(", ") : "Chưa có thông tin"}`,
            `Giá mỗi đơn vị: ${service.pricePerUnit || "Chưa có thông tin"}`,
            `Tổng chi phí dịch vụ: ${service.totalServiceCost || "Chưa có thông tin"}`,
          ],
        }));
      }
      console.log(extraServicesInfo);

      const fulfillmentMessage = {
        fulfillmentMessages: [
          {
            payload: {
              richContent: [
                [
                  {
                    type: "description",
                    title: "Thông Tin Đơn Đặt Phòng",
                    subtitle: `Mã đơn: ${data.idOrder ?? "Không có thông tin"}`,
                    text: [
                      `Mã đơn: ${data.idOrder ?? "Không có thông tin"}`,
                      `Họ và Tên: ${data.userInput ?? "Chưa cung cấp"}`,
                      `Số điện thoại: ${data.phoneInput ?? "Chưa cung cấp"}`,
                      `Ngày nhận phòng: ${data.dateInput?.[0] ?? "Chưa cung cấp"}`,
                      `Ngày trả phòng: ${data.dateInput?.[data.dateInput.length - 1] ?? "Chưa cung cấp"}`,
                      `Tổng tiền: ${data.totalMoney ?? "Chưa tính"}`,
                      `Thanh toán: ${paymentStatus}`,
                      `Trạng thái đơn: ${orderStatus}`
                    ]
                  },
                ],
                extraServicesInfo.length > 0 ? extraServicesInfo : [],
                [
                  {
                    "type": "chips",
                    "options": [
                      {
                        "text": "Xem chi tiết",
                        "link": "http://localhost:3000/datphong"
                      }
                    ]
                  }
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

  // Đây là hàm chính để xử lý các yêu cầu theo các ý định từ dialogflow

  if (intent === "inTotalRoom") {
    inTotalRoom();
  }
  if (intent === "orderRoom - khuvuc") {
    inNumberRoomOfSector();
  }
  if (intent === "orderRoom - khuvuc - select") {
    orderRoomBySector();
  }
  if (intent === "orderRoom - khuvuc - select - confirmOrder") {
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
  if (intent === "InCancleOrder - yes") {
    cancelOrderRoom();
  }
  if (intent === "inThanhToan - yes") {
    payOrderByBank();
  }
  if (intent === "inCheckPhongTrong") {
    checkRoomDate();
  }
  if (intent === "inTraCuuDonDatPhong") {
    getInfoOrder();
  }
  // console.log(intent)
});

module.exports = router;
