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
  ACTIVE:       { label: 'Đang bán',    color: 'green'   },
  INACTIVE:     { label: 'Ngừng bán',   color: 'default' },
  OUT_OF_STOCK: { label: 'Hết hàng',    color: 'red'     },
  DISCONTINUED: { label: 'Không còn',   color: 'volcano' },
};

const ProductListPage = () => {
  const navigate = useNavigate();
  const [data,       setData]       = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [total,      setTotal]      = useState(0);
  const [params,     setParams]     = useState({ page: 0, size: PAGE_SIZE });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const load = useCallback(async (p = params) => {
    setLoading(true);
    try {
      const res = await adminProductService.getAll(p);
      
      // Xử lý đúng cấu trúc Page<> của Spring Boot
      const productList = res?.content || [];
      const totalItems = res?.totalElements || 0;
      
      setData(productList); 
      setTotal(totalItems);
    } catch (error) {
      message.error('Không thể tải danh sách sản phẩm');
    } finally { 
      setLoading(false); 
    }
  }, [params]);

  useEffect(() => { load(params); }, []);
  useEffect(() => { adminCategoryService.getAll().then(setCategories); }, []);

  const handleSearch = (vals) => { 
    const newParams = { ...vals, page: 0, size: PAGE_SIZE };
    setParams(newParams); 
    load(newParams); 
  };
  
  const handleReset  = () => { 
    const resetParams = { page: 0, size: PAGE_SIZE };
    setParams(resetParams);   
    load(resetParams);   
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      // Đọc đúng trường productId từ JSON
      await adminProductService.delete(deleteTarget.productId);
      message.success('Đã xoá sản phẩm');
      setDeleteTarget(null); 
      load(params);
    } catch { 
      message.error('Xoá thất bại — Sản phẩm có thể đang nằm trong đơn hàng'); 
    } finally { 
      setDeleteLoading(false); 
    }
  };

  // CẬP NHẬT COLUMNS ĐỂ MAP CHUẨN VỚI JSON BE TRẢ VỀ
  const columns = [
    {
      title: 'Ảnh', 
      dataIndex: 'primaryImageUrl', 
      width: 70,
      render: url => (
        <Image 
          src={url || 'https://placehold.co/60x60'} 
          width={48} height={48} 
          style={{ objectFit:'cover', borderRadius:6 }} 
          preview={false} 
        />
      ),
    },
    {
      title: 'Sản phẩm', 
      dataIndex: 'name',
      render: (name, r) => (
        <div>
          <div style={{ fontWeight: 600 }}>{name}</div>
          <Tag color="blue" style={{ marginTop: 2, fontSize: 11 }}>
            {r.category || 'Chưa phân loại'}
          </Tag>
          {r.subcategory && (
            <Tag color="cyan" style={{ marginTop: 2, fontSize: 11 }}>
              {r.subcategory}
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: 'Giá & Kho', 
      key: 'price_stock',
      render: (_, r) => (
        <div>
          <div style={{ fontSize: 13, fontWeight: 500 }}>
            {formatCurrency(r.price || 0)}
          </div>
          <div style={{ fontSize: 12, color: '#94a3b8' }}>
            Tồn kho: {r.totalStock || 0}
          </div>
          {r.variantCount > 1 && (
            <div style={{ fontSize: 11, color: '#1677ff' }}>
              ({r.variantCount} phiên bản)
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Trạng thái', 
      dataIndex: 'status',
      render: s => { 
        const c = PRODUCT_STATUS_MAP[s] || { label: s, color: 'default' }; 
        return <Tag color={c.color}>{c.label}</Tag>; 
      },
    },
    {
      title: 'Đánh giá', 
      key: 'rating',
      render: (_, rec) => (
        rec.averageRating 
          ? <span>⭐ {rec.averageRating} ({rec.reviewCount})</span> 
          : <span style={{ color: '#ccc' }}>Chưa có</span>
      ),
    },
    {
      title: 'Thao tác', 
      key: 'action', 
      fixed: 'right', 
      width: 100,
      render: (_, r) => (
        <Space>
          <Tooltip title="Chỉnh sửa">
            <Button size="small" icon={<EditOutlined />} onClick={() => navigate(`/admin/products/${r.productId}/edit`)} />
          </Tooltip>
          <Tooltip title="Xoá">
            <Button size="small" danger icon={<DeleteOutlined />} onClick={() => setDeleteTarget(r)} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const catOptions = categories
    .filter(c => !c.parentId && !c.parent_id)
    .map(c => ({ label: c.name, value: c.id ?? c.category_id }));
    
  const statusOpts = Object.entries(PRODUCT_STATUS_MAP).map(([k,v]) => ({ label: v.label, value: k }));

  const handleTableChange = (pagination) => {
    const newParams = {
      ...params,
      page: pagination.current - 1, 
      size: pagination.pageSize
    };
    setParams(newParams);
    load(newParams);
  };

  return (
    <div>
      <PageHeader title="Quản lý Sản phẩm" breadcrumbs={[{ label: 'Sản phẩm' }]} />
      <div style={{ background:'#fff', borderRadius:12, padding:'16px 20px', boxShadow:'0 1px 8px rgba(0,0,0,0.08)' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16, flexWrap:'wrap', gap:12 }}>
          <SearchBar
            fields={[
              { name:'keyword',     type:'input',  placeholder:'Tên sản phẩm...' },
              { name:'categoryId',  type:'select', placeholder:'Danh mục', options: catOptions },
              { name:'status',      type:'select', placeholder:'Trạng thái', options: statusOpts },
            ]}
            onSearch={handleSearch} onReset={handleReset} loading={loading}
          />
          <ActionBar showExport={false} onAdd={() => navigate('/admin/products/create')} addLabel="Thêm sản phẩm" />
        </div>
        <Table
          dataSource={data} 
          columns={columns} 
          rowKey="productId" 
          loading={loading} 
          onChange={handleTableChange}
          pagination={{ 
            current: (params.page || 0) + 1, 
            pageSize: params.size || PAGE_SIZE, 
            total, 
            showTotal: t => `Tổng ${t} sản phẩm` 
          }}
          scroll={{ x: 700 }} 
          size="middle"
        />
      </div>
      <ConfirmModal
        open={!!deleteTarget} title="Xoá sản phẩm"
        content={<span>Bạn có chắc muốn xoá sản phẩm <strong>"{deleteTarget?.name}"</strong>? Hành động này không thể hoàn tác.</span>}
        onOk={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleteLoading}
      />
    </div>
  );
};
export default ProductListPage;