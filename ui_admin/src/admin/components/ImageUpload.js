// src/admin/components/ImageUpload.js
import React, { useState } from 'react';
import { Upload, message } from 'antd';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { uploadService } from '../services/uploadService';

const ImageUpload = ({ value, onChange }) => {
  const [loading, setLoading] = useState(false);

  const customRequest = async ({ file, onSuccess, onError }) => {
    setLoading(true);
    try {
      // Gọi API tải file lên server
      const imageUrl = await uploadService.uploadImage(file);
      
      onSuccess("ok");
      
      // Cập nhật URL ảnh mới lên Form.Item
      if (onChange) {
        onChange(imageUrl); 
      }
      message.success('Tải ảnh lên thành công!');
    } catch (error) {
      // Hiển thị chính xác lỗi từ Backend (UploadController)
      message.error(error.message);
      onError(error);
    } finally {
      setLoading(false);
    }
  };

  const uploadButton = (
    <div>
      {loading ? <LoadingOutlined style={{ fontSize: 24, color: '#1677ff' }} /> : <PlusOutlined style={{ fontSize: 24 }} />}
      <div style={{ marginTop: 8, color: '#666' }}>{loading ? 'Đang tải...' : 'Chọn ảnh'}</div>
    </div>
  );

  return (
    <Upload
      name="file"
      listType="picture-card"
      className="avatar-uploader"
      showUploadList={false}
      customRequest={customRequest}
      beforeUpload={(file) => {
        const isJpgOrPngOrWebp = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/webp';
        if (!isJpgOrPngOrWebp) {
          message.error('Chỉ hỗ trợ định dạng JPG, PNG hoặc WEBP!');
        }
        const isLt5M = file.size / 1024 / 1024 < 5;
        if (!isLt5M) {
          message.error('Kích thước ảnh phải nhỏ hơn 5MB!');
        }
        return isJpgOrPngOrWebp && isLt5M;
      }}
    >
      {value ? (
        <img 
          src={value} 
          alt="product_image" 
          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} 
        />
      ) : (
        uploadButton
      )}
    </Upload>
  );
};

export default ImageUpload;