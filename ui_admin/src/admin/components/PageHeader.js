import React from 'react';
import { Breadcrumb, Typography } from 'antd';
import { Link } from 'react-router-dom';

const { Title } = Typography;

const PageHeader = ({ title, breadcrumbs = [] }) => {
  return (
    <div style={{ marginBottom: 24 }}>
      {breadcrumbs.length > 0 && (
        <Breadcrumb style={{ marginBottom: 8 }}>
          <Breadcrumb.Item>
            <Link to="/admin">Admin</Link>
          </Breadcrumb.Item>
          {breadcrumbs.map((bc, index) => (
            <Breadcrumb.Item key={index}>
              {bc.path ? <Link to={bc.path}>{bc.label}</Link> : bc.label}
            </Breadcrumb.Item>
          ))}
        </Breadcrumb>
      )}
      <Title level={4} style={{ margin: 0, fontWeight: 600, color: '#1f1f1f' }}>
        {title}
      </Title>
    </div>
  );
};

export default PageHeader;