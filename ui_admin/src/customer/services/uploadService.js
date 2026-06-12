// src/admin/services/uploadService.js
import axiosInstance from '../../shared/config/axiosInstance';
import { API_ENDPOINTS } from '../../shared/config/apiConfig';

export const uploadService = {
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axiosInstance.post(API_ENDPOINTS.UPLOAD.IMAGE, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Backend trả về map { "url": "..." }
      return response.data.url; 
      
    } catch (error) {
      // Bắt chính xác field "error" từ UploadController của bạn
      const errorMsg = error.response?.data?.error || 'Có lỗi xảy ra khi tải ảnh lên máy chủ.';
      throw new Error(errorMsg);
    }
  }
};