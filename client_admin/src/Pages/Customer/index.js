import React, { useEffect, useState, useRef } from 'react'
import { Space, Table, Typography, Button, Input, Avatar } from 'antd'
import { apiGetAllUser } from '../../api'
import { SearchOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';

const { Title: AntTitle } = Typography;

const Customer = () => {
  const [loading, setLoading] = useState(false)
  const [dataSource, setDataSource] = useState([])

  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef(null);
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
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
      <div
        style={{
          padding: 8,
        }}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{
            marginBottom: 8,
            display: 'block',
          }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{
              width: 90,
            }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{
              width: 90,
            }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({
                closeDropdown: false,
              });
              setSearchText(selectedKeys[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Filter
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined
        style={{
          color: filtered ? '#1677ff' : undefined,
        }}
      />
    ),
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{
            backgroundColor: '#ffc069',
            padding: 0,
          }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });

  useEffect(() => {
    setLoading(true)
    apiGetAllUser()
      .then(res => {
        // console.log(res)
        setDataSource(res.data.users)
        setLoading(false)
      })
  }, [])


  return (
    <div className="m-5">
      <Space size={0} direction="vertical" className='w-full'>
        <AntTitle level={4} className="text-2xl font-semibold mb-4">QUẢN LÝ TÀI KHOẢN KHÁCH HÀNG</AntTitle>
        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <Table
            loading={loading}
            rowKey="_id"
            columns={[
              {
                title: 'Họ và tên',
                dataIndex: 'name',
                key: 'name',
                ...getColumnSearchProps('name'),
              },
              {
                title: "Ảnh",
                dataIndex: "img",
                align: "center",
                render: (img) => <Avatar src={img.url?? "https://th.bing.com/th/id/R.cf89e8e6daa9dabc8174c303e4d53d3a?rik=BcjJH68FR0CVvg&pid=ImgRaw&r=0"} />
              },
              {
                title: 'Tên tài khoản',
                dataIndex: 'phone',
                key: 'phone',
                ...getColumnSearchProps('phone'),
              },
              {
                title: 'Email',
                dataIndex: 'email',
                key: 'email',
                sorter: (a, b) => a.email.localeCompare(b.email),
                sortDirections: ['ascend', 'descend'],
              },
              {
                title: 'Số điện thoại',
                dataIndex: 'phone',
                key: 'phone',
              },
              {
                title: 'Địa chỉ',
                dataIndex: 'address',
                key: 'address',
                ...getColumnSearchProps('address'),
                sorter: (a, b) => a.address.length - b.address.length,
                sortDirections: ['descend', 'ascend'],
              },
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

export default Customer