import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Image, Space, Table, Tag, Tooltip, message } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ActionBar from '../../components/ActionBar';
import ConfirmModal from '../../components/ConfirmModal';
import PageHeader from '../../components/PageHeader';
import SearchBar from '../../components/SearchBar';
import { PAGE_SIZE } from '../../../shared/constants';
import { adminCategoryService } from '../../services/categoryService';
import { adminProductService } from '../../services/productService';
import { formatCurrency } from '../../../shared/utils/formatters';

const PRODUCT_STATUS_MAP = {
  ACTIVE:         { label: 'Đang bán',    color: 'green'   },
  INACTIVE:       { label: 'Ngừng bán',   color: 'default' },
  OUT_OF_STOCK:   { label: 'Hết hàng',    color: 'red'     },
  DISCONTINUED:   { label: 'Không còn',   color: 'volcano' },
};

const ProductListPage = () => {
  const navigate = useNavigate();
  const [data,       setData]       = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [total,      setTotal]      = useState(0);
  const [params,     setParams]     = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const load = useCallback(async (p = params) => {
    setLoading(true);
    try {
      const res = await adminProductService.getAll(p);
      setData(res.data); setTotal(res.total);
    } finally { setLoading(false); }
  }, [params]);

  useEffect(() => { load({}); }, []);
  useEffect(() => { adminCategoryService.getAll().then(setCategories); }, []);

  const handleSearch = (vals) => { setParams(vals); load(vals); };
  const handleReset  = ()     => { setParams({});   load({});   };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await adminProductService.delete(deleteTarget.product_id);
      message.success('Đã xoá sản phẩm');
      setDeleteTarget(null); load(params);
    } catch { message.error('Xoá thất bại'); }
    finally { setDeleteLoading(false); }
  };

  const columns = [
    {
      title: 'Ảnh', dataIndex: 'images', width: 70,
      render: imgs => <Image src={imgs?.[0]?.url || 'https://placehold.co/60x60'} width={48} height={48} style={{ objectFit:'cover', borderRadius:6 }} preview={false} />,
    },
    {
      title: 'Sản phẩm', dataIndex: 'name',
      render: (name, r) => (
        <div>
          <div style={{ fontWeight:600 }}>{name}</div>
          <Tag color="blue" style={{ marginTop:2, fontSize:11 }}>{r.category_name}</Tag>
        </div>
      ),
    },
    {
      title: 'Variants', dataIndex: 'variants',
      render: vs => {
        const minPrice = vs?.length ? Math.min(...vs.map(v => v.price)) : 0;
        const totalStock = vs?.reduce((s, v) => s + v.stock_quantity, 0) || 0;
        return (
          <div>
            <div style={{ fontSize:13 }}>{formatCurrency(minPrice)}</div>
            <div style={{ fontSize:12, color:'#94a3b8' }}>Tồn kho: {totalStock}</div>
          </div>
        );
      },
    },
    {
      title: 'Trạng thái', dataIndex: 'status',
      render: s => { const c = PRODUCT_STATUS_MAP[s] || { label:s, color:'default' }; return <Tag color={c.color}>{c.label}</Tag>; },
    },
    {
      title: 'Đánh giá', dataIndex: 'avg_rating',
      render: (r, rec) => r ? <span>⭐ {r} ({rec.review_count})</span> : '—',
    },
    {
      title: 'Thao tác', key: 'action', fixed: 'right', width: 100,
      render: (_, r) => (
        <Space>
          <Tooltip title="Chỉnh sửa"><Button size="small" icon={<EditOutlined />} onClick={() => navigate(`/admin/products/${r.product_id}/edit`)} /></Tooltip>
          <Tooltip title="Xoá"><Button size="small" danger icon={<DeleteOutlined />} onClick={() => setDeleteTarget(r)} /></Tooltip>
        </Space>
      ),
    },
  ];

  const catOptions = categories.filter(c => !c.parent_id).map(c => ({ label: c.name, value: c.category_id }));
  const statusOpts = Object.entries(PRODUCT_STATUS_MAP).map(([k,v]) => ({ label: v.label, value: k }));

  return (
    <div>
      <PageHeader title="Quản lý Sản phẩm" breadcrumbs={[{ label: 'Sản phẩm' }]} />
      <div style={{ background:'#fff', borderRadius:12, padding:'16px 20px', boxShadow:'0 1px 8px rgba(0,0,0,0.08)' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16, flexWrap:'wrap', gap:12 }}>
          <SearchBar
            fields={[
              { name:'keyword',     type:'input',  placeholder:'Tên sản phẩm...' },
              { name:'category_id', type:'select', placeholder:'Danh mục', options: catOptions },
              { name:'status',      type:'select', placeholder:'Trạng thái', options: statusOpts },
            ]}
            onSearch={handleSearch} onReset={handleReset} loading={loading}
          />
          <ActionBar onAdd={() => navigate('/admin/products/create')} addLabel="Thêm sản phẩm" />
        </div>
        <Table
          dataSource={data} columns={columns} rowKey="product_id"
          loading={loading} pagination={{ pageSize: PAGE_SIZE, total, showTotal: t => `Tổng ${t} sản phẩm` }}
          scroll={{ x: 700 }} size="middle"
        />
      </div>
      <ConfirmModal
        open={!!deleteTarget} title="Xoá sản phẩm"
        content={`Bạn có chắc muốn xoá sản phẩm "${deleteTarget?.name}"? Hành động này không thể hoàn tác.`}
        onOk={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleteLoading}
      />
    </div>
  );
};
export default ProductListPage;
