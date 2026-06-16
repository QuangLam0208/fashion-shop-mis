import { CheckCircleOutlined, HomeOutlined, PlusOutlined, WalletOutlined } from '@ant-design/icons';
import { Breadcrumb, Button, Card, Col, Divider, Radio, Row, Select, Space, Table, Typography, message, Spin, Tag, Input } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatCurrency } from '../../../shared/utils/formatters';
import useCart from '../../hooks/useCart';
import { checkoutService } from '../../services/checkoutService';
import { customerProfileService } from '../../services/customerProfileService';
import CouponWalletDrawer from '../../components/CouponWalletDrawer';

const { Text, Title } = Typography;

const CheckoutPage = () => {
  const { items, loadCart } = useCart();
  const navigate = useNavigate();

  const [selectedItemIds, setSelectedItemIds] = useState([]);
  
  // === STATE CHO ĐỊA CHỈ ===
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [loadingAddresses, setLoadingAddresses] = useState(true);

  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [submitting, setSubmitting] = useState(false);

  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [isWalletOpen, setIsWalletOpen] = useState(false);

  useEffect(() => {
    loadCart();
    checkoutService.getAvailableCoupons()
      .then(data => setAvailableCoupons(data))
      .catch(err => console.error("Không tải được danh sách voucher", err));
  }, []);

  useEffect(() => {
    if (items && items.length > 0) {
      const allIds = items.map(item => item.cartItemId ?? item.itemId ?? item.id);
      setSelectedItemIds(allIds);
    }
  }, [items]);

  // === FETCH ĐỊA CHỈ & XỬ LÝ AUTO-SELECT ===
  useEffect(() => {
    const fetchAddresses = async () => {
      setLoadingAddresses(true);
      try {
        const res = await customerProfileService.getAddresses();
        const addressList = res?.data || res || [];
        setAddresses(addressList);
        
        // Auto-select logic
        if (addressList.length > 0) {
          const defaultAddr = addressList.find(a => a.isDefault);
          if (defaultAddr) {
            setSelectedAddressId(defaultAddr.id || defaultAddr.addressId);
          } else {
            setSelectedAddressId(addressList[0].id || addressList[0].addressId);
          }
        }
      } catch (error) {
        message.error('Không thể tải danh sách địa chỉ giao hàng.');
      } finally {
        setLoadingAddresses(false);
      }
    };
    fetchAddresses();
  }, []);

  const selectedItems = useMemo(() => {
    return items.filter(item => {
      const id = item.cartItemId ?? item.itemId ?? item.id;
      return selectedItemIds.includes(id);
    });
  }, [items, selectedItemIds]);

  const totalAmount = selectedItems.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 0)), 0);
  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const finalAmount = Math.max(0, totalAmount - discountAmount);

  const rowSelection = {
    selectedRowKeys: selectedItemIds,
    onChange: (selectedRowKeys) => {
      setSelectedItemIds(selectedRowKeys);
    },
  };

  // THÊM THAM SỐ codeToApply (Tùy chọn)
  const handleApplyCoupon = async (codeToApply = null) => {
    // 1. Lấy mã từ tham số truyền vào (từ Drawer) HOẶC lấy từ ô Input nhập tay
    // LƯU Ý: Phải check typeof string vì sự kiện onClick có thể truyền Event object vào
    const rawCode = typeof codeToApply === 'string' ? codeToApply : couponCodeInput;
    const code = rawCode ? rawCode.trim().toUpperCase() : '';

    if (!code) {
      setCouponError('Vui lòng nhập hoặc chọn mã giảm giá!');
      return;
    }

    setCouponError('');
    setApplyingCoupon(true);
    
    try {
      // Dùng checkoutService (hoặc customerCouponService tùy bạn cấu hình)
      const res = await checkoutService.applyCoupon({
        couponCode: code,
        orderAmount: totalAmount 
      });
      
      const discountValue = res.discountAmount ?? res.discount ?? 0;
      setAppliedCoupon({
        code: code,
        discountAmount: discountValue
      });
      
      setCouponCodeInput(code); // Điền luôn mã vừa chọn vào ô Input cho khách thấy
      setIsWalletOpen(false);   // Tự động cụp Ví Voucher xuống
      
      message.success('Áp dụng mã giảm giá thành công!');
      
    } catch (error) {
      const errorMsg = error?.response?.data?.message || 'Mã giảm giá không hợp lệ hoặc không đủ điều kiện!';
      setCouponError(errorMsg);
      setAppliedCoupon(null);
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCodeInput('');
    setCouponError('');
  };

  const handlePlaceOrder = async () => {
    if (selectedItemIds.length === 0) {
      message.warning('Danh sách sản phẩm thanh toán không được rỗng');
      return;
    }
    if (!selectedAddressId) {
      message.warning('Vui lòng chọn địa chỉ giao hàng');
      return;
    }

    setSubmitting(true);
    try {
      // === CẬP NHẬT PAYLOAD CHUẨN: Dùng addressId thay cho chuỗi text ===
      const payload = {
        cartItemIds: selectedItemIds,
        // addressId: selectedAddressId, 
        shippingAddress: selectedAddressId,
        paymentMethod: paymentMethod,
        couponCode: appliedCoupon ? appliedCoupon.code : null
      };

      const res = await checkoutService.placeOrder(payload);
      await loadCart();

      if (paymentMethod === 'MOMO' && res.paymentUrl) {
        message.loading('Đang chuyển hướng sang cổng thanh toán MoMo...', 1.5);
        window.location.href = res.paymentUrl;
        return;
      }

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
    { title: 'Đơn giá', dataIndex: 'price', align: 'right', render: (price) => formatCurrency(price) },
    { title: 'Số lượng', dataIndex: 'quantity', align: 'center' },
    { title: 'Thành tiền', key: 'total', align: 'right', render: (_, record) => <strong style={{ color: '#e53935' }}>{formatCurrency(record.price * record.quantity)}</strong> }
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
              
              {/* === HIỂN THỊ DANH SÁCH ĐỊA CHỈ HOẶC EMPTY STATE === */}
              {loadingAddresses ? (
                <div style={{ textAlign: 'center', padding: '20px 0' }}><Spin /></div>
              ) : addresses.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '16px 0', background: '#fafafa', border: '1px dashed #d9d9d9', borderRadius: 8 }}>
                  <Text style={{ display: 'block', marginBottom: 12, color: '#666' }}>Bạn chưa có địa chỉ giao hàng</Text>
                  <Button type="primary" ghost icon={<PlusOutlined />} onClick={() => navigate('/account/profile')}>
                    Thêm địa chỉ mới
                  </Button>
                </div>
              ) : (
                <Select
                  style={{ width: '100%' }}
                  value={selectedAddressId}
                  onChange={setSelectedAddressId}
                  placeholder="Chọn địa chỉ giao hàng"
                  optionLabelProp="label"
                  size="large"
                >
                  {addresses.map(addr => (
                    <Select.Option 
                      key={addr.id || addr.addressId} 
                      value={addr.id || addr.addressId} 
                      label={`${addr.receiverName} - ${addr.receiverPhone}`}
                    >
                      <div style={{ padding: '4px 0' }}>
                        <div style={{ fontWeight: 600, color: '#1a1a1a' }}>
                          {addr.receiverName} - {addr.receiverPhone}
                          {addr.isDefault && <Tag color="blue" style={{ marginLeft: 8 }}>Mặc định</Tag>}
                        </div>
                        <div style={{ fontSize: 13, color: '#666', marginTop: 4, whiteSpace: 'normal', lineHeight: '1.4' }}>
                          {addr.fullAddress}
                        </div>
                      </div>
                    </Select.Option>
                  ))}
                </Select>
              )}
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
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontWeight: 600 }}>Mã Giảm Giá</span>
                  <a onClick={() => setIsWalletOpen(true)} style={{ color: '#1677ff', fontSize: 13, fontWeight: 500 }}>
                    <WalletOutlined /> Chọn từ Ví Voucher
                  </a>
                </div>
                
                <Space.Compact style={{ width: '100%' }}>
                  <Input
                    placeholder="Nhập mã giảm giá..."
                    value={couponCodeInput}
                    onChange={(e) => setCouponCodeInput(e.target.value)}
                    disabled={!!appliedCoupon}
                    onPressEnter={() => handleApplyCoupon()}
                  />
                  {!appliedCoupon ? (
                    <Button type="primary" onClick={() => handleApplyCoupon()} loading={applyingCoupon} style={{ background: '#1a1a1a' }}>Áp dụng</Button>
                  ) : (
                    <Button danger onClick={handleRemoveCoupon}>Hủy</Button>
                  )}
                </Space.Compact>
                
                {couponError && <Text type="danger" style={{ fontSize: 13, marginTop: 6, display: 'block' }}>{couponError}</Text>}
                {appliedCoupon && <Text type="success" style={{ fontSize: 13, marginTop: 6, display: 'block' }}>Đã áp dụng mã: {appliedCoupon.code}</Text>}
              </div>

              <Divider style={{ margin: '16px 0' }} />

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
      <CouponWalletDrawer 
        open={isWalletOpen} 
        onClose={() => setIsWalletOpen(false)} 
        cartTotal={totalAmount} 
        onApplyCoupon={handleApplyCoupon} 
      />
    </div>
  );
};

export default CheckoutPage;