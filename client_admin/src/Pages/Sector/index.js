import React, { useEffect, useState, useRef } from "react";
import {
  Avatar,
  Rate,
  Space,
  Table,
  Typography,
  Input,
  Button,
  Popconfirm,
  message,
  InputNumber,
} from "antd";
import { apiGetAllSector, apiDeleteAdmin, apiEditSector, apiDeleteSector } from "../../api";

import {
  EditOutlined,
  DeleteOutlined,
  UnorderedListOutlined,
  SearchOutlined,
  PlusOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import swal from "sweetalert";
import Highlighter from "react-highlight-words";
import AddSectorForm from "../../components/AddSectorForm";
const Sector = () => {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [showAddSectorPopup, setShowAddSectorPopup] = useState(false);

  useEffect(() => {
    setLoading(true);
    apiGetAllSector().then((res) => {
      // console.log(res)
      setDataSource(res.data.sectors);
      setLoading(false);
    });
  }, []);

  const [searchText, setSearchText] = useState("");
  const [editData, setEditData] = useState({
    idSector: "",
    nameSector: "",
    discSector: "",
    addressSector: "",
  });
  const searchInput = useRef();

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

  const [editingRow, setEditingRow] = useState(null);

  const handleSaveClick = async (record) => {
    setEditData({ ...editData, idSector: record._id });
    console.log(editData);
    // Gọi apiEditSector sau khi đã cập nhật editData
    const result = await apiEditSector(editData);
    if(result.status ===200){
      swal("Thành Công !","Thông báo cập nhật thông tin khu vực thành công !","success").then((value)=>{window.location.reload();});
    }

    setEditingRow(null);
  };

  const handleEditClick = (record) => {
    setEditData({ ...editData, idSector: record._id });
    setEditingRow(record._id);
  };

  return (
    <div className="p-5 w-full">
      {showAddSectorPopup && (
        <AddSectorForm
          setShowAddSectorPopup={setShowAddSectorPopup}
        ></AddSectorForm>
      )}
      <Space size={20} direction="vertical">
        <div className="flex justify-around">
          <Typography.Title level={3}>QUẢN LÝ KHU VỰC</Typography.Title>
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
                        const result = await apiDeleteSector({"idSector" : record._id});
                        console.log(result)
                        if (result.data.status === 0) {
                          swal("Thành Công !", "Xóa khu vực thành công !", "success").then((value) => {
                            window.location.reload();
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
          dataSource={dataSource}
          pagination={{
            pageSize: 6,
          }}
        ></Table>
      </Space>
    </div>
  );
};

export default Sector;
