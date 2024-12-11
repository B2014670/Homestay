import React, { useEffect, useState, useRef } from 'react';
import { Space, Table, Typography, Button, Input, Avatar, Tooltip, Popconfirm, message } from 'antd';
import { apiGetAllComment, apiDeleteComment, apiUnDeleteComment } from '../../api';
import { SearchOutlined, DeleteOutlined, EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import swal from "sweetalert";

const { Title: AntTitle } = Typography;

const Comment = () => {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef(null);

  // Handle column search
  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText('');
  };

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Tìm
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Đặt lại
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex]?.toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });

  const getColumnSearchProps2 = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Input
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          placeholder={`Search ${dataIndex}`}
          onPressEnter={() => handleSearch(selectedKeys, confirm)}
          style={{ width: 188, marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            onClick={() => handleSearch(selectedKeys, confirm)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Tìm
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Đặt lại
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
    onFilter: (value, record) => {
      // Safely access nested property using optional chaining
      const data = dataIndex.split('.').reduce((acc, key) => acc?.[key], record) || '';
      return data.toString().toLowerCase().includes(value.toLowerCase());
    },
  });

  // Fetch comments data
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await apiGetAllComment();
      console.log(res.data.data);
      setDataSource(res.data.data || []);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleVisibility = async (record) => {
    try {

      // Call your API or service to update the comment
      if (record.isDeleted) {
        await apiUnDeleteComment({
          idUser: record?.idUser,
          idComment: record?.idComment,
        });
        swal("Thành Công!", "Bình luận đã khôi phục.", "success");
      } else {
        await apiDeleteComment({
          idUser: record?.idUser,
          idComment: record?.idComment,
        });
        swal("Thành Công!", "Bình luận đã được ẩn.", "success");
      }
      // Update the local state or refetch the data
      fetchData();
    } catch (error) {
      console.error("Failed to update comment visibility:", error);
      message.error("Cập nhật trạng thái thất bại!");
    }
  };

  // Delete comment handler
  const handleDeleteComment = async (record) => {
    try {
      await apiDeleteComment({
        idUser: record?.idUser,
        idComment: record?.idComment,
      });
      swal("Thành Công!", "Bình luận đã được xóa.", "success");
      fetchData()

    } catch (error) {
      console.error('Error deleting comment:', error);
      swal("Lỗi!", "Không thể xóa bình luận.", "error");
    }
  };

  return (
    <div className="m-5">
      <Space size={0} direction="vertical" className="w-full">
        <AntTitle level={4} className="text-2xl font-semibold mb-4">
          QUẢN LÝ BÌNH LUẬN
        </AntTitle>
        <div className="overflow-x-auto">
          <Table
            bordered
            loading={loading}
            rowKey="idComment"
            columns={[
              {
                title: 'Họ và tên',
                dataIndex: ['userDetails', 'name'], 
                key: 'name',
                ...getColumnSearchProps2('userDetails.name'),
              },
              {
                title: 'Ảnh',
                dataIndex: ['userDetails', 'img', 'url'],
                key: 'img',
                align: 'center',
                render: (url) => (
                  <Avatar
                    src={url || 'https://via.placeholder.com/150'}
                  />
                ),
              },
              {
                title: 'Phòng',
                dataIndex: ['roomDetails', 'nameRoom'],
              },
              {
                title: 'Đánh giá',
                dataIndex: 'rating',
                key: 'rating',
              },
              {
                title: 'Nội dung',
                dataIndex: 'text',
                key: 'text',
                render: (text) => (
                  <Tooltip title={text}>
                    {text.length > 50 ? `${text.substring(0, 50)}...` : text}
                  </Tooltip>
                ),
              },
              {
                title: 'Ngày tạo',
                dataIndex: 'createdDate',
                key: 'createdDate',
                render: (date) => new Date(date).toLocaleDateString(),
              },
              {
                title: "Trạng thái",
                dataIndex: "isDeleted",
                filters: [
                  { text: "Hiển thị", value: false },
                  { text: "Tạm ẩn", value: true },
                ],
                onFilter: (value, record) => record.isDeleted === value,
                render: (value, record) => {
                  return value ? "Tạm ẩn" : "Hiển thị";
                },
              },
              {
                title: "Chỉnh sửa",
                render: (_, record) => (
                  <Popconfirm
                    okType="danger"
                    title={
                      record.isDeleted
                        ? "Bạn có chắc chắn muốn hiển thị bình luận này không?"
                        : "Bạn có chắc chắn muốn ẩn bình luận này không?"
                    }
                    onConfirm={() => handleToggleVisibility(record)}
                    okText="Có"
                    cancelText="Không"
                  >
                    {record.isDeleted ? (
                      <EyeOutlined style={{ fontSize: "20px", color: "green" }} />
                    ) : (
                      <EyeInvisibleOutlined style={{ fontSize: "20px", color: "red" }} />
                    )}
                  </Popconfirm>
                ),
              }
            ]}
            dataSource={dataSource}
            pagination={{
              pageSize: 8,
            }}
          />
        </div>
      </Space>
    </div>
  );
};

export default Comment;
