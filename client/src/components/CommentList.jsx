import React from 'react';
import { List, Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';

const CommentList = ({ comments }) => (
  <List
    className="comment-list"
    header={`${comments.length} replies`}
    itemLayout="horizontal"
    dataSource={comments}
    renderItem={comment => (
      <li>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Avatar icon={<UserOutlined />} />
          <div style={{ marginLeft: 10 }}>
            <strong>{comment.author}</strong>
            <p>{comment.content}</p>
            <span>{comment.datetime}</span>
          </div>
        </div>
      </li>
    )}
  />
);

export default CommentList;
