import React from 'react';
import { Breadcrumb, Typography } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Title } = Typography;

const PageHeader = ({ breadcrumbs = [], title, extra }) => (
  <div style={{ marginBottom: 20 }}>
    <Breadcrumb
      style={{ marginBottom: 8 }}
      items={[
        { title: <Link to="/admin/dashboard"><HomeOutlined /> Trang chủ</Link> },
        ...breadcrumbs.map((b, i) => ({
          title: i < breadcrumbs.length - 1 && b.path ? <Link to={b.path}>{b.label}</Link> : b.label,
        })),
      ]}
    />
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Title level={4} style={{ margin: 0 }}>{title}</Title>
      {extra}
    </div>
  </div>
);
export default PageHeader;
