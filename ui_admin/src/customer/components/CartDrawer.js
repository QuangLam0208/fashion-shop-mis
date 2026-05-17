// src/customer/components/CartDrawer.js
import React from 'react';
import { Drawer, Button, Empty, Typography, Divider } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import useCart from '../hooks/useCart';
import { formatCurrency } from '../../shared/utils/formatters';

const CartDrawer = ({ open, onClose }) => {
  const { items, totalItems, totalPrice, removeItem, updateQuantity } = useCart();
  const navigate = useNavigate();

  return (
    <Drawer
      title={`Giỏ hàng (${totalItems} sản phẩm)`}
      placement="right"
      width={400}
      open={open}
      onClose={onClose}
      footer={
        items.length > 0 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <Typography.Text strong>Tổng tiền:</Typography.Text>
              <Typography.Text strong style={{ color: '#c9a96e', fontSize: 18 }}>{formatCurrency(totalPrice)}</Typography.Text>
            </div>
            <Button type="primary" block size="large" onClick={() => { onClose(); navigate('/checkout'); }}>
              Tiến hành thanh toán
            </Button>
          </div>
        )
      }
    >
      {items.length === 0
        ? <Empty description="Giỏ hàng trống" />
        : items.map((item) => (
          <div key={item.variant_id} style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center' }}>
            <img src={item.image} alt={item.name} style={{ width: 60, height: 80, objectFit: 'cover', borderRadius: 6 }} />
            <div style={{ flex: 1 }}>
              <Typography.Text strong style={{ fontSize: 13 }}>{item.name}</Typography.Text>
              <div style={{ fontSize: 12, color: '#888' }}>{item.color} / {item.size}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <Button size="small" onClick={() => updateQuantity(item.variant_id, item.quantity - 1)}>−</Button>
                <span>{item.quantity}</span>
                <Button size="small" onClick={() => updateQuantity(item.variant_id, item.quantity + 1)}>+</Button>
              </div>
              <div style={{ color: '#c9a96e', fontWeight: 600, marginTop: 4 }}>{formatCurrency(item.price * item.quantity)}</div>
            </div>
            <Button type="text" danger icon={<DeleteOutlined />} onClick={() => removeItem(item.variant_id)} />
          </div>
        ))
      }
    </Drawer>
  );
};

export default CartDrawer;