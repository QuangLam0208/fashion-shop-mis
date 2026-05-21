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
        const [productRes, categories] = await Promise.all([
          shopProductService.getAll({ page: 0, size: 8 }),
          shopCategoryService.getParents()
        ]);

        setFeatured(productRes?.content || productRes?.data?.content || []);
        setTopCategories(categories || []);
      } catch (error) {
        console.error("Lỗi tải dữ liệu trang chủ:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLandingData();
  }, []);

  return (
    <div>
      <BannerSlider />

      <section className="landing-section">
        <div className="c-container">
          <h2 className="c-section-title">Danh Mục Sản Phẩm</h2>
          <div className="landing-categories">
            {topCategories.map((cat) => (
              <CategoryCard key={cat.category_id} category={cat} />
            ))}
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
              {featured.map((p) => <ProductCard key={p.product_id} product={p} />)}
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
              <button className="banner-slide__btn" onClick={() => navigate('/shop?is_sale=true')}>
                Xem khuyến mãi
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