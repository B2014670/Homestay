import React, { useState, useMemo } from 'react';
import { Card, Input, Avatar, Select, Pagination, Rate, Typography } from 'antd';
import { UserOutlined } from '@ant-design/icons';

const { Option } = Select;
const { Title, Paragraph } = Typography;

const CommentViewer = ({ comments }) => {
  const [filter, setFilter] = useState('');
  const [starFilter, setStarFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Filter and sort comments
  const filteredAndSortedComments = useMemo(() => {
    return comments
      .filter(comment => 
        (starFilter === 'all' || comment.rating === parseInt(starFilter))
      )
      .sort((a, b) => {
        if (sortOrder === 'newest') {
          return new Date(b.createdDate) - new Date(a.createdDate);
        } else if (sortOrder === 'oldest') {
          return new Date(a.createdDate) - new Date(b.createdDate);
        } else if (sortOrder === 'highest') {
          return b.rating - a.rating;
        } else {
          return a.rating - b.rating;
        }
      });
  }, [comments, starFilter, sortOrder]);

  // Paginate comments
  const paginatedComments = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredAndSortedComments.slice(startIndex, startIndex + pageSize);
  }, [filteredAndSortedComments, currentPage]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="container mx-auto">
      <Title level={4} className="mb-4">Bình luận</Title>
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <Select
            value={starFilter}
            onChange={setStarFilter}
            className="w-full md:w-[180px]"
            placeholder="Lọc theo sao"
          >
            <Option value="all">Tất cả</Option>
            <Option value="5">5 Sao</Option>
            <Option value="4">4 Sao</Option>
            <Option value="3">3 Sao</Option>
            <Option value="2">2 Sao</Option>
            <Option value="1">1 Sao</Option>
          </Select>
          <Select
            value={sortOrder}
            onChange={setSortOrder}
            className="w-full md:w-[180px]"
            placeholder="Sắp xếp"
          >
            <Option value="newest">Mới nhất</Option>
            <Option value="oldest">Cũ nhất</Option>
            <Option value="highest">Điểm cao nhất</Option>
            <Option value="lowest">Điểm thấp nhất</Option>
          </Select>
        </div>
        {paginatedComments.length === 0 ? (
          <p className="text-center text-gray-500">Không tìm thấy bình luận nào.</p>
        ) : (
          <div className="space-y-4">
            {paginatedComments.map((comment) => (
              <Card key={comment.idComment} className='bg-slate-100'>
                <div className="flex items-start">
                  <Avatar
                    src={comment.userDetails.img.url}
                    icon={<UserOutlined />}
                    alt={comment.userDetails.name}
                    className="mr-4"
                  >
                    {getInitials(comment.userDetails.name)}
                  </Avatar>
                  <div className="flex-grow">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold">{comment.userDetails.name}</span>
                      <span className="text-sm text-gray-500">{formatDate(comment.createdDate)}</span>
                    </div>
                    <Rate disabled defaultValue={comment.rating} className="mb-2" />
                    <p className="text-gray-700">{comment.text}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
        <div className="mt-4 flex justify-center">
          <Pagination
            current={currentPage}
            total={filteredAndSortedComments.length}
            pageSize={pageSize}
            onChange={handlePageChange}
            showSizeChanger={false}
          />
        </div>
    </div>
  );
};

export default CommentViewer;