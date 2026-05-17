// src/customer/components/ReviewCard.js
import React from 'react';
import { Rate, Image, Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { formatDate } from '../../shared/utils/formatters';

/**
 * ReviewCard — hiển thị 1 đánh giá sản phẩm
 * Props:
 *   review: { user_name, rating, comment, images[], created_at }
 */
const ReviewCard = ({ review }) => {
  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #e8e0d5',
        borderRadius: 12,
        padding: 20,
        marginBottom: 16,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <Avatar
          icon={<UserOutlined />}
          style={{ background: '#c9a96e', flexShrink: 0 }}
          size={40}
        />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#1a1a1a' }}>
            {review.user_name || 'Người dùng ẩn danh'}
          </div>
          <div style={{ fontSize: 12, color: '#999' }}>
            {formatDate(review.created_at)}
          </div>
        </div>
        <Rate disabled value={review.rating} style={{ fontSize: 14, color: '#faad14' }} />
      </div>

      {/* Comment */}
      {review.comment && (
        <p style={{ fontSize: 14, color: '#444', lineHeight: 1.7, margin: '0 0 12px' }}>
          {review.comment}
        </p>
      )}

      {/* Images */}
      {review.images?.length > 0 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Image.PreviewGroup>
            {review.images.map((img, idx) => (
              <Image
                key={idx}
                src={img}
                width={72}
                height={72}
                style={{ objectFit: 'cover', borderRadius: 6, cursor: 'pointer' }}
              />
            ))}
          </Image.PreviewGroup>
        </div>
      )}
    </div>
  );
};

export default ReviewCard;