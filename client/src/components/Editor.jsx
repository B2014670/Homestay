import React, { useState } from 'react';
import { Form, Button, Input } from 'antd';

const { TextArea } = Input;

const Editor = ({ onSubmit, submitting, value, onChange }) => (
  <>
    <Form.Item>
      <TextArea rows={4} onChange={onChange} value={value} placeholder="Nội dung..." />
    </Form.Item>
    <Form.Item>
      <Button htmlType="submit" loading={submitting} onClick={onSubmit} type="primary">
        Bình luận
      </Button>
    </Form.Item>
  </>
);

export default Editor;
