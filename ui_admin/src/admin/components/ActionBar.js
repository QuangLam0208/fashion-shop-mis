import React from 'react';
import { Button, Space } from 'antd';
import { PlusOutlined, ExportOutlined } from '@ant-design/icons';

const ActionBar = ({ onAdd, addLabel = 'Thêm mới', onExport, extra, showExport = true }) => (
  <Space>
    {extra}
    {showExport && (
      <Button icon={<ExportOutlined />} onClick={onExport}>
        Export
      </Button>
    )}
    {onAdd && (
      <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}
        style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none' }}>
        {addLabel}
      </Button>
    )}
  </Space>
);
export default ActionBar;
