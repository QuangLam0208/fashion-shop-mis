import { EyeOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Table, Tag, Tooltip } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ORDER_STATUS, ORDER_TYPE, PAGE_SIZE, PAYMENT_METHOD } from '../../../shared/constants';
import { formatCurrency, formatDateTime } from '../../../shared/utils/formatters';
import ActionBar from '../../components/ActionBar';
import PageHeader from '../../components/PageHeader';
import SearchBar from '../../components/SearchBar';
import StatusBadge from '../../components/StatusBadge';
import { adminOrderService } from '../../services/orderService';

const OrderListPage = () => {
  const navigate = useNavigate();
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal]     = useState(0);
  const [params, setParams]   = useState({});

  const load = useCallback(async (p = {}) => {
    setLoading(true);
    try { const res = await adminOrderService.getAll(p); setData(res.data); setTotal(res.total); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, []);

  const handleSearch = (vals) => { setParams(vals); load(vals); };
  const handleReset  = ()     => { setParams({});   load({});   };

  const statusOpts = Object.entries(ORDER_STATUS).map(([k,v]) => ({ label: v.label, value: k }));
  const typeOpts   = Object.entries(ORDER_TYPE).map(([k,v])   => ({ label: v, value: k }));

  const columns = [
    { title: 'Mã đơn', dataIndex: 'order_id', render: id => <span style={{ fontWeight:600 }}>#{id}</span>, width: 100 },
    { title: 'Khách hàng', dataIndex: 'customer_name' },
    { title: 'Ngày đặt', dataIndex: 'order_date', render: d => formatDateTime(d) },
    { title: 'Tổng tiền', dataIndex: 'total_amount', render: v => formatCurrency(v), align:'right' },
    { title: 'PTTT', dataIndex: 'payment_method', render: m => PAYMENT_METHOD[m] || m },
    { title: 'Loại', dataIndex: 'type', render: t => <Tag color={t==='OFFLINE'?'purple':'blue'}>{ORDER_TYPE[t]}</Tag> },
    { title: 'Trạng thái', dataIndex: 'status', render: s => <StatusBadge type="order" status={s} /> },
    {
      title: 'Thao tác', key: 'action', fixed: 'right', width: 80,
      render: (_, r) => <Tooltip title="Xem chi tiết"><Button size="small" icon={<EyeOutlined />} onClick={() => navigate(`/admin/orders/${r.order_id}`)} /></Tooltip>,
    },
  ];

  return (
    <div>
      <PageHeader title="Quản lý Đơn hàng" breadcrumbs={[{ label: 'Đơn hàng' }]} />
      <div style={{ background:'#fff', borderRadius:12, padding:'16px 20px', boxShadow:'0 1px 8px rgba(0,0,0,0.08)' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16, flexWrap:'wrap', gap:12 }}>
          <SearchBar
            fields={[
              { name:'keyword', type:'input',  placeholder:'Mã đơn / khách hàng...' },
              { name:'status',  type:'select', placeholder:'Trạng thái', options: statusOpts },
              { name:'type',    type:'select', placeholder:'Loại đơn',   options: typeOpts   },
            ]}
            onSearch={handleSearch} onReset={handleReset} loading={loading}
          />
          <ActionBar
            onAdd={() => navigate('/admin/orders/create')} addLabel="Tạo đơn (POS)"
            extra={<Button icon={<PlusOutlined />} />}
          />
        </div>
        <Table
          dataSource={data} columns={columns} rowKey="order_id"
          loading={loading} pagination={{ pageSize: PAGE_SIZE, total, showTotal: t => `Tổng ${t} đơn hàng` }}
          onRow={r => ({ onClick: () => navigate(`/admin/orders/${r.order_id}`), style: { cursor:'pointer' } })}
          scroll={{ x: 800 }} size="middle"
        />
      </div>
    </div>
  );
};
export default OrderListPage;
