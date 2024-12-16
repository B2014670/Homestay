import React, { useEffect, useState, useRef } from "react";
import {
  Space,
  Table,
  Typography,
  Input,
  Button,
  Popconfirm,
  message,
  Select,
} from "antd";
import { apiGetAllExtraService, apiEditExtraService, apiDeleteExtraService } from "../../api";

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
import AddServiceForm from "../../components/AddServiceForm";

const { Title: AntTitle } = Typography;
const Service = () => {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [showAddServicePopup, setShowAddServicePopup] = useState(false);
  const [searchText, setSearchText] = useState("");
  const searchInput = useRef();
  const [editingRow, setEditingRow] = useState(null);
  const [editData, setEditData] = useState({
    id: "",
    name: "",
    description: "",
    price: "",
    status: "",
  });

  const getService = () => {
    setLoading(true);
    apiGetAllExtraService().then((res) => {
      setDataSource(res.data.extraServices.data);
      setLoading(false);
    });
  }

  useEffect(() => {
    getService();
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
            Tìm
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
    setEditData({ ...editData });
    // Gọi apiEditExtraService sau khi đã cập nhật editData
    const result = await apiEditExtraService(editData);
    if (result.status === 200) {
      swal("Thành Công !", "Thông báo cập nhật thông tin khu vực thành công !", "success").then((value) => { setEditingRow(null); setEditData(); getService() });
    }
  };

  const handleEditClick = (record) => {
    setEditData({ ...editData, id: record._id });
    setEditingRow(record._id);
  };

  return (
    <div className="m-5">

      <AddServiceForm
        isVisible={showAddServicePopup}
        setShowAddSectorPopup={setShowAddServicePopup}
        onClose={() => setShowAddServicePopup(false)}
        onSuccess={() => getService()}
      />

      <Space size={0} direction="vertical" className="w-full">
        <div className="flex justify-between">
          <AntTitle level={4} className="text-2xl font-semibold mb-4">QUẢN LÝ DỊCH VỤ</AntTitle>
          <Button
            className="bg-primary border text-green"
            size={40}
            icon={<PlusOutlined />}
            onClick={() => setShowAddServicePopup(true)}
          >
            Thêm Dịch Vụ
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
              title: "Tên dịch vụ",
              dataIndex: "name",
              ...getColumnSearchProps("name"),
              sorter: (a, b) => a.name.localeCompare(b.name),
              render: (text, record) => {
                if (record._id === editingRow) {
                  return (
                    <Input
                      defaultValue={text}
                      onChange={(e) => {
                        setEditData({
                          ...editData,
                          name: e.target.value,
                        });
                      }}
                    />
                  );
                }
                return <span>{text.toLocaleString("vi-VN")}</span>;
              },
            },
            {
              title: "Mô tả",
              dataIndex: "description",
              width: "500px",
              ...getColumnSearchProps("description"),
              sorter: (a, b) => a.description.localeCompare(b.description),
              render: (text, record) => {
                if (record._id === editingRow) {
                  return (
                    <Input
                      defaultValue={text}
                      onChange={(e) => {
                        if (e && e.target) {

                          setEditData({
                            ...editData,
                            description: e.target.value,
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
              title: "Giá",
              dataIndex: "price",
              ...getColumnSearchProps("price"),
              sorter: (a, b) => a.price.localeCompare(b.price),
              render: (text, record) => {
                if (record._id === editingRow) {
                  return (
                    <Input
                      defaultValue={text}
                      onChange={(e) => {

                        setEditData({
                          ...editData,
                          price: e.target.value,
                        });
                      }}
                    />
                  );
                }
                return <span>{text.toLocaleString("vi-VN")}</span>;
              },
            },
            {
              title: "Trạng thái",
              dataIndex: "status",
              filters: [
                { text: "Hoạt động", value: 1 },
                { text: "Tạm ngưng", value: 0 },
              ],
              onFilter: (value, record) => record.status === value,
              render: (value, record) => {
                if (record._id === editingRow) {
                  return (
                    <Select
                      defaultValue={value}
                      style={{ width: 120 }}
                      onChange={(newValue) => {
                        setEditData({
                          ...editData,
                          status: newValue, // Update status directly
                        });
                      }}
                      options={[
                        { label: "Hoạt động", value: 1 },
                        { label: "Tạm ngưng", value: 0 },
                      ]}
                    />
                  );
                }
                return value === 1 ? "Hoạt động" : "Tạm ngưng";
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
                        handleEditClick(record);
                      }}
                    >
                      Chỉnh sửa
                    </EditOutlined>
                    {/* <Popconfirm
                      okType="danger"
                      //  okButtonProps={{ style: {  backgroundColor: 'red'  }}}
                      title="Bạn có chắc chắn muốn xóa không?"
                      onConfirm={async () => {
                        // console.log(record);
                        const result = await apiDeleteExtraService({ "id": record._id });
                        console.log(result)
                        if (result.data.status === 0) {
                          swal("Thành Công !", "Xóa khu vực thành công !", "success").then((value) => {
                            getService()
                          });
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
                    </Popconfirm> */}
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

export default Service;
