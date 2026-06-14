import React, { useEffect, useState } from 'react';
import { Row, Col, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import BannerSlider  from '../../components/BannerSlider';
import CategoryCard  from '../../components/CategoryCard';
import ProductCard   from '../../components/ProductCard';
import '../../styles/landing.css';
import '../../styles/customer.css';
import { shopProductService } from '../../services/shopProductService';
import { shopCategoryService } from '../../services/shopCategoryService';

const LandingPage = () => {
  const navigate = useNavigate();
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [topCategories, setTopCategories] = useState([]);

  useEffect(() => {
    const fetchLandingData = async () => {
      try {
        setLoading(true);
        const [productRes, categoriesRes] = await Promise.all([
          shopProductService.getAll({ page: 0, size: 8 }),
          shopCategoryService.getAll() 
        ]);

        setFeatured(productRes?.content || productRes?.data?.content || []);
        
        const catList = categoriesRes?.data || categoriesRes || [];
        
        let parentCategories = catList.filter(c => !c.parentId && !c.parent_id);
        if (parentCategories.length === 0) {
          parentCategories = catList;
        }

        parentCategories = parentCategories.map(parent => {
          const pId = parent.id || parent.categoryId || parent.category_id;
          
          const childrenFromFlat = catList.filter(c => {
            const childPId = c.parentId || c.parent_id;
            return childPId != null && childPId === pId;
          });
          
          const existingChildren = parent.children || parent.subCategories || [];
          
          return {
            ...parent,
            subCategories: existingChildren.length > 0 ? existingChildren : childrenFromFlat
          };
        });

        setTopCategories(parentCategories);
        
      } catch (error) {
        console.error("Lỗi tải dữ liệu trang chủ:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLandingData();
  }, []);

  const handleCategoryClick = (id) => {
    if (id) {
      navigate(`/shop?categoryId=${id}`);
    }
  };

  return (
    <div>
      <BannerSlider />

      <section className="landing-section">
        <div className="c-container">
          <h2 className="c-section-title" style={{ marginBottom: 32 }}>Danh Mục Sản Phẩm</h2>
          
          <div className="categories-hierarchy">
            {topCategories.map((parentCat, index) => {
              const subCats = parentCat.subCategories || parentCat.children || [];
              const parentId = parentCat.id || parentCat.categoryId || parentCat.category_id;
              
              return (
                <div key={parentId || index} style={{ marginBottom: 40 }}>
                  
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1a1a1a', margin: 0, textTransform: 'uppercase' }}>
                      {parentCat.name}
                    </h3>

                    <div style={{ flex: 1, height: 1, background: '#eaeaea', marginLeft: 16 }}></div>
                    <span 
                      onClick={() => handleCategoryClick(parentId)}
                      style={{ 
                        marginLeft: 16, 
                        color: '#1677ff', 
                        cursor: 'pointer', 
                        fontSize: '0.9rem', 
                        fontWeight: 600,
                        whiteSpace: 'nowrap'
                      }}
                    >
                      Xem tất cả &gt;
                    </span>
                  </div>
                  
                  <div className="landing-categories">
                    {subCats.length > 0 ? (
                      subCats.map((sub, i) => {
                        const subId = sub.id || sub.categoryId || sub.category_id;
                        return (
                          <div 
                            key={subId || `sub-${i}`} 
                            onClick={() => handleCategoryClick(subId)} 
                            style={{ cursor: 'pointer' }}
                          >
                            <CategoryCard category={sub} />
                          </div>
                        );
                      })
                    ) : (
                      // FIX: HIỂN THỊ THÔNG BÁO THAY VÌ LẶP LẠI CARD CỦA DANH MỤC CHA
                      <div style={{ color: '#94a3b8', fontSize: '0.95rem', fontStyle: 'italic', padding: '10px 0' }}>
                        Danh mục này không có danh mục con
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      <section className="landing-section landing-section--alt">
        <div className="c-container">
          <h2 className="c-section-title">Sản Phẩm Nổi Bật</h2>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 48 }}><Spin size="large" /></div>
          ) : (
            <div className="product-grid">
              {featured.map((p, index) => <ProductCard key={p.product_id || p.id || index} product={p} />)}
            </div>
          )}
          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <button className="c-btn-outline" onClick={() => navigate('/shop')}>
              Xem tất cả sản phẩm →
            </button>
          </div>
        </div>
      </section>

      <section className="landing-section">
        <div className="c-container">
          <div className="deals-banner">
            <div className="deals-banner__text">
              <div className="deals-banner__label">⚡ Flash Sale</div>
              <h2 className="deals-banner__title">Ưu Đãi Đặc Biệt<br />Hôm Nay</h2>
              <p className="deals-banner__sub">Hàng trăm sản phẩm giảm giá sâu — chỉ trong hôm nay!</p>
              <button className="banner-slide__btn" onClick={() => navigate('/promotions')}>
                Lấy mã giảm giá
              </button>
            </div>
            <div style={{ fontSize: 120, opacity: 0.15, userSelect: 'none' }}>🏷️</div>
          </div>
        </div>
      </section>

      <section style={{ background: '#1a1a1a', padding: '32px 0' }}>
        <div className="c-container">
          <Row gutter={[24, 24]} justify="center">
            {[
              { icon: '🚚', title: 'Miễn phí vận chuyển', sub: 'Cho đơn từ 500.000₫' },
              { icon: '↩️', title: 'Đổi trả 30 ngày', sub: 'Không cần lý do' },
              { icon: '💳', title: 'Thanh toán an toàn', sub: 'COD, VNPay, MoMo' },
              { icon: '🎁', title: 'Ưu đãi thành viên', sub: 'Giảm thêm khi tích điểm' },
            ].map((item) => (
              <Col xs={12} sm={6} key={item.title} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>{item.icon}</div>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>{item.title}</div>
                <div style={{ color: '#999', fontSize: 12 }}>{item.sub}</div>
              </Col>
            ))}
          </Row>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;