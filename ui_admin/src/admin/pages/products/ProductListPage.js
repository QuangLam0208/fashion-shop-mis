// src/admin/pages/products/ProductListPage.js
import { DeleteOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import { Button, Image, Space, Table, Tag, Tooltip, message, Modal, Descriptions, Row, Col, Spin } from 'antd';
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
  
  // State xoá sản phẩm
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // State phục vụ việc xem chi tiết sản phẩm
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [viewData, setViewData] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);

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
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const idToDelete = deleteTarget.productId ?? deleteTarget.product_id ?? deleteTarget.id;
      
      await adminProductService.delete(idToDelete);
      message.success('Đã xoá sản phẩm thành công');
      setDeleteTarget(null); // Đóng modal
      load(params);          // Tải lại danh sách
    } catch (error) {
      const errorMsg = error?.response?.data?.message || 'Xoá thất bại — sản phẩm có thể đang nằm trong đơn hàng.';
      message.error(errorMsg);
      setDeleteTarget(null); // Vẫn đóng modal nếu xoá thất bại
    } finally {
      setDeleteLoading(false);
    }
  };

  // Hàm gọi API lấy chi tiết sản phẩm khi admin click xem
  const handleViewDetails = async (record) => {
    const id = record.productId ?? record.product_id ?? record.id;
    setViewLoading(true);
    setViewModalVisible(true);
    try {
      const res = await adminProductService.getById(id);
      setViewData(res);
    } catch (error) {
      message.error('Không thể tải chi tiết sản phẩm này.');
      setViewModalVisible(false);
    } finally {
      setViewLoading(false);
    }
  };

  // CẬP NHẬT COLUMNS ĐỂ MAP CHUẨN VỚI JSON BE TRẢ VỀ
  const columns = [
    {
      title: 'Ảnh', 
      key: 'image',
      width: 70,
      render: (_, r) => {
        const imgUrl = (r.imageUrls && r.imageUrls.length > 0) 
          ? r.imageUrls[0] 
          : (r.image || r.primaryImageUrl);

        return (
          <Image 
            src={imgUrl || 'https://placehold.co/60x60?text=No+Image'} 
            fallback="https://placehold.co/60x60?text=Error"
            width={48} height={48} 
            style={{ objectFit: 'cover', borderRadius: 6, border: '1px solid #f0f0f0' }} 
            preview={false} 
          />
        );
      },
    },
    {
      title: 'Sản phẩm', 
      dataIndex: 'name',
      render: (name, r) => (
        <div>
          {/* SỬA TÊN SẢN PHẨM THÀNH LINK CLICK ĐƯỢC */}
          <div 
            style={{ fontWeight: 600, color: '#1677ff', cursor: 'pointer', textDecoration: 'underline' }} 
            onClick={() => handleViewDetails(r)}
          >
            {name}
          </div>
          <Tag color="blue" style={{ marginTop: 4, fontSize: 11 }}>
            {r.category || 'Chưa phân loại'}
          </Tag>
          {r.subcategory && (
            <Tag color="cyan" style={{ marginTop: 4, fontSize: 11 }}>
              {r.subcategory}
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: 'Giá & Kho', 
      key: 'price_stock',
      width: 200,
      align: 'center',
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
      width: 100,
      render: s => { 
        const c = PRODUCT_STATUS_MAP[s] || { label: s, color: 'default' }; 
        return <Tag color={c.color}>{c.label}</Tag>; 
      },
    },
    {
      title: 'Thao tác', 
      key: 'action', 
      fixed: 'right', 
      width: 120,
      render: (_, r) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button size="small" icon={<EyeOutlined />} onClick={() => handleViewDetails(r)} />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button size="small" icon={<EditOutlined />} onClick={() => navigate(`/admin/products/${r.productId ?? r.id}/edit`)} />
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

      {/* MODAL XEM CHI TIẾT SẢN PHẨM MỚI BỔ SUNG */}
      <Modal
        title="Chi tiết sản phẩm Hệ thống"
        open={viewModalVisible}
        onCancel={() => { setViewModalVisible(false); setViewData(null); }}
        footer={[
          <Button key="close" onClick={() => { setViewModalVisible(false); setViewData(null); }}>Đóng</Button>
        ]}
        width={750}
        centered
        destroyOnClose
      >
        <Spin spinning={viewLoading}>
          {viewData && (
            <div style={{ marginTop: 16 }}>
              <Row gutter={24}>
                <Col xs={24} sm={8} style={{ textAlign: 'center', marginBottom: 16 }}>
                  <Image
                    src={(viewData.imageUrls && viewData.imageUrls.length > 0) ? viewData.imageUrls[0] : (viewData.image || 'https://placehold.co/200x200?text=No+Image')}
                    fallback="https://placehold.co/200x200?text=Error"
                    style={{ width: '100%', maxWidth: 200, borderRadius: 8, objectFit: 'cover', border: '1px solid #f0f0f0' }}
                  />
                </Col>
                <Col xs={24} sm={16}>
                  <Descriptions column={1} bordered size="small">
                    <Descriptions.Item label="Tên sản phẩm">
                      <strong>{viewData.name}</strong>
                    </Descriptions.Item>
                    <Descriptions.Item label="Giá niêm yết">
                      <span style={{ color: '#ef4444', fontWeight: 600 }}>{formatCurrency(viewData.price || 0)}</span>
                    </Descriptions.Item>
                    <Descriptions.Item label="Trạng thái kinh doanh">
                      <Tag color={PRODUCT_STATUS_MAP[viewData.status]?.color || 'default'}>
                        {PRODUCT_STATUS_MAP[viewData.status]?.label || viewData.status}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Mô tả sản phẩm">
                      <div style={{ maxHeight: 100, overflowY: 'auto', whiteSpace: 'pre-wrap' }}>
                        {viewData.description || <i>Không có mô tả chi tiết cho sản phẩm này.</i>}
                      </div>
                    </Descriptions.Item>
                  </Descriptions>
                </Col>
              </Row>

              <h4 style={{ marginTop: 24, marginBottom: 12, fontSize: 14, fontWeight: 600 }}>
                Danh sách các Biến thể hàng hóa (Variants)
              </h4>
              <Table
                dataSource={viewData.variants || []}
                rowKey={v => v.variantId ?? v.id}
                pagination={false}
                size="small"
                bordered
                columns={[
                  { title: 'Kích cỡ (Size)', dataIndex: 'size', align: 'center', fontWeight: 600 },
                  { title: 'Màu sắc (Color)', dataIndex: 'color', align: 'center' },
                  { 
                    title: 'Số lượng hàng tồn kho', 
                    dataIndex: 'stockQuantity', 
                    align: 'center',
                    render: qty => {
                      const count = qty ?? 0;
                      return count === 0 ? <Tag color="red">Hết hàng</Tag> : <strong>{count}</strong>;
                    }
                  }
                ]}
              />
            </div>
          )}
        </Spin>
      </Modal>

      {/* Modal Xác nhận xoá sản phẩm */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Xoá sản phẩm"
        content={
          <span>
            Bạn có chắc muốn xoá sản phẩm <strong>"{deleteTarget?.name}"</strong>? 
            Hành động này không thể phục hồi.
          </span>
        }
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteLoading}
        danger={true}
      />
    </div>
  );
};

export default ProductListPage;