// src/admin/pages/products/ProductDetailModal.js
import React from 'react';
import { Modal, Spin, Row, Col, Image, Descriptions, Tag, Table, Button } from 'antd';
import { formatCurrency } from '../../../shared/utils/formatters';

const PRODUCT_STATUS_MAP = {
  ACTIVE:       { label: 'Đang bán',    color: 'green'   },
  INACTIVE:     { label: 'Ngừng bán',   color: 'default' },
  OUT_OF_STOCK: { label: 'Hết hàng',    color: 'red'     },
  DISCONTINUED: { label: 'Không còn',   color: 'volcano' },
};

const ProductDetailModal = ({ visible, onClose, data, loading }) => {
  return (
    <Modal
      title="Chi tiết sản phẩm Hệ thống"
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>Đóng</Button>
      ]}
      width={750}
      centered
      destroyOnClose
    >
      <Spin spinning={loading}>
        {data && (
          <div style={{ marginTop: 16 }}>
            <Row gutter={24}>
              <Col xs={24} sm={8} style={{ textAlign: 'center', marginBottom: 16 }}>
                <Image
                  // FIX LỖI ẢNH: Backend trả về DTO chi tiết sử dụng trường 'mainImage'
                  src={data.mainImage || 'https://placehold.co/200x200?text=No+Image'}
                  fallback="https://placehold.co/200x200?text=Error"
                  style={{ width: '100%', maxWidth: 200, borderRadius: 8, objectFit: 'cover', border: '1px solid #f0f0f0' }}
                />
              </Col>
              <Col xs={24} sm={16}>
                <Descriptions column={1} bordered size="small">
                  <Descriptions.Item label="Tên sản phẩm">
                    <strong>{data.name}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Giá niêm yết">
                    <span style={{ color: '#ef4444', fontWeight: 600 }}>{formatCurrency(data.price || 0)}</span>
                  </Descriptions.Item>
                  <Descriptions.Item label="Trạng thái kinh doanh">
                    <Tag color={PRODUCT_STATUS_MAP[data.status]?.color || 'default'}>
                      {PRODUCT_STATUS_MAP[data.status]?.label || data.status}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Mô tả sản phẩm">
                    <div style={{ maxHeight: 100, overflowY: 'auto', whiteSpace: 'pre-wrap' }}>
                      {data.description || <i>Không có mô tả chi tiết cho sản phẩm này.</i>}
                    </div>
                  </Descriptions.Item>
                </Descriptions>
              </Col>
            </Row>

            <h4 style={{ marginTop: 24, marginBottom: 12, fontSize: 14, fontWeight: 600 }}>
              Danh sách các Biến thể hàng hóa (Variants)
            </h4>
            <Table
              dataSource={data.variants || []}
              rowKey={v => v.variantId ?? v.id}
              pagination={false}
              size="small"
              bordered
              columns={[
                { title: 'Kích cỡ (Size)', dataIndex: 'size', align: 'center', fontWeight: 600 },
                { title: 'Màu sắc (Color)', dataIndex: 'color', align: 'center' },
                { 
                  title: 'Số lượng hàng tồn kho', 
                  dataIndex: 'stockQuantity', 
                  align: 'center',
                  render: qty => {
                    const count = qty ?? 0;
                    return count === 0 ? <Tag color="red">Hết hàng</Tag> : <strong>{count}</strong>;
                  }
                }
              ]}
            />
          </div>
        )}
      </Spin>
    </Modal>
  );
};

export default ProductDetailModal;