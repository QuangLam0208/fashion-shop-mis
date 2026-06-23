import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Input, Button, Table, Select, Modal, message, Typography, Space, Spin, List, Tag } from 'antd';
import { ShoppingCartOutlined, PlusOutlined, MinusOutlined, DeleteOutlined } from '@ant-design/icons';
import { posService } from '../../services/posService';
import { formatCurrency } from '../../../shared/utils/formatters';
import { adminProductService } from '../../services/productService';
import { orderService } from '../../services/orderService';


const { Title, Text } = Typography;

const POSPage = () => {
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [keyword, setKeyword] = useState('');

  const [variantModalOpen, setVariantModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [cart, setCart] = useState([]);
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line
  }, []);

  const fetchProducts = async (search = '') => {
    setLoadingProducts(true);
    try {
      // Gọi đúng hàm getProducts (hoặc getAll nếu trong file productService.js của bạn định nghĩa là getAll)
      const res = await adminProductService.getAll({ page: 0, size: 50, keyword: search });
      setProducts(res?.content || res?.data?.content || []);
    } catch (error) {
      message.error('Không tải được danh sách sản phẩm');
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleSearch = (value) => {
    setKeyword(value);
    fetchProducts(value);
  };

  const handleSelectProduct = async (product) => {
    try {
      message.loading({ content: 'Đang tải phân loại...', key: 'loadVariant' });
      
      const targetId = product.productId || product.id; 
      
      if (!targetId) {
         message.destroy('loadVariant');
         return message.error('Dữ liệu sản phẩm bị lỗi (Thiếu ID)');
      }

      // Gọi đúng hàm getById
      const res = await adminProductService.getById(targetId);
      const fullProduct = res?.data || res;

      message.destroy('loadVariant');

      if (!fullProduct.variants || fullProduct.variants.length === 0) {
        return message.warning('Sản phẩm này hiện chưa có phân loại hàng!');
      }

      setSelectedProduct(fullProduct);
      setVariantModalOpen(true);
    } catch (error) {
      message.destroy('loadVariant');
      message.error('Không thể lấy thông tin chi tiết sản phẩm');
    }
  };

  // SỬA LỖI 2: Check linh hoạt variant.id hoặc variant.variantId
  const handleAddToCart = (variant) => {
    if (variant.stockQuantity <= 0) {
      return message.error('Biến thể này đã hết hàng!');
    }

    const vId = variant.id || variant.variantId; // Lấy ID an toàn

    const existingItem = cart.find(item => item.variantId === vId);
    
    if (existingItem) {
      if (existingItem.quantity + 1 > variant.stockQuantity) {
        return message.warning(`Tồn kho chỉ còn ${variant.stockQuantity} sản phẩm!`);
      }
      setCart(cart.map(item => item.variantId === vId ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, {
        variantId: vId,
        productId: selectedProduct.id,
        name: selectedProduct.name,
        color: variant.color,
        size: variant.size,
        price: variant.price,
        quantity: 1,
        maxStock: variant.stockQuantity,
      }]);
    }
    message.success('Đã thêm vào hóa đơn');
    setVariantModalOpen(false);
  };

  const updateQuantity = (variantId, delta) => {
    setCart(cart.map(item => {
      if (item.variantId === variantId) {
        const newQ = item.quantity + delta;
        if (newQ > item.maxStock) {
          message.warning(`Tồn kho chỉ còn ${item.maxStock}`);
          return item;
        }
        if (newQ < 1) return item;
        return { ...item, quantity: newQ };
      }
      return item;
    }));
  };

  const removeCartItem = (variantId) => {
    setCart(cart.filter(item => item.variantId !== variantId));
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleSubmitOrder = async () => {
    if (cart.length === 0) return message.warning('Hóa đơn đang trống!');
    if (customerPhone && !/^0\d{9}$/.test(customerPhone)) {
      return message.error('Số điện thoại không hợp lệ (10 số, bắt đầu bằng 0)!');
    }

    setSubmitting(true);
    try {
      const payload = {
        customerPhone: customerPhone || null,
        paymentMethod: paymentMethod,
        items: cart.map(item => ({ productVariantId: item.variantId, quantity: item.quantity }))
      };

      const res = await posService.createOfflineSale(payload);
      
      message.success('Ghi nhận hóa đơn thành công!');
      
      // SỬA LỖI 3: Lấy ID Hóa đơn an toàn để in PDF
      const orderId = res?.data?.orderId || res?.orderId || res?.data?.id || res?.id;

      Modal.success({
        title: 'Thanh toán hoàn tất!',
        content: `Mã đơn hàng: ORD-${orderId || 'N/A'}. Bạn có muốn xuất hóa đơn cho khách không?`,
        okText: 'In hóa đơn (PDF)',
        cancelText: 'Đóng',
        closable: true,
        onOk: async () => {
          if (!orderId) return;
          try {
            message.loading({ content: 'Đang tải PDF...', key: 'posPdf' });
            const blob = await orderService.exportInvoicePDF(orderId);
            const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
            window.open(url, '_blank');
            message.success({ content: 'Đã mở hóa đơn!', key: 'posPdf' });
          } catch (err) {
            message.error({ content: 'Không thể in hóa đơn lúc này.', key: 'posPdf' });
          }
        }
      });

      // Clear form
      setCart([]);
      setCustomerPhone('');
      fetchProducts(keyword);
    } catch (error) {
      message.error(error?.response?.data?.message || 'Có lỗi xảy ra khi tạo đơn!');
    } finally {
      setSubmitting(false);
    }
  };

  const cartColumns = [
    {
      title: 'Sản phẩm', key: 'name',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.name}</div>
          <div style={{ fontSize: 12, color: '#888' }}>{record.color} - {record.size}</div>
        </div>
      )
    },
    {
      title: 'SL', key: 'quantity', width: 100, align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Button size="small" icon={<MinusOutlined />} onClick={() => updateQuantity(record.variantId, -1)} />
          <Text strong>{record.quantity}</Text>
          <Button size="small" icon={<PlusOutlined />} onClick={() => updateQuantity(record.variantId, 1)} />
        </Space>
      )
    },
    { title: 'Tạm tính', key: 'total', align: 'right', render: (_, record) => <strong>{formatCurrency(record.price * record.quantity)}</strong> },
    {
      title: '', key: 'action', width: 50, align: 'center',
      render: (_, record) => <Button type="text" danger icon={<DeleteOutlined />} onClick={() => removeCartItem(record.variantId)} />
    }
  ];

  return (
    <div style={{ padding: 24, height: 'calc(100vh - 64px)', overflow: 'hidden' }}>
      <Row gutter={24} style={{ height: '100%' }}>
        <Col span={14} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Card title="Sản phẩm tại quầy" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }} bodyStyle={{ flex: 1, overflow: 'auto', padding: 16 }}>
            <Input.Search 
              size="large" 
              placeholder="Nhập tên sản phẩm hoặc mã..." 
              onSearch={handleSearch} 
              style={{ marginBottom: 16 }} 
              allowClear
            />
            {loadingProducts ? <div style={{ textAlign: 'center', padding: 50 }}><Spin /></div> : (
              <List
                grid={{ gutter: 16, xs: 1, sm: 2, md: 3 }}
                dataSource={products}
                renderItem={item => (
                  <List.Item>
                    <Card 
                      hoverable 
                      onClick={() => handleSelectProduct(item)}
                      style={{ borderRadius: 8, borderColor: '#f0f0f0' }}
                      // Sửa lỗi hiển thị ảnh linh hoạt
                      cover={<img alt="img" src={item.primaryImageUrl || item.images?.[0]?.url || 'https://placehold.co/200'} style={{ height: 140, objectFit: 'cover' }} />}
                    >
                      <Card.Meta 
                        title={<Text ellipsis title={item.name}>{item.name}</Text>} 
                        description={<Text strong color="#e53935">{formatCurrency(item.price)}</Text>} 
                      />
                    </Card>
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>

        <Col span={10} style={{ height: '100%' }}>
          <Card title={<span><ShoppingCartOutlined /> Hóa đơn thanh toán</span>} style={{ height: '100%', display: 'flex', flexDirection: 'column' }} bodyStyle={{ display: 'flex', flexDirection: 'column', height: '100%', padding: 0 }}>
            <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
              <Table dataSource={cart} columns={cartColumns} rowKey="variantId" pagination={false} size="small" />
            </div>

            <div style={{ borderTop: '1px solid #f0f0f0', padding: 24, background: '#fafafa' }}>
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <Input 
                  placeholder="Số điện thoại khách hàng (Tùy chọn)" 
                  value={customerPhone} 
                  onChange={e => setCustomerPhone(e.target.value)} 
                  size="large"
                />

                <Select value={paymentMethod} onChange={setPaymentMethod} size="large" style={{ width: '100%' }}>
                  <Select.Option value="COD">Tiền mặt</Select.Option>
                  <Select.Option value="BANK_TRANSFER">Chuyển khoản / Quẹt thẻ</Select.Option>
                </Select>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '8px 0' }}>
                  <Text style={{ fontSize: 18 }}>Tổng thanh toán:</Text>
                  <Title level={2} style={{ margin: 0, color: '#e53935' }}>{formatCurrency(totalAmount)}</Title>
                </div>

                <Button 
                  type="primary" 
                  size="large" 
                  block 
                  style={{ height: 56, fontSize: 18, background: '#10b981', borderColor: '#10b981' }}
                  onClick={handleSubmitOrder}
                  loading={submitting}
                >
                  HOÀN TẤT HÓA ĐƠN
                </Button>
              </Space>
            </div>
          </Card>
        </Col>
      </Row>

      <Modal title={`Chọn phân loại: ${selectedProduct?.name}`} open={variantModalOpen} onCancel={() => setVariantModalOpen(false)} footer={null}>
        <List
          dataSource={selectedProduct?.variants || []}
          renderItem={variant => {
            const outOfStock = variant.stockQuantity <= 0;
            return (
              <List.Item
                actions={[
                  <Button type="primary" disabled={outOfStock} onClick={() => handleAddToCart(variant)}>Thêm</Button>
                ]}
              >
                <List.Item.Meta
                  title={`${variant.color} - ${variant.size}`}
                  description={
                    <Space>
                      <Text strong>{formatCurrency(variant.price)}</Text>
                      <Tag color={outOfStock ? 'red' : 'green'}>Tồn kho: {variant.stockQuantity}</Tag>
                    </Space>
                  }
                />
              </List.Item>
            );
          }}
        />
      </Modal>
    </div>
  );
};

export default POSPage;