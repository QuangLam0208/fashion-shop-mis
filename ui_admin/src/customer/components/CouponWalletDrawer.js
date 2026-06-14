import React, { useState, useEffect } from 'react';
import { Drawer, List, Button, Tag, Typography, message, Empty, Spin } from 'antd';
import { customerCouponService } from '../services/customerCouponService';
import { formatCurrency, formatDateTime } from '../../shared/utils/formatters';

const { Text } = Typography;

const CouponWalletDrawer = ({ open, onClose, cartTotal, onApplyCoupon }) => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) fetchWalletCoupons();
  }, [open]);

  const fetchWalletCoupons = async () => {
    setLoading(true);
    try {
      const data = await customerCouponService.getWalletCoupons();
      setCoupons(data || []);
    } catch (error) {
      message.error('Không thể tải ví voucher của bạn');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer title="Ví Voucher Của Tôi" placement="right" onClose={onClose} open={open} width={400}>
      {loading ? (
        <div style={{ textAlign: 'center', padding: 50 }}><Spin /></div>
      ) : coupons.length === 0 ? (
        // AC-FE-US39-06: Empty Wallet State
        <Empty description="Bạn chưa lưu mã giảm giá nào trong ví." />
      ) : (
        <List
          dataSource={coupons}
          renderItem={coupon => {
            // Xác định xem giỏ hàng hiện tại có đủ mức giá tối thiểu để dùng mã này không
            const isEligible = cartTotal >= (coupon.minOrderAmount || 0);
            
            return (
              // AC-FE-US39-02: Làm mờ nếu không đủ điều kiện (Checkout Eligibility Display)
              <List.Item style={{ opacity: isEligible ? 1 : 0.4, borderBottom: '1px solid #f0f0f0', padding: '16px 0' }}>
                <div style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text strong style={{ fontSize: 16, color: '#e53935' }}>{coupon.code}</Text>
                    <Tag color="magenta">Giảm {coupon.discountType === 'PERCENTAGE' ? `${coupon.discountValue}%` : formatCurrency(coupon.discountValue)}</Tag>
                  </div>
                  
                  <div style={{ marginTop: 8, fontSize: 13, color: '#555' }}>
                    <p style={{ margin: 0 }}>Đơn tối thiểu: {formatCurrency(coupon.minOrderAmount)}</p>
                    <p style={{ margin: 0 }}>HSD: {formatDateTime(coupon.expiryDate)}</p>
                  </div>
                  
                  {!isEligible && (
                    <Text type="danger" style={{ fontSize: 12, display: 'block', marginTop: 4, fontWeight: 500 }}>
                      Minimum order value requirement not met.
                    </Text>
                  )}
                  
                  <Button 
                    type="primary" 
                    size="small" 
                    style={{ marginTop: 12, background: '#1a1a1a' }} 
                    disabled={!isEligible}
                    onClick={() => onApplyCoupon(coupon.code)}
                  >
                    Áp dụng mã
                  </Button>
                </div>
              </List.Item>
            );
          }}
        />
      )}
    </Drawer>
  );
};

export default CouponWalletDrawer;