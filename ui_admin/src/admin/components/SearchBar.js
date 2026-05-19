import React from 'react';
import { Form, Input, Select, DatePicker, Button, Space, Row, Col } from 'antd';
import { SearchOutlined, ClearOutlined } from '@ant-design/icons';

const { RangePicker } = DatePicker;

const SearchBar = ({ fields = [], onSearch, onReset, loading }) => {
  const [form] = Form.useForm();

  const handleSearch = () => {
    const vals = form.getFieldsValue();
    onSearch?.(vals);
  };

  const handleReset = () => {
    form.resetFields();
    onReset?.();
  };

  const renderField = (f) => {
    switch (f.type) {
      case 'select':
        return <Select placeholder={f.placeholder} allowClear style={{ minWidth: 150 }} options={f.options} />;
      case 'daterange':
        return <RangePicker format="DD/MM/YYYY" />;
      default:
        return <Input placeholder={f.placeholder} allowClear onPressEnter={handleSearch} />;
    }
  };

  return (
    <Form form={form} layout="inline">
      <Row gutter={[8, 8]} align="middle">
        {fields.map((f) => (
          <Col key={f.name}>
            <Form.Item name={f.name} style={{ marginBottom: 0 }}>
              {renderField(f)}
            </Form.Item>
          </Col>
        ))}
        <Col>
          <Space>
            <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch} loading={loading}>
              Tìm kiếm
            </Button>
            <Button icon={<ClearOutlined />} onClick={handleReset}>
              Xoá lọc
            </Button>
          </Space>
        </Col>
      </Row>
    </Form>
  );
};
export default SearchBar;
