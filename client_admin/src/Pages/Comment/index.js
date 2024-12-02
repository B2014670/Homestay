// import React, { useEffect, useState, useRef } from 'react'
// import { Space, Table, Typography, Button, Input, Avatar, Tooltip, Popconfirm } from 'antd'
// import { apiGetAllComment, apiDeleteComment } from '../../api'
// import { SearchOutlined, DeleteOutlined } from '@ant-design/icons';
// import Highlighter from 'react-highlight-words';
// import swal from "sweetalert";

// const { Title: AntTitle } = Typography;

// const Comment = () => {
//   const [loading, setLoading] = useState(false)
//   const [dataSource, setDataSource] = useState([])

//   const [searchText, setSearchText] = useState('');
//   const [searchedColumn, setSearchedColumn] = useState('');
//   const searchInput = useRef(null);

//   const handleSearch = (selectedKeys, confirm, dataIndex) => {
//     confirm();
//     setSearchText(selectedKeys[0]);
//     setSearchedColumn(dataIndex);
//   };
//   const handleReset = (clearFilters) => {
//     clearFilters();
//     setSearchText('');
//   };

//   const getColumnSearchProps = (dataIndex) => ({
//     filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
//       <div
//         style={{
//           padding: 8,
//         }}
//         onKeyDown={(e) => e.stopPropagation()}
//       >
//         <Input
//           ref={searchInput}
//           placeholder={`Search ${dataIndex}`}
//           value={selectedKeys[0]}
//           onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
//           onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
//           style={{
//             marginBottom: 8,
//             display: 'block',
//           }}
//         />
//         <Space>
//           <Button
//             type="primary"
//             onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
//             icon={<SearchOutlined />}
//             size="small"
//             style={{
//               width: 90,
//             }}
//           >
//             Search
//           </Button>
//           <Button
//             onClick={() => clearFilters && handleReset(clearFilters)}
//             size="small"
//             style={{
//               width: 90,
//             }}
//           >
//             Reset
//           </Button>
//           <Button
//             type="link"
//             size="small"
//             onClick={() => {
//               confirm({
//                 closeDropdown: false,
//               });
//               setSearchText(selectedKeys[0]);
//               setSearchedColumn(dataIndex);
//             }}
//           >
//             Filter
//           </Button>
//           <Button
//             type="link"
//             size="small"
//             onClick={() => {
//               close();
//             }}
//           >
//             close
//           </Button>
//         </Space>
//       </div>
//     ),
//     filterIcon: (filtered) => (
//       <SearchOutlined
//         style={{
//           color: filtered ? '#1677ff' : undefined,
//         }}
//       />
//     ),
//     onFilter: (value, record) =>
//       record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
//     onFilterDropdownOpenChange: (visible) => {
//       if (visible) {
//         setTimeout(() => searchInput.current?.select(), 100);
//       }
//     },
//     render: (text) =>
//       searchedColumn === dataIndex ? (
//         <Highlighter
//           highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
//           searchWords={[searchText]}
//           autoEscape
//           textToHighlight={text ? text.toString() : ''}
//         />
//       ) : (
//         text
//       ),
//   });

//   useEffect(() => {
//     setLoading(true)
//     apiGetAllComment()
//       .then(res => {
//         console.log(res)
//         setDataSource(res.data.data)
//         setLoading(false)
//       }).catch(error => {
//         console.error('Failed to fetch comments:', error);
//         setLoading(false);
//       });
//   }, [])


//   return (
//     <div className="m-5">
//       <Space size={0} direction="vertical" className='w-full'>
//         <AntTitle level={4} className="text-2xl font-semibold mb-4">QUẢN LÝ TÀI BÌNH LUẬN</AntTitle>
//         {/* Responsive Table */}
//         <div className="overflow-x-auto">
//           <Table
//             bordered
//             loading={loading}
//             rowKey="idComment"
//             columns={[
//               {
//                 title: 'Họ và tên',
//                 dataIndex: ['userDetails', 'name'],
//                 key: 'name',
//                 ...getColumnSearchProps('name'),
//               },
//               {
//                 title: "Ảnh",
//                 dataIndex: ['userDetails', 'img', 'url'],
//                 key: 'img',
//                 align: "center",
//                 render: (url) => (
//                   <Avatar
//                     src={
//                       url ||
//                       'https://th.bing.com/th/id/R.cf89e8e6daa9dabc8174c303e4d53d3a?rik=BcjJH68FR0CVvg&pid=ImgRaw&r=0'
//                     }
//                   />
//                 ),
//               },
//               {
//                 title: 'Đánh giá',
//                 dataIndex: 'rating',
//                 key: 'rating',
//               },
//               {
//                 title: 'Nội dung',
//                 dataIndex: 'text',
//                 key: 'text',
//                 render: (text) => (
//                   <Tooltip title={text}>
//                     {text.length > 50 ? `${text.substring(0, 50)}...` : text}
//                   </Tooltip>
//                 ),
//               },
//               {
//                 title: 'Ngày tạo',
//                 dataIndex: 'createdDate',
//                 key: 'createdDate',
//                 render: (date) => new Date(date).toLocaleDateString(),//render: (date) => new Intl.DateTimeFormat('vi-VN').format(new Date(date)),
//               },
//               {
//                 title: "Chỉnh sửa",
//                 render: (_, record) => {
//                   return (
//                     <div className="flex">
//                       <Popconfirm
//                         okType="danger"
//                         title="Bạn có chắc chắn muốn xóa không?"
//                         onConfirm={async () => {
//                           try {
//                             const result = await apiDeleteComment({
//                               idUser: record?.idUser,
//                               idComment: record.idComment
//                             });

//                             // if (result.data.status === 1) {
//                             //   swal("Thành Công !", result.data.msg, "success").then(() => {
//                             //     setDataSource((prev) => prev.filter((item) => item._id !== record._id));
//                             //   });
//                             // } else {
//                             //   swal("Thông báo !", result.data.msg, "warning");
//                             // }
//                           } catch (error) {
//                             console.error('Error deleting comment:', error);
//                             swal("Lỗi !", "Xóa không thành công", "error");
//                           }
//                         }}
//                         onCancel={() => {
//                           console.log("Hủy bỏ thao tác xóa");
//                         }}
//                         okText="Có"
//                         cancelText="Không"
//                       >
//                         <DeleteOutlined
//                           className="m-1 flex items-center justify-center"
//                           style={{ fontSize: "20px", color: "red" }}
//                         />
//                       </Popconfirm>
//                     </div>
//                   );
//                 },
//               },
//             ]}
//             dataSource={dataSource}
//             pagination={{
//               pageSize: 8,
//             }}
//           />
//         </div>
//       </Space>
//     </div>
//   );
// };

// export default Comment
import React, { useEffect, useState, useRef } from 'react';
import { Space, Table, Typography, Button, Input, Avatar, Tooltip, Popconfirm } from 'antd';
import { apiGetAllComment, apiDeleteComment } from '../../api';
import { SearchOutlined, DeleteOutlined } from '@ant-design/icons';
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
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
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

  // Fetch comments data
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await apiGetAllComment();
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

  // Delete comment handler
  const handleDeleteComment = async (record) => {
    try {
      await apiDeleteComment({
        idUser: record?.idUser,
        idComment: record?.idComment,
      });
      swal("Thành Công!", "Bình luận đã được xóa.", "success");
      fetchData()
      // setDataSource((prev) => prev.filter((item) => item.idComment !== record.idComment));
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
                ...getColumnSearchProps(['userDetails', 'name']),
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
                title: 'Chỉnh sửa',
                render: (_, record) => (
                  <Popconfirm
                    okType="danger"
                    title="Bạn có chắc chắn muốn xóa không?"
                    onConfirm={() => handleDeleteComment(record)}
                    okText="Có"
                    cancelText="Không"
                  >
                    <DeleteOutlined style={{ fontSize: '20px', color: 'red' }} />
                  </Popconfirm>
                ),
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

export default Comment;
