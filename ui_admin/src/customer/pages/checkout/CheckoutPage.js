import React, { useState, useEffect, useMemo } from 'react';
import { Card, Row, Col, Table, Input, Radio, Button, Typography, Space, message, Breadcrumb, Divider } from 'antd';
import { HomeOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import useCart from '../../hooks/useCart';
import { checkoutService } from '../../services/checkoutService';
import { formatCurrency } from '../../../shared/utils/formatters';
import { customerProfileService } from '../../services/customerProfileService'; 

const { Text, Title } = Typography;
const { TextArea } = Input;

const CheckoutPage = () => {
  const { items, loadCart } = useCart();
  const navigate = useNavigate();

  const [selectedItemIds, setSelectedItemIds] = useState([]);
  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [submitting, setSubmitting] = useState(false);

  // Khởi tạo: Mặc định chọn tất cả item trong giỏ hàng
  useEffect(() => {
    if (items && items.length > 0) {
      const allIds = items.map(item => item.cartItemId ?? item.itemId ?? item.id);
      setSelectedItemIds(allIds);
    }
  }, [items]);

  useEffect(() => {
    const fetchDefaultAddress = async () => {
      try {
        const addresses = await customerProfileService.getAddresses();
        const defaultAddr = addresses.find(a => a.isDefault);
        if (defaultAddr) {
          setShippingAddress(`${defaultAddr.receiverName} - ${defaultAddr.receiverPhone} - ${defaultAddr.fullAddress}`);
        }
      } catch (error) {
        message.error('Không thể tải địa chỉ giao hàng. Vui lòng nhập thủ công.');
      }
    };
    fetchDefaultAddress();
  }, []);

  // Lọc ra các item đang được chọn để tính tổng tiền
  const selectedItems = useMemo(() => {
    return items.filter(item => {
      const id = item.cartItemId ?? item.itemId ?? item.id;
      return selectedItemIds.includes(id);
    });
  }, [items, selectedItemIds]);

  const totalAmount = selectedItems.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 0)), 0);

  // Xử lý thay đổi checkbox
  const rowSelection = {
    selectedRowKeys: selectedItemIds,
    onChange: (selectedRowKeys) => {
      setSelectedItemIds(selectedRowKeys);
    },
  };

  const handlePlaceOrder = async () => {
    // AC-US23-02: Validation
    if (selectedItemIds.length === 0) {
      message.warning('Danh sách sản phẩm thanh toán không được rỗng');
      return;
    }
    if (!shippingAddress || shippingAddress.trim() === '') {
      message.warning('Địa chỉ giao hàng không được để trống');
      return;
    }
    if (shippingAddress.length > 500) {
      message.warning('Địa chỉ giao hàng tối đa 500 ký tự');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        cartItemIds: selectedItemIds,
        shippingAddress: shippingAddress.trim(),
        paymentMethod: paymentMethod
      };

      const res = await checkoutService.placeOrder(payload);
      
      // Xóa các item đã mua thành công khỏi giỏ hàng
      await loadCart();

      // Chuyển hướng sang trang thành công (Truyền state để trang đích hiển thị)
      navigate('/checkout/confirm', { 
        replace: true,
        state: { 
          orderId: res.orderId, 
          totalAmount: res.totalAmount,
          status: res.status,
          message: res.message || 'Đặt hàng thành công!'
        } 
      });

    } catch (error) {
      const errorMsg = error?.response?.data?.message || 'Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại!';
      message.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      title: 'Sản phẩm',
      key: 'product',
      render: (_, record) => {
        const img = record.primaryImageUrl || record.image || 'https://placehold.co/60x60?text=No+Image';
        return (
          <Space>
            <img src={img} alt="img" style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 6 }} />
            <div>
              <div style={{ fontWeight: 600 }}>{record.productName || record.name}</div>
              <div style={{ fontSize: 12, color: '#888' }}>
                Phân loại: {record.color} {record.size ? `/ ${record.size}` : ''}
              </div>
            </div>
          </Space>
        );
      }
    },
    {
      title: 'Đơn giá',
      dataIndex: 'price',
      align: 'right',
      render: (price) => formatCurrency(price)
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      align: 'center'
    },
    {
      title: 'Thành tiền',
      key: 'total',
      align: 'right',
      render: (_, record) => <strong style={{ color: '#e53935' }}>{formatCurrency(record.price * record.quantity)}</strong>
    }
  ];

  return (
    <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh', paddingBottom: 60 }}>
      <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #eaeaea', padding: '16px 0', marginBottom: 32 }}>
        <div className="c-container">
          <Breadcrumb>
            <Breadcrumb.Item><Link to="/"><HomeOutlined /> Trang chủ</Link></Breadcrumb.Item>
            <Breadcrumb.Item>Thanh toán</Breadcrumb.Item>
          </Breadcrumb>
        </div>
      </div>

      <div className="c-container">
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            <Card title="Sản phẩm thanh toán" bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
              <Table 
                rowSelection={rowSelection}
                dataSource={items}
                columns={columns}
                rowKey={(record) => record.cartItemId ?? record.itemId ?? record.id}
                pagination={false}
              />
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card title="Thông tin giao hàng" bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.05)', marginBottom: 24 }}>
              <div style={{ marginBottom: 8, fontWeight: 600 }}>Địa chỉ nhận hàng <span style={{ color: 'red' }}>*</span></div>
              <TextArea 
                rows={4} 
                placeholder="Nhập địa chỉ giao hàng của bạn (Số nhà, Tên đường, Phường/Xã, Quận/Huyện, Tỉnh/TP)" 
                maxLength={500}
                showCount
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
              />
            </Card>

            <Card title="Phương thức thanh toán" bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.05)', marginBottom: 24 }}>
              <Radio.Group value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} style={{ width: '100%' }}>
                <div style={{ border: '1px solid #eaeaea', padding: '12px 16px', borderRadius: 8, background: '#fafafa' }}>
                  <Radio value="COD" style={{ fontWeight: 500 }}>Thanh toán khi nhận hàng (COD)</Radio>
                </div>
                {/* Sprint 4 chỉ demo COD, các option khác disabled */}
                <div style={{ border: '1px solid #eaeaea', padding: '12px 16px', borderRadius: 8, marginTop: 12, opacity: 0.5 }}>
                  <Radio value="VNPAY" disabled>Thanh toán qua VNPAY</Radio>
                </div>
              </Radio.Group>
            </Card>

            <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <Text style={{ fontSize: 16 }}>Tổng tiền hàng:</Text>
                <Text style={{ fontSize: 16, fontWeight: 600 }}>{formatCurrency(totalAmount)}</Text>
              </div>
              <Divider style={{ margin: '12px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Title level={5} style={{ margin: 0 }}>Tổng thanh toán:</Title>
                <Title level={3} style={{ margin: 0, color: '#e53935' }}>{formatCurrency(totalAmount)}</Title>
              </div>

              <Button 
                type="primary" 
                size="large" 
                block 
                icon={<CheckCircleOutlined />}
                loading={submitting}
                onClick={handlePlaceOrder}
                style={{ height: 50, borderRadius: 8, background: '#1a1a1a', borderColor: '#1a1a1a', fontWeight: 700, fontSize: 16 }}
              >
                ĐẶT HÀNG
              </Button>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default CheckoutPage;