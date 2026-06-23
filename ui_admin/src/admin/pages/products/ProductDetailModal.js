// src/admin/pages/products/ProductDetailModal.js
import React from 'react';
import { Modal, Spin, Row, Col, Image, Descriptions, Tag, Table, Button, Space, Rate } from 'antd';
import { formatCurrency } from '../../../shared/utils/formatters';

const PRODUCT_STATUS_MAP = {
  ACTIVE:       { label: 'Đang bán',    color: 'green'   },
  INACTIVE:     { label: 'Ngừng bán',   color: 'default' },
  OUT_OF_STOCK: { label: 'Hết hàng',    color: 'red'     },
  DISCONTINUED: { label: 'Không còn',   color: 'volcano' },
};

const ProductDetailModal = ({ visible, onClose, data, loading }) => {
  
  // Xác định hình ảnh hiển thị (Lấy từ images[] hoặc mainImage)
  const displayImage = data?.images && data.images.length > 0 
    ? data.images[0].url 
    : data?.mainImage || 'https://placehold.co/400x400?text=No+Image';

  return (
    <Modal
      title="Chi tiết sản phẩm Hệ thống"
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="close" type="primary" onClick={onClose} style={{ background: '#1a1a1a' }}>
          Đóng
        </Button>
      ]}
      width={800}
      centered
      destroyOnClose
    >
      <Spin spinning={loading}>
        {data && (
          <div style={{ marginTop: 16 }}>
            <Row gutter={32}>
              <Col xs={24} sm={10} style={{ textAlign: 'center', marginBottom: 16 }}>
                <Image
                  src={displayImage}
                  fallback="https://placehold.co/400x400?text=Error"
                  style={{ width: '100%', borderRadius: 12, objectFit: 'cover', border: '1px solid #f0f0f0' }}
                />
                
                {/* Đánh giá */}
                <div style={{ marginTop: 16, background: '#f9fafb', padding: '12px', borderRadius: 8 }}>
                   <div style={{ fontSize: 13, color: '#666', marginBottom: 4 }}>Đánh giá trung bình:</div>
                   <Space>
                     <Rate disabled defaultValue={data.averageRating || 0} allowHalf style={{ fontSize: 18 }} />
                     <span style={{ fontWeight: 600 }}>{data.averageRating?.toFixed(1) || 0}</span>
                     <span style={{ color: '#888' }}>({data.reviewCount || 0} lượt)</span>
                   </Space>
                </div>
              </Col>
              
              <Col xs={24} sm={14}>
                <Descriptions column={1} bordered size="small" labelStyle={{ width: '140px', fontWeight: 600, background: '#fafafa' }}>
                  <Descriptions.Item label="Tên sản phẩm">
                    <strong style={{ fontSize: 16 }}>{data.name}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Danh mục">
                    {data.category || <span style={{ color: '#aaa' }}>Chưa cập nhật</span>}
                  </Descriptions.Item>
                  <Descriptions.Item label="Giá niêm yết">
                    <span style={{ color: '#e53935', fontWeight: 700, fontSize: 16 }}>
                      {formatCurrency(data.price || data.minPrice || 0)}
                    </span>
                  </Descriptions.Item>
                  <Descriptions.Item label="Trạng thái">
                    <Tag color={PRODUCT_STATUS_MAP[data.status]?.color || 'default'} style={{ margin: 0 }}>
                      {PRODUCT_STATUS_MAP[data.status]?.label || data.status}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Mô tả sản phẩm">
                    <div style={{ maxHeight: 150, overflowY: 'auto', whiteSpace: 'pre-wrap', fontSize: 14 }}>
                      {data.description ? (
                         <div dangerouslySetInnerHTML={{ __html: data.description }} />
                      ) : (
                         <i>Không có mô tả chi tiết cho sản phẩm này.</i>
                      )}
                    </div>
                  </Descriptions.Item>
                </Descriptions>
              </Col>
            </Row>

            <div style={{ marginTop: 32 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h4 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
                  Phân loại (Biến thể)
                </h4>
                <Tag color="blue">Tổng tồn kho: {data.variants?.reduce((sum, v) => sum + (v.stockQuantity || 0), 0)}</Tag>
              </div>
              
              <Table
                dataSource={data.variants || []}
                rowKey={v => v.variantId ?? v.id}
                pagination={false}
                size="middle"
                bordered
                scroll={{ y: 240 }}
                columns={[
                  { title: 'Kích cỡ (Size)', dataIndex: 'size', align: 'center', width: '30%', fontWeight: 600 },
                  { title: 'Màu sắc (Color)', dataIndex: 'color', align: 'center', width: '30%' },
                  { 
                    title: 'Tồn kho', 
                    dataIndex: 'stockQuantity', 
                    align: 'center',
                    render: qty => {
                      const count = qty ?? 0;
                      return count <= 0 ? <Tag color="red">Hết hàng</Tag> : <strong style={{ color: '#389e0d' }}>{count}</strong>;
                    }
                  }
                ]}
              />
            </div>
          </div>
        )}
      </Spin>
    </Modal>
  );
};

export default ProductDetailModal;