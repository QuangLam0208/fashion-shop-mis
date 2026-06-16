import React, { useState, useEffect } from 'react';
import { Card, List, Rate, Image, Typography, Spin, Breadcrumb, message, Empty, Space } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { reviewService } from '../../services/reviewService';

const { Text, Title, Paragraph } = Typography;

const CustomerMyReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      try {
        const res = await reviewService.getMyReviews({ page: page - 1, size: 5, sort: 'createdAt,desc' });
        setReviews(res?.content || []);
        setTotal(res?.totalElements || 0);
      } catch (error) {
        message.error('Không thể tải lịch sử đánh giá');
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [page]);

  return (
    <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh', paddingBottom: 60 }}>
      <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #eaeaea', padding: '16px 0', marginBottom: 32 }}>
        <div className="c-container">
          <Breadcrumb>
            <Breadcrumb.Item><Link to="/"><HomeOutlined /> Trang chủ</Link></Breadcrumb.Item>
            <Breadcrumb.Item><Link to="/account/profile">Tài khoản</Link></Breadcrumb.Item>
            <Breadcrumb.Item>Đánh giá của tôi</Breadcrumb.Item>
          </Breadcrumb>
        </div>
      </div>

      <div className="c-container">
        <Title level={3} style={{ marginBottom: 24, color: '#1a1a1a' }}>Đánh giá của tôi</Title>
        <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          {loading ? <div style={{ textAlign: 'center', padding: 50 }}><Spin /></div> : reviews.length === 0 ? (
            <Empty description="Bạn chưa có đánh giá sản phẩm nào" />
          ) : (
            <List
              itemLayout="vertical"
              dataSource={reviews}
              pagination={{ 
                current: page, pageSize: 5, total: total, onChange: setPage, showSizeChanger: false, style: { textAlign: 'center', marginTop: 24 } 
              }}
              renderItem={item => (
                <List.Item style={{ padding: '24px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <Space align="start" size="large">
                    <img src={item.productImage} alt={item.productName} style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, border: '1px solid #eaeaea' }} />
                    <div>
                      <Text strong style={{ fontSize: 16 }}>{item.productName}</Text>
                      <div style={{ marginTop: 4, marginBottom: 8 }}>
                        <Rate disabled value={item.rating} style={{ fontSize: 14, color: '#fadb14' }} />
                        <Text type="secondary" style={{ marginLeft: 12, fontSize: 13 }}>{item.createdAt}</Text>
                      </div>
                      <Paragraph style={{ margin: '8px 0', color: '#333', fontSize: 15 }}>{item.comment}</Paragraph>
                      
                      {item.imageUrls && item.imageUrls.length > 0 && (
                        <Image.PreviewGroup>
                          <Space wrap style={{ marginTop: 8 }}>
                            {item.imageUrls.map((url, idx) => (
                              <Image key={idx} width={64} height={64} src={url} style={{ objectFit: 'cover', borderRadius: 6, border: '1px solid #f0f0f0' }} />
                            ))}
                          </Space>
                        </Image.PreviewGroup>
                      )}
                    </div>
                  </Space>
                </List.Item>
              )}
            />
          )}
        </Card>
      </div>
    </div>
  );
};

export default CustomerMyReviewsPage;