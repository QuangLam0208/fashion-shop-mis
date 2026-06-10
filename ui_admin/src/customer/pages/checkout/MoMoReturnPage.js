import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Result, Button, Card, Typography } from 'antd';
import useCart from '../../hooks/useCart';

const { Text } = Typography;

const MoMoReturnPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loadCart } = useCart();
  const [status, setStatus] = useState('processing'); // 'processing' | 'success' | 'error'

  // Đọc các tham số MoMo trả về trên URL
  const resultCode = searchParams.get('resultCode');
  const message = searchParams.get('message');
  const orderId = searchParams.get('orderId');

  useEffect(() => {
    // resultCode = 0 nghĩa là giao dịch thành công (Theo tài liệu MoMo)
    if (resultCode === '0') {
      setStatus('success');
      // Refetch lại giỏ hàng vì đơn hàng đã thanh toán và trừ item
      loadCart();
    } else if (resultCode) {
      // Các mã lỗi khác 0 (Ví dụ user bấm Hủy, thẻ hết tiền...)
      setStatus('error');
    } else {
      // Fallback: Chặn ai đó cố tình vào thẳng link này mà không có param
      navigate('/', { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resultCode]);

  if (status === 'processing') return null;

  return (
    <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh', padding: '60px 20px' }}>
      <div className="c-container" style={{ maxWidth: 700, margin: '0 auto' }}>
        <Card style={{ borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.06)', border: 'none', padding: '20px 0' }}>
          {status === 'success' ? (
            <Result
              status="success"
              title="Thanh toán MoMo thành công!"
              subTitle={
                <>
                  Đơn hàng <Text strong>#{orderId}</Text> đã được ghi nhận thanh toán. <br />
                  <Text type="secondary">{message}</Text>
                </>
              }
              extra={[
                <Button 
                  key="orders" 
                  type="primary" 
                  size="large" 
                  onClick={() => navigate('/account/orders')} 
                  style={{ borderRadius: 8, background: '#1a1a1a', borderColor: '#1a1a1a' }}
                >
                  Xem đơn mua
                </Button>,
                <Button key="home" size="large" onClick={() => navigate('/')} style={{ borderRadius: 8 }}>
                  Về trang chủ
                </Button>,
              ]}
            />
          ) : (
            <Result
              status="error"
              title="Giao dịch thất bại hoặc đã bị hủy!"
              subTitle={
                <>
                  Đơn hàng <Text strong>#{orderId}</Text> chưa được thanh toán thành công. <br />
                  <Text type="danger">{message}</Text>
                </>
              }
              extra={[
                <Button 
                  key="orders" 
                  type="primary" 
                  size="large" 
                  danger
                  onClick={() => navigate('/account/orders')} 
                  style={{ borderRadius: 8 }}
                >
                  Quản lý đơn hàng
                </Button>,
                <Button key="home" size="large" onClick={() => navigate('/')} style={{ borderRadius: 8 }}>
                  Về trang chủ
                </Button>,
              ]}
            >
              <div style={{ background: '#fafafa', padding: 16, borderRadius: 8, textAlign: 'center' }}>
                <Text type="secondary">
                  Đơn hàng của bạn đã được lưu với trạng thái <strong>Chờ thanh toán</strong>.<br/> 
                  Bạn có thể vào mục "Đơn mua của tôi" để thực hiện thanh toán lại.
                </Text>
              </div>
            </Result>
          )}
        </Card>
      </div>
    </div>
  );
};

export default MoMoReturnPage;