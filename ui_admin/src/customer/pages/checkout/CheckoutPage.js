import { CheckCircleOutlined, HomeOutlined, TagOutlined } from '@ant-design/icons';
import { Breadcrumb, Button, Card, Col, Divider, Input, Radio, Row, Select, Space, Table, Typography, message } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatCurrency } from '../../../shared/utils/formatters';
import useCart from '../../hooks/useCart';
import { checkoutService } from '../../services/checkoutService';
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

  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null); // Lưu thông tin mã đã áp dụng thành công
  const [couponError, setCouponError] = useState(''); // Lỗi hiển thị màu đỏ
  const [applyingCoupon, setApplyingCoupon] = useState(false); // Trạng thái loading của nút Áp dụng

  const [availableCoupons, setAvailableCoupons] = useState([]);

  // AC-FE-US23-01: Tự động Refetch giỏ hàng mới nhất khi vừa vào trang Checkout
  useEffect(() => {
    loadCart();
    checkoutService.getAvailableCoupons()
      .then(data => setAvailableCoupons(data))
      .catch(err => console.error("Không tải được danh sách voucher", err));
  }, []);

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

  const selectedItems = useMemo(() => {
    return items.filter(item => {
      const id = item.cartItemId ?? item.itemId ?? item.id;
      return selectedItemIds.includes(id);
    });
  }, [items, selectedItemIds]);

  // === TÍNH TOÁN TIỀN THEO AC-FE-US26-01 ===
  const totalAmount = selectedItems.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 0)), 0);
  
  // Lấy số tiền được giảm (nếu có mã hợp lệ), ngược lại là 0
  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  
  // Tổng thanh toán cuối cùng (Không được âm)
  const finalAmount = Math.max(0, totalAmount - discountAmount);

  const rowSelection = {
    selectedRowKeys: selectedItemIds,
    onChange: (selectedRowKeys) => {
      setSelectedItemIds(selectedRowKeys);
    },
  };

  // === HÀM XỬ LÝ VOUCHER (US-26) ===
  // === HÀM XỬ LÝ VOUCHER (CHUẨN THEO MÔ TẢ US-26) ===
  const handleApplyCoupon = async () => {
    if (!couponCodeInput.trim()) {
      setCouponError('Vui lòng nhập mã giảm giá');
      return;
    }
    setCouponError('');
    setApplyingCoupon(true);
    
    try {
      // 1. Gọi API với payload Body theo đúng mô tả: { couponCode, orderAmount }
      const res = await checkoutService.applyCoupon({
        couponCode: couponCodeInput.trim().toUpperCase(),
        orderAmount: totalAmount 
      });
      
      // 2. Xử lý lưu số tiền giảm giá. 
      // (Bắt cả 2 trường hợp tên biến trả về từ BE là discountAmount hoặc discount để không bị lỗi)
      const discountValue = res.discountAmount ?? res.discount ?? 0;

      setAppliedCoupon({
        code: couponCodeInput.trim().toUpperCase(),
        discountAmount: discountValue
      });
      message.success('Áp dụng mã giảm giá thành công!');
      
    } catch (error) {
      // 3. AC-FE-US26-02: Bắt lỗi và hiển thị màu đỏ, giữ nguyên tiền gốc (appliedCoupon = null)
      const errorMsg = error?.response?.data?.message || 'Mã giảm giá không hợp lệ hoặc không đủ điều kiện!';
      setCouponError(errorMsg);
      setAppliedCoupon(null);
    } finally {
      setApplyingCoupon(false);
    }
  };

  // Nút Hủy áp dụng Voucher
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCodeInput('');
    setCouponError('');
  };
  // === XỬ LÝ ĐẶT HÀNG ===
  // === XỬ LÝ ĐẶT HÀNG ===
  const handlePlaceOrder = async () => {
    // 1. CHẠY VALIDATION TRƯỚC TIÊN
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
      // 2. KHAI BÁO PAYLOAD MỘT LẦN DUY NHẤT Ở ĐÂY
      const payload = {
        cartItemIds: selectedItemIds,
        shippingAddress: shippingAddress.trim(),
        paymentMethod: paymentMethod,
        // US-26: Bổ sung couponCode vào Payload gửi xuống Backend
        couponCode: appliedCoupon ? appliedCoupon.code : null
      };

      // 3. GỌI API ĐẶT HÀNG
      const res = await checkoutService.placeOrder(payload);
      
      // Xóa giỏ hàng sau khi đặt thành công
      await loadCart();

      // 4. XỬ LÝ CHUYỂN HƯỚNG THEO PHƯƠNG THỨC THANH TOÁN
      if (paymentMethod === 'MOMO' && res.paymentUrl) {
        message.loading('Đang chuyển hướng sang cổng thanh toán MoMo...', 1.5);
        window.location.href = res.paymentUrl;
        return;
      }

      // Nếu là COD thì chuyển qua trang Confirm
      navigate('/checkout/confirm', { 
        replace: true,
        state: { 
          orderId: res.orderId, 
          totalAmount: res.totalAmount, // Giá cuối cùng BE tính
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
                placeholder="Nhập địa chỉ..." 
                maxLength={500}
                showCount
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
              />
            </Card>

            <Card title="Phương thức thanh toán" bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.05)', marginBottom: 24 }}>
              <Radio.Group value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} style={{ width: '100%' }}>
                <div style={{ border: '1px solid #eaeaea', padding: '12px 16px', borderRadius: 8, background: '#fafafa', marginBottom: 12 }}>
                  <Radio value="COD" style={{ fontWeight: 500 }}>Thanh toán khi nhận hàng (COD)</Radio>
                </div>
                <div style={{ border: '1px solid #eaeaea', padding: '12px 16px', borderRadius: 8, background: '#fafafa' }}>
                  <Radio value="MOMO" style={{ fontWeight: 500 }}>Thanh toán qua Ví điện tử MoMo</Radio>
                </div>
              </Radio.Group>
            </Card>

            <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
              
              {/* === KHU VỰC NHẬP MÃ GIẢM GIÁ (US-26) === */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ marginBottom: 8, fontWeight: 600 }}>Chọn Voucher:</div>
                <Space.Compact style={{ width: '100%' }}>
                  <Select
                    placeholder="Chọn voucher ưu đãi..."
                    style={{ flex: 1 }}
                    disabled={!!appliedCoupon}
                    onChange={(value) => setCouponCodeInput(value)}
                    value={couponCodeInput || undefined}
                    allowClear
                    onClear={() => setCouponCodeInput('')}
                  >
                    {availableCoupons.map(coupon => (
                      <Select.Option key={coupon.couponId} value={coupon.code} disabled={coupon.used}>
                        {coupon.code} - Giảm {coupon.discountValue} {coupon.discountType === 'PERCENTAGE' ? '%' : 'VNĐ'}
                        {coupon.used ? ' (Đã dùng)' : ''}
                      </Select.Option>
                    ))}
                  </Select>
                  
                  {!appliedCoupon ? (
                    <Button type="primary" onClick={handleApplyCoupon} loading={applyingCoupon} style={{ background: '#1a1a1a' }}>
                      Áp dụng
                    </Button>
                  ) : (
                    <Button danger onClick={handleRemoveCoupon}>Hủy</Button>
                  )}
                </Space.Compact>
                
                {couponError && <Text type="danger" style={{ fontSize: 13, marginTop: 6, display: 'block' }}>{couponError}</Text>}
                {appliedCoupon && <Text type="success" style={{ fontSize: 13, marginTop: 6, display: 'block' }}>Áp dụng thành công mã: {appliedCoupon.code}</Text>}
              </div>

              <Divider style={{ margin: '16px 0' }} />

              {/* === TỔNG KẾT CHI PHÍ (AC-FE-US26-01) === */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={{ fontSize: 15, color: '#555' }}>Tổng tiền hàng:</Text>
                <Text style={{ fontSize: 15 }}>{formatCurrency(totalAmount)}</Text>
              </div>

              {appliedCoupon && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text style={{ fontSize: 15, color: '#555' }}>Giảm giá Voucher:</Text>
                  <Text style={{ fontSize: 15, color: '#389e0d' }}>- {formatCurrency(discountAmount)}</Text>
                </div>
              )}
              
              <Divider style={{ margin: '12px 0' }} />
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Title level={5} style={{ margin: 0 }}>Tổng thanh toán:</Title>
                <Title level={3} style={{ margin: 0, color: '#e53935' }}>{formatCurrency(finalAmount)}</Title>
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
