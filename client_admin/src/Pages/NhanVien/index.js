import React, { useState, useEffect, useRef } from "react";
import moment from 'moment';

import {
  Avatar,
  Button,
  Space,
  Table,
  Typography,
  Input,
  Popconfirm,
  Select,
  DatePicker,
} from "antd";

import {
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  PlusOutlined,
  SaveOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import swal from "sweetalert";
import AddAdminForm from "../../components/AddAdminForm";
import Highlighter from "react-highlight-words";
import { apiDeleteAdmin, apiEditAdmin, apiGetAllAdmin } from "../../api";
const { Option } = Select;

const { Title: AntTitle } = Typography;
const NhanVien = () => {
  const [dataSource, setDataSource] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [showAddFormAdminPopup, setShowAddFormAdminPopup] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [editData, setEditData] = useState({
    _id: "",
    userName: "",
    phone: "",
    birthYear: "",
    password: "",
    isAdmin: [],
  })

  const searchInput = useRef();

  const fetchAdmins = async () => {
    try {
      const response = await apiGetAllAdmin();
      setDataSource(response.data.admins);
    } catch (error) {
      console.error("Error fetching admins:", error);
      swal("Lỗi!", "Không thể tải danh sách quản trị viên!", "error");
    }
  };

  useEffect(() => {
    fetchAdmins();
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
    const result = await apiEditAdmin(editData)
    console.log(result)
    if (result.data.status === 1) {
      swal("Thành Công !", result.data.msg, "success").then(async () => {
        try {
          // Fetch updated admin data after success
          fetchAdmins()
        } catch (error) {
          console.error("Error fetching updated admin data:", error);
          swal("Lỗi!", "Không thể tải lại danh sách quản trị viên!", "error");
        }
      });
    }
    setEditingRow(null);
  };

  const handleEditClick = (record) => {
    setEditData({ ...editData, _id: record._id })
    setEditingRow(record._id);
  };

  const columns = [
    {
      title: "Họ Tên",
      width: 200,
      dataIndex: "userName",
      ...getColumnSearchProps("userName"),
      sorter: (a, b) => a.userName.localeCompare(b.userName),
      render: (text, record) => {
        if (record._id === editingRow) {
          return (
            <Input
              defaultValue={text}
              onChange={(e) => setEditData({ ...editData, userName: e.target.value })}
            />
          );
        }
        return <span>{text ? text.toLocaleString("vi-VN") : ""}</span>;
      },
    },
    {
      title: "Ảnh",
      dataIndex: "avatar",
      align: "center",
      render: (text) => <Avatar src={text} />,
    },
    {
      title: "Số Điện Thoại",
      dataIndex: "phone",
      ...getColumnSearchProps("phone"),
      sorter: (a, b) => a.phone - b.phone,
      render: (text, record) => {
        if (record._id === editingRow) {
          return (
            <Input
              defaultValue={text}
              onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
            />
          );
        }
        return <span>{text ? text.toLocaleString("vi-VN") : ""}</span>;
      },
    },
    {
      title: "Ngày Sinh",
      dataIndex: "birthYear",
      ...getColumnSearchProps("birthYear"),
      sorter: (a, b) => a.birthYear - b.birthYear,
      align: "center",
      width: "150px",
      render: (text, record) => {
        if (record._id === editingRow) {
          return (
            <DatePicker
              format={'DD/MM/YYYY'}
              onChange={(date, dateString) => setEditData({ ...editData, birthYear: dateString })}
            />
          );
        }
        return <span>{text}</span>;
      },
    },
    {
      title: "Mật Khẩu",
      dataIndex: "password",
      align: "center",
      render: (text, record) => {
        if (record._id === editingRow) {
          return (
            <Input
              defaultValue={text}
              onChange={(e) => setEditData({ ...editData, password: e.target.value })}
            />
          );
        }
        return <span>{text ? text.toLocaleString("vi-VN") : ""}</span>;
      },
    },
    {
      title: "Quyền",
      dataIndex: "isAdmin",
      render: (text, record) => {
        if (record._id === editingRow) {
          return (
            <Select
              defaultValue={text.map((role) => role.toString())}
              mode="multiple"
              style={{ width: "100%" }}
              onChange={(value) => setEditData({ ...editData, isAdmin: value })}
            >
              <Option value="1">Quản Lý Nhân Viên</Option>
              <Option value="2">Quản Lý Khách Hàng</Option>
              <Option value="3">Quản Lý Đặt Phòng</Option>
              <Option value="4">Quản Lý Khu Vực</Option>
              <Option value="5">Quản Lý Phòng</Option>
              <Option value="6">Quản Lý Dịch Vụ</Option>
              <Option value="7">Quản Lý Đánh Giá</Option>
            </Select>
          );
        } else {
          return Array.isArray(text) ? (
            text.map((role) => {
              let roleName;
              switch (role) {
                case "1":
                  roleName = "Quản Lý Nhân Viên";
                  break;
                case "2":
                  roleName = "Quản Lý Khách Hàng";
                  break;
                case "3":
                  roleName = "Quản Lý Đặt Phòng";
                  break;
                case "4":
                  roleName = "Quản Lý Khu Vực";
                  break;
                case "5":
                  roleName = "Quản Lý Phòng";
                  break;
                default:
                  roleName = "";
              }
              return <div key={role}>{roleName}</div>;
            })
          ) : (
            <div>Chưa có quyền</div>
          );
        }
      },
      filters: [
        { text: "Quản Lý nhân viên", value: "1" },
        { text: "Quản Lý Khách hàng", value: "2" },
        { text: "Quản Lý Đặt Phòng", value: "3" },
        { text: "Quản Lý Khu Vực", value: "4" },
        { text: "Quản Lý Phòng", value: "5" },
      ],
      onFilter: (value, record) => {
        // Kiểm tra xem mảng isAdmin có chứa giá trị lọc không
        return record.isAdmin.includes(value);
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
                const result = await apiDeleteAdmin({ _id: record._id });
                console.log(result);
                if (result.data.status === 1) {
                  swal("Thành Công !", result.data.msg, "success").then(() => {
                    setDataSource((prev) => prev.filter((admin) => admin._id !== record._id));
                  });
                } else {
                  swal("Thông báo !", result.data.msg, "warning");
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
  ];
  return (
    <div className="m-5">

      <AddAdminForm
        isVisible={showAddFormAdminPopup}
        onClose={() => setShowAddFormAdminPopup(false)}
        onSuccess={() => fetchAdmins()}
      />

      <Space size={0} direction="vertical" className="w-full">
        <div className="flex justify-between">{/* justify-center */}
          <AntTitle level={4} className="text-2xl font-semibold mb-4">QUẢN LÝ NHÂN VIÊN</AntTitle>
          <Button
            className="bg-primary border text-green"
            size={40}
            icon={<PlusOutlined />}
            onClick={() => {
              setShowAddFormAdminPopup(true);
            }}
          >
            Thêm Nhân Viên
          </Button>
        </div>
        <Table
          pagination={{
            pageSize: 6,
          }}
          rowKey="_id"
          dataSource={dataSource}
          columns={columns}
          bordered
        />
      </Space>
    </div>
  );
};

export default NhanVien;