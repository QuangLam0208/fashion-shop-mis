import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button, Card, Typography, Space, message } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { formatCurrency } from '../../../shared/utils/formatters';
import axiosInstance from '../../../shared/config/axiosInstance'; // Bổ sung import này

const { Title, Text } = Typography;

const MockMoMoPage = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  
  const orderId = searchParams.get('orderId');
  const amount = searchParams.get('amount') || 0;

  // === CẬP NHẬT LẠI HÀM NÀY ===
  const handleSuccess = async () => {
    setLoading(true);
    try {
      // Đã sửa: Bổ sung thêm paymentMethod: 'MOMO' cho khớp với DTO của Backend
      await axiosInstance.post('/api/payments/process', {
        orderId: parseInt(orderId),
        paymentMethod: 'MOMO' // Thêm dòng này
      });

      // Sau khi DB cập nhật xong, đá người dùng về trang Kết quả
      window.location.href = `/checkout/payment-result?resultCode=0&orderId=${orderId}&message=Giao+dich+thanh+cong`;
    } catch (error) {
      // Nếu API lỗi (VD: thiếu data), nó sẽ văng vào đây
      message.error('Có lỗi xảy ra khi cập nhật thanh toán với Backend!');
      setLoading(false);
    }
  };

  const handleFail = () => {
    window.location.href = `/checkout/payment-result?resultCode=1006&orderId=${orderId}&message=Nguoi+dung+huy+giao+dich`;
  };

  return (
    <div style={{ backgroundColor: '#a50064', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Card style={{ width: 450, textAlign: 'center', borderRadius: 16, boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
        <img src="https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png" alt="MoMo" style={{ width: 60, marginBottom: 16 }} />
        <Title level={4} style={{ color: '#a50064', marginTop: 0 }}>CỔNG THANH TOÁN (MOCK)</Title>
        <Text type="secondary">Đây là môi trường giả lập (Sandbox) cho Developer</Text>
        
        <div style={{ margin: '32px 0', padding: '20px', background: '#f9f9f9', borderRadius: 12 }}>
          <Text style={{ fontSize: 16 }}>Số tiền thanh toán:</Text>
          <Title level={2} style={{ margin: '8px 0', color: '#000' }}>
            {formatCurrency(amount)}
          </Title>
          <Text type="secondary">Mã đơn hàng: <strong>#{orderId}</strong></Text>
        </div>

        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Button 
            type="primary" 
            size="large" 
            block 
            icon={<CheckCircleOutlined />}
            onClick={handleSuccess} 
            loading={loading} // Thêm loading cho mượt
            style={{ background: '#a50064', borderColor: '#a50064', height: 50, fontWeight: 'bold' }}
          >
            MÔ PHỎNG: THANH TOÁN THÀNH CÔNG
          </Button>
          <Button 
            size="large" 
            block 
            danger 
            icon={<CloseCircleOutlined />}
            onClick={handleFail}
            disabled={loading}
            style={{ height: 50 }}
          >
            MÔ PHỎNG: HỦY GIAO DỊCH
          </Button>
        </Space>
      </Card>
    </div>
  );
};

export default MockMoMoPage;