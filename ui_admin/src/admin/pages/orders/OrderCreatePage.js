import { DeleteOutlined, SearchOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { Button, Card, Col, Divider, Empty, Input, InputNumber, Row, Select, Space, Table, message } from 'antd';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import { PAYMENT_METHOD } from '../../../shared/constants';
import { adminOrderService } from '../../services/orderService';
import { adminProductService } from '../../services/productService';
import { formatCurrency } from '../../../shared/utils/formatters';

const OrderCreatePage = () => {
  const navigate = useNavigate();
  const [keyword,   setKeyword]   = useState('');
  const [products,  setProducts]  = useState([]);
  const [searching, setSearching] = useState(false);
  const [cart,      setCart]      = useState([]);
  const [customer,  setCustomer]  = useState('');
  const [phone,     setPhone]     = useState('');
  const [payMethod, setPayMethod] = useState('COD');
  const [submitting, setSubmitting] = useState(false);

  const handleSearch = async () => {
    if (!keyword.trim()) return;
    setSearching(true);
    try { const res = await adminProductService.getAll({ keyword, status:'ACTIVE' }); setProducts(res.data); }
    finally { setSearching(false); }
  };

  const addToCart = (product, variant) => {
    const key = `${product.product_id}-${variant.variant_id}`;
    setCart(prev => {
      const exist = prev.find(i => i.key === key);
      if (exist) return prev.map(i => i.key === key ? { ...i, qty: Math.min(i.qty + 1, variant.stock_quantity) } : i);
      return [...prev, { key, product_id: product.product_id, variant_id: variant.variant_id, name: product.name, color: variant.color, size: variant.size, price: variant.price, maxQty: variant.stock_quantity, qty: 1 }];
    });
  };

  const removeFromCart = (key) => setCart(prev => prev.filter(i => i.key !== key));
  const updateQty = (key, qty) => setCart(prev => prev.map(i => i.key === key ? { ...i, qty } : i));

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

  const handleSubmit = async () => {
    if (cart.length === 0) { message.warning('Giỏ hàng trống'); return; }
    setSubmitting(true);
    try {
      const res = await adminOrderService.create({
        customer_name: customer || 'Khách lẻ',
        phone, payment_method: payMethod, type: 'OFFLINE', status: 'COMPLETED',
        total_amount: total,
        items: cart.map(i => ({ variant_id: i.variant_id, quantity: i.qty, price: i.price, product_name: i.name })),
      });
      message.success(`Tạo đơn #${res.order_id} thành công!`);
      navigate(`/admin/orders/${res.order_id}`);
    } catch { message.error('Tạo đơn thất bại'); }
    finally { setSubmitting(false); }
  };

  const productCols = [
    { title: 'Sản phẩm', dataIndex: 'name', render: (n, r) => <div><div style={{fontWeight:600}}>{n}</div><div style={{fontSize:12,color:'#94a3b8'}}>{r.category_name}</div></div> },
    {
      title: 'Variants', dataIndex: 'variants',
      render: (vs, r) => (
        <Space wrap>
          {vs?.filter(v => v.stock_quantity > 0).map(v => (
            <Button key={v.variant_id} size="small" onClick={() => addToCart(r, v)} style={{ fontSize:11 }}>
              {v.color}/{v.size} — {formatCurrency(v.price)} (còn {v.stock_quantity})
            </Button>
          ))}
        </Space>
      ),
    },
  ];

  const cartCols = [
    { title: 'Sản phẩm', render: (_, r) => `${r.name} (${r.color}/${r.size})` },
    { title: 'Đơn giá', dataIndex:'price', render: v => formatCurrency(v), align:'right', width:120 },
    { title: 'SL', dataIndex:'qty', width:100, render: (v, r) => <InputNumber size="small" min={1} max={r.maxQty} value={v} onChange={val => updateQty(r.key, val)} /> },
    { title: 'Thành tiền', render: (_, r) => <strong>{formatCurrency(r.price * r.qty)}</strong>, align:'right', width:130 },
    { title: '', width:40, render: (_, r) => <Button size="small" type="text" danger icon={<DeleteOutlined />} onClick={() => removeFromCart(r.key)} /> },
  ];

  return (
    <div>
      <PageHeader title="Tạo đơn hàng tại quầy (POS)" breadcrumbs={[{ label:'Đơn hàng', path:'/admin/orders' }, { label:'Tạo đơn POS' }]} />
      <Row gutter={[16,16]}>
        <Col xs={24} lg={14}>
          <Card title="Tìm kiếm sản phẩm" style={{ borderRadius:12, border:'none', boxShadow:'0 1px 8px rgba(0,0,0,0.08)' }}>
            <Input.Search
              placeholder="Nhập tên sản phẩm..." value={keyword}
              onChange={e => setKeyword(e.target.value)}
              onSearch={handleSearch} loading={searching}
              enterButton={<Button icon={<SearchOutlined />} type="primary">Tìm</Button>}
              style={{ marginBottom:16 }}
            />
            {products.length > 0
              ? <Table dataSource={products} columns={productCols} rowKey="product_id" pagination={false} size="small" />
              : <Empty description="Tìm kiếm sản phẩm để thêm vào đơn" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            }
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title={<span><ShoppingCartOutlined /> Đơn hàng ({cart.length} sản phẩm)</span>}
            style={{ borderRadius:12, border:'none', boxShadow:'0 1px 8px rgba(0,0,0,0.08)' }}>
            <Space direction="vertical" style={{ width:'100%', marginBottom:12 }}>
              <Input placeholder="Tên khách hàng (tuỳ chọn)" value={customer} onChange={e => setCustomer(e.target.value)} />
              <Input placeholder="Số điện thoại (tuỳ chọn)" value={phone} onChange={e => setPhone(e.target.value)} />
              <Select options={Object.entries(PAYMENT_METHOD).map(([k,v])=>({label:v,value:k}))} value={payMethod} onChange={setPayMethod} style={{ width:'100%' }} placeholder="Phương thức thanh toán" />
            </Space>
            {cart.length > 0
              ? <Table dataSource={cart} columns={cartCols} rowKey="key" pagination={false} size="small" />
              : <Empty description="Chưa có sản phẩm" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            }
            <Divider />
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:16 }}>
              <strong>Tổng cộng:</strong>
              <strong style={{ fontSize:18, color:'#6366f1' }}>{formatCurrency(total)}</strong>
            </div>
            <Button type="primary" block size="large" onClick={handleSubmit} loading={submitting} disabled={cart.length===0}
              style={{ background:'linear-gradient(135deg,#6366f1,#8b5cf6)', border:'none', borderRadius:8, height:48, fontWeight:600 }}>
              Xác nhận & Tạo đơn
            </Button>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
export default OrderCreatePage;
