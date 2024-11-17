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
} from "@ant-design/icons";
import swal from "sweetalert";
import AddAdminForm from "../../components/AddAdminForm";
import Highlighter from "react-highlight-words";
import { apiDeleteAdmin, apiEditAdmin, apiGetAllAdmin } from "../../api";
const { Option } = Select;
const NhanVien = () => {
  const [dataSource, setDataSource] = useState([]);
  const [searchText, setSearchText] = useState("");

  const searchInput = useRef();
  useEffect(() => {
    const fetch = async () => {
      const response = await apiGetAllAdmin();
      setDataSource(response.data.admins);
    };
    fetch();
    // console.log(dataSource)
  }, []);

  const [showAddFormAdminPopup, setShowAddFormAdminPopup] = useState(false);
  const [editData, setEditData] = useState({
    _id: "",
    userName: "",
    phone: "",
    birthYear: "",
    password: "",
    isAdmin: [],
  })

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

  const handleSaveClick =  async(record) => {
    // Lưu các giá trị đã chỉnh sửa vào backend hoặc cập nhật state
    // Để đơn giản, chúng ta chỉ cập nhật state
    const result = await apiEditAdmin(editData)
    console.log(result)
     if(result.data.status ===1){
      swal("Thành Công !" ,result.data.msg,"success").then((value) => {
        window.location.reload();
      });
     }
    setEditingRow(null);
  };

  const handleEditClick = (record) => {
    setEditData({...editData, _id: record._id})
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
              onChange={(e) => setEditData({...editData , userName:e.target.value})}
            />
          );
        }
        // return <span>{text.toLocaleString("vi-VN")}</span>;
        return <span>{text ? text.toLocaleString("vi-VN") : ""}</span>;
      },
    },
    {
      title: "Avatar",
      dataIndex: "avatar",
      render: (text) => <Avatar src={text} />,
    },
    {
      title: "Số Điện Thoại",
      dataIndex: "phone",
      sorter: (a, b) => a.phone - b.phone,
      render: (text, record) => {
        if (record._id === editingRow) {
          return (
            <Input
              defaultValue={text}
              onChange={(e) => setEditData({...editData, phone: e.target.value})}
            />
          );
        }
        // return <span>{text.toLocaleString("vi-VN")}</span>;
        return <span>{text ? text.toLocaleString("vi-VN") : ""}</span>;
      },
    },
    {
      title: "Ngày Sinh",
      dataIndex: "birthYear",
      sorter: (a, b) => a.birthYear - b.birthYear,
      align: "center",
      width: "150px",
      render: (text, record) => {
        if (record._id === editingRow) {
          return (
            <DatePicker
              // defaultValue={moment(text, 'DD/MM/YYYY')}
              format={'DD/MM/YYYY'}
              onChange={(date, dateString) => setEditData({...editData, birthYear: dateString})}
            />
          );
        }
        return <span>{text}</span>;
      },
    },    
    // {
    //   title: "Tài Khoản",
    //   dataIndex: "phone",
    //   sorter: (a, b) => a.phone - b.phone,
    //   render: (text, record) => {
    //     if (record._id === editingRow) {
    //       return (
    //         <Input
    //           defaultValue={text}
    //           onChange={(e) => console.log(e.target.value)}
    //         />
    //       );
    //     }
    //     return <span>{text.toLocaleString("vi-VN")}</span>;
    //   },
    // },
    {
      title: "Mật Khẩu",
      dataIndex: "password",
      render: (text, record) => {
        if (record._id === editingRow) {
          return (
            <Input
              defaultValue={text}
              onChange={(e) => setEditData({...editData, password : e.target.value})}
            />
          );
        }
        // return <span>{text.toLocaleString("vi-VN")}</span>;
        return <span>{text ? text.toLocaleString("vi-VN") : ""}</span>;
      },
    },
    {
      title: "Quyền",
      dataIndex: "isAdmin",
      // align: "center",
      render: (text, record) => {
        if (record._id === editingRow) {
          return (
            <Select
              defaultValue={text.map((role) => role.toString())}
              mode="multiple"
              style={{ width: "100%" }}
              onChange={(value) => setEditData({...editData, isAdmin: value})}
            >
              <Option value="1">Quản Lý Nhân Viên</Option>
              <Option value="2">Quản Lý Khách Hàng</Option>
              <Option value="3">Quản Lý Đặt Phòng</Option>
              <Option value="4">Quản Lý Khu Vực</Option>
              <Option value="5">Quản Lý Phòng</Option>
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
      
      // render: (text, record) => {
      //   if (record._id === editingRow) {
      //     // Khi đang chỉnh sửa
      //     return (
      //       <Select
      //         defaultValue={text.map((role) => role.toString())}
      //         mode="multiple"
      //         style={{ width: "100%" }}
      //         onChange={(value) => setEditData({...editData, isAdmin: value})}
      //       >
      //         <Option value="1">Quản Lý Nhân Viên</Option>
      //         <Option value="2">Quản Lý Khách Hàng</Option>
      //         <Option value="3">Quản Lý Đặt Phòng</Option>
      //         <Option value="4">Quản Lý Khu Vực</Option>
      //         <Option value="5">Quản Lý Phòng</Option>
      //       </Select>
      //     );
      //   } else {
      //     // Khi không chỉnh sửa
      //     return text.map((role) => {
      //       let roleName;
      //       switch (role) {
      //         case "1":
      //           roleName = "Quản Lý Nhân Viên";
      //           break;
      //         case "2":
      //           roleName = "Quản Lý Khách Hàng";
      //           break;
      //         case "3":
      //           roleName = "Quản Lý Đặt Phòng";
      //           break;
      //         case "4":
      //           roleName = "Quản Lý Khu Vực";
      //           break;
      //         case "5":
      //           roleName = "Quản Lý Phòng";
      //           break;
      //         default:
      //           roleName = "";
      //       }
      //       return <div key={role}>{roleName}</div>; // Mỗi quyền trên một dòng riêng
      //     });
      //   }
      // },
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
                  swal("Thành Công !", result.data.msg, "success").then((value) => {
                    window.location.reload();
                  });;
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
      {showAddFormAdminPopup && (
        <AddAdminForm closeForm={() => setShowAddFormAdminPopup(false)} />
      )}
      <Space size={20} direction="vertical">
          <div className="flex justify-around">{/* justify-center */}
          <Typography.Title level={3}>QUẢN LÝ NHÂN VIÊN</Typography.Title>

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

/*
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
} from "@ant-design/icons";
import swal from "sweetalert";
import AddAdminForm from "../../components/AddAdminForm";
import Highlighter from "react-highlight-words";
import { apiDeleteAdmin, apiEditAdmin, apiGetAllAdmin } from "../../api";

const { Option } = Select;

const NhanVien = () => {
  const [dataSource, setDataSource] = useState([]);
  const [searchText, setSearchText] = useState("");
  const searchInput = useRef();

  useEffect(() => {
    const fetch = async () => {
      const response = await apiGetAllAdmin();
      setDataSource(response.data.admins);
    };
    fetch();
  }, []);

  const [showAddFormAdminPopup, setShowAddFormAdminPopup] = useState(false);
  const [editData, setEditData] = useState({
    _id: "",
    userName: "",
    phone: "",
    birthYear: "",
    password: "",
    isAdmin: [],
  });

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
          <Button onClick={() => clearFilters()} size="small" style={{ width: 90 }}>
            Đặt lại
          </Button>
        </div>
      ),
      filterIcon: (filtered) => (
        <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
      ),
      onFilter: (value, record) =>
        record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
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
    const result = await apiEditAdmin(editData);
    if (result.data.status === 1) {
      swal("Thành Công!", result.data.msg, "success").then(() => {
        window.location.reload();
      });
    }
    setEditingRow(null);
  };

  const handleEditClick = (record) => {
    setEditData({ ...editData, _id: record._id });
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
      title: "Avatar",
      dataIndex: "avatar",
      render: (text) => <Avatar src={text} />,
    },
    {
      title: "Số Điện Thoại",
      dataIndex: "phone",
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
            </Select>
          );
        } else {
          return Array.isArray(text) ? (
            text.map((role) => {
              let roleName;
              switch (role) {
                case "1": roleName = "Quản Lý Nhân Viên"; break;
                case "2": roleName = "Quản Lý Khách Hàng"; break;
                case "3": roleName = "Quản Lý Đặt Phòng"; break;
                case "4": roleName = "Quản Lý Khu Vực"; break;
                case "5": roleName = "Quản Lý Phòng"; break;
                default: roleName = "";
              }
              return <div key={role}>{roleName}</div>;
            })
          ) : <div>Chưa có quyền</div>;
        }
      },
      filters: [
        { text: "Quản Lý nhân viên", value: "1" },
        { text: "Quản Lý Khách hàng", value: "2" },
        { text: "Quản Lý Đặt Phòng", value: "3" },
        { text: "Quản Lý Khu Vực", value: "4" },
        { text: "Quản Lý Phòng", value: "5" },
      ],
      onFilter: (value, record) => record.isAdmin.includes(value),
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
              />
            </div>
          );
        }
        return (
          <div className="flex">
            <EditOutlined
              className="m-1 flex items-center justify-center"
              style={{ fontSize: "20px", color: "green" }}
              onClick={() => handleEditClick(record)}
            />
            <Popconfirm
              title="Bạn có chắc chắn muốn xóa không?"
              onConfirm={async () => {
                const result = await apiDeleteAdmin({ _id: record._id });
                if (result.data.status === 1) {
                  swal("Thành Công!", result.data.msg, "success").then(() => {
                    window.location.reload();
                  });
                } else {
                  swal("Thông báo!", result.data.msg, "warning");
                }
              }}
              onCancel={() => console.log("Hủy bỏ thao tác xóa")}
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
    <div className="m-5 w-full">
      {showAddFormAdminPopup && (
        <AddAdminForm closeForm={() => setShowAddFormAdminPopup(false)} />
      )}
      <Space size={20} direction="vertical" className="w-full">
        <div className="flex justify-between w-full">
          <Typography.Title level={3}>QUẢN LÝ NHÂN VIÊN</Typography.Title>
          <Button
            className="bg-primary border text-green"
            size={40}
            icon={<PlusOutlined />}
            onClick={() => setShowAddFormAdminPopup(true)}
          >
            Thêm Nhân Viên
          </Button>
        </div>
        <Table
          pagination={{ pageSize: 6 }}
          rowKey="_id"
          dataSource={dataSource}
          columns={columns}
          bordered
          className="w-full"
        />
      </Space>
    </div>
  );
};

export default NhanVien;
*/