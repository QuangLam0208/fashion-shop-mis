// src/customer/components/BannerSlider.js
import React from 'react';
import { Carousel } from 'antd';
import { useNavigate } from 'react-router-dom';
import '../styles/landing.css';

const DEFAULT_SLIDES = [
{
    id: 1,
    label: 'Bộ sưu tập mới',
    title: 'Phong Cách\nĐỉnh Cao',
    desc: 'Khám phá xu hướng thời trang mới nhất — chất lượng vượt trội, giá cả hợp lý.',
    cta: 'Mua sắm ngay',
    link: '/shop',
    image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1200&q=80',
  },
  {
    id: 2,
    label: 'Ưu đãi đặc biệt',
    title: 'Sale Up To\n50% Off',
    desc: 'Hàng trăm sản phẩm giảm giá mỗi ngày — đừng bỏ lỡ cơ hội hiếm có.',
    cta: 'Xem khuyến mãi',
    link: '/shop?is_sale=true',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&q=80',
  },
  {
    id: 3,
    label: 'Mùa hè 2025',
    title: 'Thời Trang\nHè Rực Rỡ',
    desc: 'Những thiết kế trẻ trung, năng động dành riêng cho mùa hè sôi động.',
    cta: 'Khám phá',
    link: '/shop?category_id=2',
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1200&q=80',
  },
];

const BannerSlider = ({ slides = DEFAULT_SLIDES, autoplay = true }) => {
  const navigate = useNavigate();

  return (
    <div className="banner-slider">
      <Carousel autoplay={autoplay} autoplaySpeed={5000} effect="fade" dots>
        {slides.map((slide) => (
          <div key={slide.id}>
            <div className="banner-slide">
              <img className="banner-slide__image" src={slide.image} alt={slide.title} />
              <div className="banner-slide__overlay" />
              <div className="banner-slide__content">
                {slide.label && (
                  <div className="banner-slide__label">{slide.label}</div>
                )}
                <h1 className="banner-slide__title">
                  {slide.title.split('\n').map((line, i) => (
                    <React.Fragment key={i}>{line}{i < slide.title.split('\n').length - 1 && <br />}</React.Fragment>
                  ))}
                </h1>
                {slide.desc && (
                  <p className="banner-slide__desc">{slide.desc}</p>
                )}
                <button
                  className="banner-slide__btn"
                  onClick={() => navigate(slide.link)}
                >
                  {slide.cta}
                </button>
              </div>
            </div>
          </div>
        ))}
      </Carousel>
    </div>
  );
};

export default BannerSlider;