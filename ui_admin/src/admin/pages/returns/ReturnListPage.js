import { EyeOutlined } from '@ant-design/icons';
import { Button, Table, Tooltip, Card, Tag } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PAGE_SIZE, RETURN_STATUS } from '../../../shared/constants';
import PageHeader from '../../components/PageHeader';
import SearchBar from '../../components/SearchBar';
import { adminReturnService } from '../../services/returnService';
import { formatDateTime } from '../../../shared/utils/formatters';

const ReturnListPage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [params, setParams] = useState({ page: 0, size: PAGE_SIZE });

  const load = useCallback(async (currentParams = params) => {
    setLoading(true);
    try {
      const res = await adminReturnService.getAll(currentParams);
      // Ánh xạ đúng format Page của Backend: { content: [...], totalElements: 1 }
      setData(res?.content || []);
      setTotal(res?.totalElements || 0);
    } catch (error) {
      console.error("Lỗi tải danh sách Return Request:", error);
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => { load(); }, [load]);

  const handleTableChange = (pagination) => {
    const newParams = { ...params, page: pagination.current - 1, size: pagination.pageSize };
    setParams(newParams);
    load(newParams);
  };

  const handleSearch = (vals) => {
    const newParams = { ...params, ...vals, page: 0 };
    setParams(newParams);
    load(newParams);
  };

  const statusOpts = Object.entries(RETURN_STATUS).map(([k, v]) => ({ label: v.label, value: k }));

  const columns = [
    { title: 'Mã YC', dataIndex: 'requestId', render: id => <strong>#{id}</strong>, width: 80 },
    { title: 'Mã Đơn', dataIndex: 'orderId', render: id => <span>#{id}</span>, width: 80 },
    { title: 'Khách hàng', dataIndex: 'customerName' },
    { title: 'SĐT', dataIndex: 'customerPhone' },
    { title: 'Lý do', dataIndex: 'reason' },
    { title: 'Ngày YC', dataIndex: 'requestDate', render: d => formatDateTime(d) },
    { title: 'SL SP', dataIndex: 'totalItems', align: 'center' },
    { 
      title: 'Trạng thái', 
      dataIndex: 'status', 
      render: s => {
        let color = 'orange';
        if (s === 'APPROVED' || s === 'COMPLETED') color = 'green';
        if (s === 'REJECTED') color = 'red';
        return <Tag color={color} style={{ fontWeight: 600 }}>{s}</Tag>;
      } 
    },
    { 
      title: 'Thao tác', 
      key: 'action', 
      fixed: 'right', 
      align: 'center',
      width: 80,
      render: (_, r) => (
        <Tooltip title="Xem chi tiết">
          <Button size="small" type="primary" icon={<EyeOutlined />} onClick={() => navigate(`/admin/returns/${r.requestId}`)} />
        </Tooltip>
      ) 
    },
  ];

  return (
    <div>
      <PageHeader title="Quản lý yêu cầu trả hàng" breadcrumbs={[{ label: 'Trả hàng' }]} />
      <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 8px rgba(0,0,0,0.08)' }}>
        <div style={{ marginBottom: 16 }}>
          <SearchBar 
            fields={[{ name: 'status', type: 'select', placeholder: 'Lọc trạng thái', options: statusOpts }]}
            onSearch={handleSearch} 
            onReset={() => { setParams({ page: 0, size: PAGE_SIZE }); load({ page: 0, size: PAGE_SIZE }); }} 
            loading={loading} 
          />
        </div>
        <Table 
          dataSource={data} 
          columns={columns} 
          rowKey="requestId" 
          loading={loading}
          onChange={handleTableChange}
          pagination={{ 
            current: (params.page || 0) + 1,
            pageSize: params.size || PAGE_SIZE, 
            total, 
            showTotal: t => `Tổng ${t} yêu cầu` 
          }}
          scroll={{ x: 900 }} 
          size="middle" 
        />
      </Card>
    </div>
  );
};

export default ReturnListPage;