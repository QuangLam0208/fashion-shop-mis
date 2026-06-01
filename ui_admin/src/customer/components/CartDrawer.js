// src/customer/components/CartDrawer.js
import React from 'react';
import { Drawer, Button, Space, Typography, List, Avatar, InputNumber, Empty, Popconfirm } from 'antd';
import { DeleteOutlined, ShoppingCartOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import useCart from '../hooks/useCart';
import { formatCurrency } from '../../shared/utils/formatters';

const { Text } = Typography;

const CartDrawer = ({ open, onClose }) => {
  const { items, totalPrice, totalItems, updateQuantity, removeItem, loading } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  return (
    <Drawer
      title={
        <Space>
          <ShoppingCartOutlined style={{ fontSize: 20 }} />
          <span style={{ fontWeight: 600 }}>Giỏ hàng của bạn ({totalItems})</span>
        </Space>
      }
      placement="right"
      onClose={onClose}
      open={open}
      width={450}
      bodyStyle={{ display: 'flex', flexDirection: 'column', padding: '16px 24px' }}
      footer={
        items && items.length > 0 ? (
          <div style={{ padding: '8px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ fontSize: 15, fontWeight: 500, color: '#64748b' }}>Tổng tiền tạm tính:</Text>
              <Text type="danger" style={{ fontSize: 20, fontWeight: 700 }}>
                {formatCurrency(totalPrice)}
              </Text>
            </div>
            <Button
              type="primary"
              size="large"
              block
              icon={<ArrowRightOutlined />}
              onClick={handleCheckout}
              style={{ 
                height: 48, 
                borderRadius: 8, 
                backgroundColor: '#1a1a1a', 
                borderColor: '#1a1a1a',
                fontWeight: 600
              }}
            >
              Tiến hành thanh toán
            </Button>
          </div>
        ) : null
      }
    >
      {loading && items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
          Đang tải dữ liệu giỏ hàng...
        </div>
      ) : !items || items.length === 0 ? (
        <div style={{ margin: 'auto 0', textAlign: 'center', padding: '40px 0' }}>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={<span style={{ color: '#94a3b8' }}>Giỏ hàng của bạn đang trống</span>}
          />
          <Button 
            type="dashed" 
            style={{ marginTop: 16, borderRadius: 6 }} 
            onClick={onClose}
          >
            Tiếp tục mua sắm
          </Button>
        </div>
      ) : (
        <List
          loading={loading}
          itemLayout="horizontal"
          dataSource={items}
          renderItem={(item) => {
            // 🌟 ĐỒNG BỘ ĐÚNG ID VÀ CÁC BIẾN REAL-TIME TỪ SPRING BOOT
            const currentItemId = item.itemId ?? item.cartItemId ?? item.cart_item_id ?? item.id;
            const itemPrice = item.price ?? 0;
            const itemImage = item.primaryImageUrl ?? item.imageUrl ?? item.image ?? 'https://placehold.co/80x100?text=No+Image';

            return (
              <List.Item
                key={currentItemId}
                actions={[
                  <Popconfirm
                    title="Xóa sản phẩm này khỏi giỏ hàng?"
                    onConfirm={() => removeItem(currentItemId)}
                    okText="Xóa"
                    cancelText="Hủy"
                    placement="left"
                    okButtonProps={{ danger: true }}
                  >
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined style={{ fontSize: 16 }} />}
                    />
                  </Popconfirm>
                ]}
                style={{ padding: '16px 0', alignItems: 'flex-start' }}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar
                      shape="square"
                      size={72}
                      src={itemImage}
                      style={{ objectFit: 'cover', borderRadius: 8, border: '1px solid #f0f0f0' }}
                    />
                  }
                  title={
                    <div style={{ fontWeight: 600, fontSize: 14, color: '#1a1a1a', pr: 8, lineHeight: 1.4 }}>
                      {item.name || item.productName || 'Sản phẩm'}
                    </div>
                  }
                  description={
                    <Space direction="vertical" size={4} style={{ width: '100%', marginTop: 4 }}>
                      {/* Hiển thị phân loại biến thể nếu có */}
                      {(item.color || item.size) && (
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          Phân loại: {item.color ? `${item.color}` : ''}{item.size ? ` / ${item.size}` : ''}
                        </Text>
                      )}
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                        <InputNumber
                          min={1}
                          size="small"
                          value={item.quantity}
                          onChange={(val) => {
                            if (val && val !== item.quantity) {
                              updateQuantity(currentItemId, val);
                            }
                          }}
                          style={{ width: 64, borderRadius: 4 }}
                        />
                        <Text style={{ fontWeight: 600, color: '#1a1a1a', fontSize: 14 }}>
                          {formatCurrency(itemPrice * item.quantity)}
                        </Text>
                      </div>
                    </Space>
                  }
                />
              </List.Item>
            );
          }}
        />
      )}
    </Drawer>
  );
};

export default CartDrawer;