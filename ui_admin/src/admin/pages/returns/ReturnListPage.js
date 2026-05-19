import { EyeOutlined } from '@ant-design/icons';
import { Button, Table, Tooltip } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PAGE_SIZE, RETURN_STATUS } from '../../../shared/constants';
import PageHeader from '../../components/PageHeader';
import SearchBar from '../../components/SearchBar';
import StatusBadge from '../../components/StatusBadge';
import { adminReturnService } from '../../services/returnService';
import { formatDateTime } from '../../../shared/utils/formatters';

const ReturnListPage = () => {
  const navigate = useNavigate();
  const [data,    setData]    = useState([]);
  const [loading, setLoading] = useState(false);
  const [total,   setTotal]   = useState(0);

  const load = useCallback(async (p = {}) => {
    setLoading(true);
    try { const res = await adminReturnService.getAll(p); setData(res.data); setTotal(res.total); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, []);

  const statusOpts = Object.entries(RETURN_STATUS).map(([k,v]) => ({ label: v.label, value: k }));

  const columns = [
    { title: 'Mã YC', dataIndex: 'return_request_id', render: id => `#${id}`, width:80 },
    { title: 'Khách hàng', dataIndex: 'customer_name' },
    { title: 'Đơn hàng', dataIndex: 'order_id', render: id => `#${id}` },
    { title: 'Lý do', dataIndex: 'reason' },
    { title: 'Ngày YC', dataIndex: 'request_date', render: d => formatDateTime(d) },
    { title: 'Trạng thái', dataIndex: 'status', render: s => <StatusBadge type="return" status={s} /> },
    { title: 'Thao tác', key:'action', fixed:'right', width:80,
      render: (_,r) => <Tooltip title="Xem chi tiết"><Button size="small" icon={<EyeOutlined />} onClick={() => navigate(`/admin/returns/${r.return_request_id}`)} /></Tooltip> },
  ];

  return (
    <div>
      <PageHeader title="Quản lý Trả hàng" breadcrumbs={[{ label:'Trả hàng' }]} />
      <div style={{ background:'#fff', borderRadius:12, padding:'16px 20px', boxShadow:'0 1px 8px rgba(0,0,0,0.08)' }}>
        <div style={{ marginBottom:16 }}>
          <SearchBar fields={[{ name:'status', type:'select', placeholder:'Trạng thái', options: statusOpts }]}
            onSearch={p => load(p)} onReset={() => load()} loading={loading} />
        </div>
        <Table dataSource={data} columns={columns} rowKey="return_request_id" loading={loading}
          pagination={{ pageSize: PAGE_SIZE, total, showTotal: t => `Tổng ${t} yêu cầu` }}
          onRow={r => ({ onClick: () => navigate(`/admin/returns/${r.return_request_id}`), style:{ cursor:'pointer' } })}
          scroll={{ x:700 }} size="middle" />
      </div>
    </div>
  );
};
export default ReturnListPage;
