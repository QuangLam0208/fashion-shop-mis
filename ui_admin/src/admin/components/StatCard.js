import React from 'react';
import { Card, Typography, Space } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;

const StatCard = ({ title, value, icon, formatter, color = '#1890ff', growth }) => {
  const displayValue = formatter ? formatter(value) : value;

  return (
    <Card
      bordered={false}
      style={{
        borderRadius: 12,
        boxShadow: '0 1px 8px rgba(0, 0, 0, 0.08)',
        overflow: 'hidden',
        minHeight: '136px',
        display: 'flex',
        flexDirection: 'column',
      }}
      bodyStyle={{ padding: '20px 24px', flex: 1, display: 'flex', flexDirection: 'column' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Text type="secondary" style={{ fontSize: 14, fontWeight: 500 }}>
            {title}
          </Text>
          <Title level={3} style={{ margin: '8px 0 0 0', fontSize: 24, fontWeight: 700 }}>
            {displayValue !== undefined && displayValue !== null ? displayValue : '0'}
          </Title>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 48,
            height: 48,
            borderRadius: 8,
            backgroundColor: `${color}15`,
            color: color,
            fontSize: 24,
          }}
        >
          {icon}
        </div>
      </div>

      <div style={{ flexGrow: 1 }} /> 

      {/* Render growth hoặc render một khối trống để giữ layout */}
      {growth !== undefined ? (
        <div style={{ marginTop: 12, display: 'flex', alignItems: 'center' }}>
          <Space size={4}>
            {growth >= 0 ? (
              <ArrowUpOutlined style={{ color: '#52c41a', fontSize: 12 }} />
            ) : (
              <ArrowDownOutlined style={{ color: '#ff4d4f', fontSize: 12 }} />
            )}
            <Text style={{ color: growth >= 0 ? '#52c41a' : '#ff4d4f', fontWeight: 600, fontSize: 13 }}>
              {Math.abs(growth)}%
            </Text>
          </Space>
          <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>
            so với tháng trước
          </Text>
        </div>
      ) : (
        // Khối giữ chỗ có cùng chiều cao và margin khi không có growth
        <div style={{ marginTop: 12, height: '22px' }} /> 
      )}
    </Card>
  );
};

export default StatCard;