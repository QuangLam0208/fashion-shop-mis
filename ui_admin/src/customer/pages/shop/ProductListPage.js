import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, Pagination, Select, Spin, Empty, Menu, Breadcrumb } from 'antd';
import { HomeOutlined, AppstoreOutlined } from '@ant-design/icons';
import { useSearchParams, Link } from 'react-router-dom';
import ProductCard from '../../components/ProductCard';
import { shopProductService } from '../../services/shopProductService';
import { shopCategoryService } from '../../services/shopCategoryService';
import '../../styles/customer.css';

const { Option } = Select;

const ProductListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Lấy các tham số từ URL (nếu có)
  const urlPage = parseInt(searchParams.get('page')) || 1;
  const urlCategory = searchParams.get('category_id') || null;
  const urlSort = searchParams.get('sort') || 'newest';

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pageSize] = useState(12);

  // 1. Tải danh sách Danh mục cho thanh Sidebar (Cột trái)
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Giả định bạn có hàm lấy danh mục ở shopCategoryService
        const res = await shopCategoryService.getParents();
        setCategories(res || []);
      } catch (error) {
        console.error("Lỗi tải danh mục:", error);
      }
    };
    fetchCategories();
  }, []);

  // 2. Tải danh sách Sản phẩm mỗi khi tham số URL thay đổi
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      // Map các giá trị sort sang định dạng của Spring Boot
      let sortParam = '';
      if (urlSort === 'price_asc') sortParam = 'price,asc';
      if (urlSort === 'price_desc') sortParam = 'price,desc';
      if (urlSort === 'newest') sortParam = 'productId,desc'; // Hoặc created_at,desc tuỳ BE của bạn

      const params = {
        page: urlPage - 1, // Spring Boot tính page từ 0
        size: pageSize,
        categoryId: urlCategory,
        sort: sortParam
      };

      const res = await shopProductService.getAll(params);
      
      // Xử lý chuẩn cấu trúc Page<> của Spring Boot
      setProducts(res?.content || res?.data?.content || []);
      setTotal(res?.totalElements || res?.data?.totalElements || 0);
    } catch (error) {
      console.error("Lỗi tải sản phẩm:", error);
    } finally {
      setLoading(false);
    }
  }, [urlPage, urlCategory, urlSort, pageSize]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // 3. Xử lý các sự kiện thay đổi bộ lọc (Cập nhật thẳng lên URL)
  const handlePageChange = (page) => {
    searchParams.set('page', page);
    setSearchParams(searchParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategorySelect = ({ key }) => {
    if (key === 'all') {
      searchParams.delete('category_id');
    } else {
      searchParams.set('category_id', key);
    }
    searchParams.set('page', 1); // Reset về trang 1 khi đổi danh mục
    setSearchParams(searchParams);
  };

  const handleSortChange = (value) => {
    searchParams.set('sort', value);
    searchParams.set('page', 1);
    setSearchParams(searchParams);
  };

  // Cấu hình Menu Danh mục
  const menuItems = [
    { key: 'all', icon: <AppstoreOutlined />, label: 'Tất cả sản phẩm' },
    ...categories.map(c => ({
      key: (c.id ?? c.category_id).toString(),
      label: c.name
    }))
  ];

  return (
    <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh', paddingBottom: 60 }}>
      {/* Breadcrumb */}
      <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #eaeaea', padding: '16px 0', marginBottom: 32 }}>
        <div className="c-container">
          <Breadcrumb>
            <Breadcrumb.Item><Link to="/"><HomeOutlined /> Trang chủ</Link></Breadcrumb.Item>
            <Breadcrumb.Item>Cửa hàng</Breadcrumb.Item>
          </Breadcrumb>
        </div>
      </div>

      <div className="c-container">
        <Row gutter={[32, 32]}>
          {/* CỘT TRÁI: BỘ LỌC DANH MỤC */}
          <Col xs={24} lg={6}>
            <div style={{ background: '#fff', padding: 20, borderRadius: 12, position: 'sticky', top: 80 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Danh Mục</h3>
              <Menu
                mode="inline"
                selectedKeys={[urlCategory || 'all']}
                onClick={handleCategorySelect}
                items={menuItems}
                style={{ borderRight: 'none' }}
              />
            </div>
          </Col>

          {/* CỘT PHẢI: DANH SÁCH SẢN PHẨM */}
          <Col xs={24} lg={18}>
            {/* Thanh công cụ: Tổng số & Sắp xếp */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, background: '#fff', padding: '16px 20px', borderRadius: 12 }}>
              <span style={{ color: '#64748b' }}>Hiển thị <strong>{products.length}</strong> trên tổng số <strong>{total}</strong> sản phẩm</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontWeight: 500 }}>Sắp xếp theo:</span>
                <Select value={urlSort} onChange={handleSortChange} style={{ width: 180 }}>
                  <Option value="newest">Mới nhất</Option>
                  <Option value="price_asc">Giá: Thấp đến Cao</Option>
                  <Option value="price_desc">Giá: Cao xuống Thấp</Option>
                </Select>
              </div>
            </div>

            {/* Lưới Sản phẩm */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: '100px 0' }}><Spin size="large" /></div>
            ) : products.length > 0 ? (
              <>
                <Row gutter={[24, 24]}>
                  {products.map(product => (
                    <Col xs={12} sm={12} md={8} xl={6} key={product.productId || product.product_id}>
                      <ProductCard product={product} />
                    </Col>
                  ))}
                </Row>
                
                {/* Phân trang */}
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: 40 }}>
                  <Pagination 
                    current={urlPage} 
                    pageSize={pageSize} 
                    total={total} 
                    onChange={handlePageChange} 
                    showSizeChanger={false}
                  />
                </div>
              </>
            ) : (
              <div style={{ background: '#fff', padding: '60px 0', borderRadius: 12 }}>
                <Empty description="Không tìm thấy sản phẩm nào trong danh mục này." />
              </div>
            )}
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default ProductListPage;