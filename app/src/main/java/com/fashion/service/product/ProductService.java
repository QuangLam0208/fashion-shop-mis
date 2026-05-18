package com.fashion.service.product;

import com.fashion.dto.request.CreateProductRequestDTO;
import com.fashion.dto.request.UpdateProductRequestDTO;
import com.fashion.dto.response.CategoryResponseDTO;
import com.fashion.dto.response.ProductDetailResponseDTO;
import com.fashion.dto.response.ProductSummaryResponseDTO;
import com.fashion.model.enums.ProductStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ProductService {
    // Public: danh sách sản phẩm đang bán
    Page<ProductSummaryResponseDTO> getProducts(String keyword, Pageable pageable);

    // Admin: danh sách có thể lọc theo status
    Page<ProductSummaryResponseDTO> getAdminProducts(String keyword, ProductStatus status, Pageable pageable);

    // Chi tiết 1 sản phẩm
    ProductDetailResponseDTO getProductDetail(Long productId);

    // Sản phẩm liên quan
    List<ProductSummaryResponseDTO> getRelatedProducts(Long productId, int limit);

    // CRUD (Admin)
    ProductDetailResponseDTO createProduct(CreateProductRequestDTO dto);
    ProductDetailResponseDTO updateProduct(Long productId, UpdateProductRequestDTO dto);
    void deleteProduct(Long productId);
    List<CategoryResponseDTO> getAllCategories();
}
