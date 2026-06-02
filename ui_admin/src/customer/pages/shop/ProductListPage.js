// src/customer/pages/shop/ProductListPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, Pagination, Select, Spin, Empty, Menu, Breadcrumb, Input } from 'antd';
import { HomeOutlined, AppstoreOutlined } from '@ant-design/icons';
import { useSearchParams, Link } from 'react-router-dom';
import ProductCard from '../../components/ProductCard';
import { shopProductService } from '../../services/shopProductService';
import { shopCategoryService } from '../../services/shopCategoryService';
import '../../styles/customer.css';

const { Option } = Select;
const { Search } = Input;

const ProductListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // 1. TỰ ĐỘNG CHUẨN HÓA URL (THÊM page=1 & sort=newest NẾU CHƯA CÓ)
  useEffect(() => {
    let changed = false;
    const currentParams = new URLSearchParams(searchParams);

    if (!currentParams.has('page')) {
      currentParams.set('page', '1');
      changed = true;
    }
    if (!currentParams.has('sort')) {
      currentParams.set('sort', 'newest');
      changed = true;
    }

    // Nếu URL thiếu param, tự động thêm vào bằng 'replace' để không tạo rác lịch sử trình duyệt
    if (changed) {
      setSearchParams(currentParams, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2. Đọc các tham số từ URL (sau khi đã chuẩn hóa)
  const urlPage = parseInt(searchParams.get('page')) || 1;
  const urlCategory = searchParams.get('categoryId') || searchParams.get('category_id') || null;
  const urlSort = searchParams.get('sort') || 'newest';
  const urlKeyword = searchParams.get('keyword') || ''; 

  const [products, setProducts] = useState([]);
  const [menuItems, setMenuItems] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pageSize] = useState(12);

  // 3. Tải danh mục cho Sidebar
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await shopCategoryService.getAll();
        const catList = res?.data || res || [];
        
        let parentCategories = catList.filter(c => !c.parentId && !c.parent_id);
        if (parentCategories.length === 0) parentCategories = catList;

        const builtMenuItems = [
          { key: 'all', icon: <AppstoreOutlined />, label: 'Tất cả sản phẩm' },
          ...parentCategories.map(parent => {
            const pId = parent.id || parent.categoryId || parent.category_id;
            const childrenFromFlat = catList.filter(c => (c.parentId || c.parent_id) === pId);
            const subCats = (parent.children || parent.subCategories || []).length > 0 
                            ? (parent.children || parent.subCategories) 
                            : childrenFromFlat;

            const item = { key: String(pId), label: parent.name };
            if (subCats && subCats.length > 0) {
              item.children = subCats.map(sub => ({
                key: String(sub.id || sub.categoryId || sub.category_id),
                label: sub.name
              }));
            }
            return item;
          })
        ];
        setMenuItems(builtMenuItems);
      } catch (error) {
        console.error("Lỗi tải danh mục:", error);
      }
    };
    fetchCategories();
  }, []);

  // 4. Tải danh sách Sản phẩm theo Param
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      let sortParam = '';
      if (urlSort === 'price_asc') sortParam = 'price,asc';
      else if (urlSort === 'price_desc') sortParam = 'price,desc';
      else if (urlSort === 'newest') sortParam = 'id,desc'; 

      const params = {
        page: urlPage - 1, 
        size: pageSize,
        categoryId: urlCategory, 
        sort: sortParam
      };

      if (urlKeyword) {
        params.keyword = urlKeyword;
      }

      const res = await shopProductService.getAll(params);
      
      setProducts(res?.content || res?.data?.content || []);
      setTotal(res?.totalElements || res?.data?.totalElements || 0);
    } catch (error) {
      console.error("Lỗi tải sản phẩm:", error);
    } finally {
      setLoading(false);
    }
  }, [urlPage, urlCategory, urlSort, urlKeyword, pageSize]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // 5. Xử lý các sự kiện thay đổi Param URL
  const handleSearch = (value) => {
    if (value && value.trim() !== '') {
      searchParams.set('keyword', value.trim());
    } else {
      searchParams.delete('keyword'); 
    }
    searchParams.set('page', 1); 
    setSearchParams(searchParams);
  };

  const handlePageChange = (page) => {
    searchParams.set('page', page);
    setSearchParams(searchParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategorySelect = ({ key }) => {
    if (key === 'all') {
      searchParams.delete('categoryId');
      searchParams.delete('category_id');
    } else {
      searchParams.set('categoryId', key);
    }
    searchParams.set('page', 1);
    setSearchParams(searchParams);
  };

  const handleSortChange = (value) => {
    searchParams.set('sort', value);
    searchParams.set('page', 1);
    setSearchParams(searchParams);
  };

  const findParentKey = (childKey) => {
    for (const item of menuItems) {
      if (item.children) {
        const found = item.children.find(c => c.key === childKey);
        if (found) return item.key;
      }
    }
    return null;
  };

  const defaultOpenKeys = [];
  if (urlCategory) {
    const parentKey = findParentKey(urlCategory);
    if (parentKey) {
      defaultOpenKeys.push(parentKey); 
    } else {
      defaultOpenKeys.push(urlCategory); 
    }
  }

  return (
    <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh', paddingBottom: 60 }}>
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
          <Col xs={24} lg={6}>
            <div style={{ background: '#fff', padding: 20, borderRadius: 12, position: 'sticky', top: 80 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Danh Mục</h3>
              <Menu
                mode="inline"
                selectedKeys={[urlCategory || 'all']}
                defaultOpenKeys={defaultOpenKeys}
                onClick={handleCategorySelect}
                items={menuItems.map(item => (
                  item.children 
                    ? { ...item, onTitleClick: handleCategorySelect } 
                    : item
                ))}
                style={{ borderRight: 'none' }}
              />
            </div>
          </Col>

          <Col xs={24} lg={18}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, alignItems: 'center', marginBottom: 24, background: '#fff', padding: '16px 20px', borderRadius: 12 }}>
              <span style={{ color: '#64748b' }}>
                Hiển thị <strong>{products.length}</strong> trên tổng số <strong>{total}</strong> sản phẩm
              </span>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                <Search
                  placeholder="Nhập tên sản phẩm..."
                  allowClear
                  defaultValue={urlKeyword}
                  onSearch={handleSearch}
                  style={{ width: 250 }}
                  enterButton
                />
                
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontWeight: 500 }}>Sắp xếp:</span>
                  <Select value={urlSort} onChange={handleSortChange} style={{ width: 180 }}>
                    <Option value="newest">Mới nhất</Option>
                    <Option value="price_asc">Giá: Thấp đến Cao</Option>
                    <Option value="price_desc">Giá: Cao xuống Thấp</Option>
                  </Select>
                </div>
              </div>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '100px 0' }}><Spin size="large" /></div>
            ) : products.length > 0 ? (
              <>
                <Row gutter={[24, 24]}>
                  {products.map(product => (
                    <Col xs={12} sm={12} md={8} xl={6} key={product.productId || product.id}>
                      <ProductCard product={product} />
                    </Col>
                  ))}
                </Row>
                
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
                <Empty description="Không tìm thấy sản phẩm nào phù hợp." />
              </div>
            )}
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default ProductListPage;