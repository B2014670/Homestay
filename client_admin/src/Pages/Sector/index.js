import React, { useEffect, useState, useRef } from "react";
import {
  Space,
  Table,
  Typography,
  Input,
  Button,
  Popconfirm,
  message,
} from "antd";
import { apiGetAllSector, apiEditSector, apiDeleteSector } from "../../api";

import {
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  PlusOutlined,
  SaveOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import swal from "sweetalert";
import Highlighter from "react-highlight-words";
import AddSectorForm from "../../components/AddSectorForm";

const { Title: AntTitle } = Typography;
const Sector = () => {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [showAddSectorPopup, setShowAddSectorPopup] = useState(false);
  const [searchText, setSearchText] = useState("");
  const searchInput = useRef();
  const [editingRow, setEditingRow] = useState(null);
  const [editData, setEditData] = useState({
    idSector: "",
    nameSector: "",
    discSector: "",
    addressSector: "",
  });

  const getSector = () => {
    setLoading(true);
    apiGetAllSector().then((res) => {
      setDataSource(res.data.sectors);
      setLoading(false);
    });
  }

  useEffect(() => {
    getSector();
  }, []);

  const getColumnSearchProps = (dataIndex) => {
    return {
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }) => (
        <div style={{ padding: 8 }}>
          <Input
            ref={searchInput}
            placeholder={`Tìm kiếm ${dataIndex}`}
            value={selectedKeys[0]}
            onChange={(e) =>
              setSelectedKeys(e.target.value ? [e.target.value] : [])
            }
            onPressEnter={() => confirm()}
            style={{ width: 188, marginBottom: 8, display: "block" }}
          />
          <Button
            onClick={() => confirm()}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90, marginRight: 8 }}
          >
            Tìm kiếm
          </Button>
          <Button
            onClick={() => clearFilters()}
            size="small"
            style={{ width: 90 }}
          >
            Đặt lại
          </Button>
        </div>
      ),
      filterIcon: (filtered) => (
        <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
      ),
      onFilter: (value, record) =>
        record[dataIndex]
          .toString()
          .toLowerCase()
          .includes(value.toLowerCase()),
      onFilterDropdownOpenChange: (open) => {
        if (open) {
          setTimeout(() => searchInput.current.select());
        }
      },
      render: (text) => (
        <Highlighter
          highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text.toString()}
        />
      ),
    };
  };

  const handleSaveClick = async (record) => {
    setEditData({ ...editData, idSector: record._id });
    console.log(editData);
    // Gọi apiEditSector sau khi đã cập nhật editData
    const result = await apiEditSector(editData);
    if (result.status === 200) {
      swal("Thành Công !", "Thông báo cập nhật thông tin khu vực thành công !", "success").then((value) => { setEditingRow(null); setEditData(); getSector()});
    }
  };

  const handleEditClick = (record) => {
    setEditData({ ...editData, idSector: record._id });
    setEditingRow(record._id);
  };

  return (
    <div className="m-5">

      <AddSectorForm
        isVisible={showAddSectorPopup}
        setShowAddSectorPopup={setShowAddSectorPopup}
        onClose={() => setShowAddSectorPopup(false)}
        onSuccess={() => getSector()}
      ></AddSectorForm>

      <Space size={0} direction="vertical" className="w-full">
        <div className="flex justify-between">
          <AntTitle level={4} className="text-2xl font-semibold mb-4">QUẢN LÝ KHU VỰC</AntTitle>
          <Button
            className="bg-primary border text-green"
            size={40}
            icon={<PlusOutlined />}
            onClick={() => setShowAddSectorPopup(true)}
          >
            Thêm Khu Vực
          </Button>
        </div>
        <Table
          loading={loading}
          rowKey="_id"
          pagination={{
            pageSize: 6,
          }}
          dataSource={dataSource}
          columns={[
            {
              title: "Tên khu vực",
              dataIndex: "nameSector",
              ...getColumnSearchProps("nameSector"),
              sorter: (a, b) => a.nameSector.localeCompare(b.nameSector),
              render: (text, record) => {
                if (record._id === editingRow) {
                  return (
                    <Input
                      defaultValue={text}
                      onChange={(e) => {
                        setEditData({
                          ...editData,
                          nameSector: e.target.value,
                        });
                      }}
                    />
                  );
                }
                return <span>{text.toLocaleString("vi-VN")}</span>;
              },
            },
            {
              title: "Đặt điểm khu vực ",
              dataIndex: "discSector",
              width: "500px",
              ...getColumnSearchProps("discSector"),
              sorter: (a, b) => a.discSector.localeCompare(b.discSector),
              render: (text, record) => {
                if (record._id === editingRow) {
                  return (
                    <Input
                      defaultValue={text}
                      onChange={(e) => {
                        if (e && e.target) {

                          setEditData({
                            ...editData,
                            discSector: e.target.value,
                          });
                        } else {
                          console.log("Event or target is undefined");
                        }
                      }}
                    />
                  );
                }
                return <span>{text.toLocaleString("vi-VN")}</span>;
              },
            },
            {
              title: "Vị trí",
              dataIndex: "addressSector",
              ...getColumnSearchProps("addressSector"),
              sorter: (a, b) => a.addressSector.localeCompare(b.addressSector),
              render: (text, record) => {
                if (record._id === editingRow) {
                  return (
                    <Input
                      defaultValue={text}
                      onChange={(e) => {

                        setEditData({
                          ...editData,
                          addressSector: e.target.value,
                        });
                      }}
                    />
                  );
                }
                return <span>{text.toLocaleString("vi-VN")}</span>;
              },
            },
            {
              title: "Số lượng phòng",
              dataIndex: "totalRoomInSector",
              align: "center",
              render: (text, record) => {
                return <span>{text}</span>;
              },
            },
            {
              title: "Chỉnh sửa",
              render: (_, record) => {
                if (record._id === editingRow) {
                  return (
                    <div className="flex">
                      <SaveOutlined
                        className="m-1 flex items-center justify-center"
                        style={{ fontSize: "20px", color: "green" }}
                        onClick={() => handleSaveClick(record)}
                      >
                        Lưu
                      </SaveOutlined>
                      <CloseCircleOutlined
                        className="m-1 flex items-center justify-center"
                        onClick={() => setEditingRow(null)}
                        style={{ fontSize: "20px", color: "red" }}
                      />
                    </div>
                  );
                }
                return (
                  <div className="flex">
                    <EditOutlined
                      className="m-1 flex items-center justify-center"
                      style={{ fontSize: "20px", color: "green" }}
                      onClick={() => {
                        // console.log(record._id);
                        handleEditClick(record);
                      }}
                    >
                      Chỉnh sửa
                    </EditOutlined>
                    <Popconfirm
                      okType="danger"
                      //  okButtonProps={{ style: {  backgroundColor: 'red'  }}}
                      title="Bạn có chắc chắn muốn xóa không?"
                      onConfirm={async () => {
                        // console.log(record);
                        const result = await apiDeleteSector({ "idSector": record._id });
                        console.log(result)
                        if (result.data.status === 0) {
                          swal("Thành Công !", "Xóa khu vực thành công !", "success").then((value) => {
                            getSector()
                          });;
                        } else {
                          message.error("Có lỗi xảy ra!");
                        }
                      }}
                      onCancel={() => {
                        console.log("Hủy bỏ thao tác xóa");
                      }}
                      okText="Có"
                      cancelText="Không"
                    >
                      <DeleteOutlined
                        className="m-1 flex items-center justify-center"
                        style={{ fontSize: "20px", color: "red" }}
                      />
                    </Popconfirm>
                  </div>
                );
              },
            },
          ]}
          bordered
        ></Table>
      </Space>
    </div>
  );
};

export default Sector;
