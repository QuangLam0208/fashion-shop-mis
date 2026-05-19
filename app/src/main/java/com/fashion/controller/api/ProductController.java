package com.fashion.controller.api;

import com.fashion.dto.request.CreateProductRequestDTO;
import com.fashion.dto.request.UpdateProductRequestDTO;
import com.fashion.dto.response.CategoryResponseDTO;
import com.fashion.dto.response.MessageResponseDTO;
import com.fashion.dto.response.ProductDetailResponseDTO;
import com.fashion.dto.response.ProductSummaryResponseDTO;
import com.fashion.model.enums.ProductStatus;
import com.fashion.service.product.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    // ========== PUBLIC ==========

    /**
     * GET /api/products?keyword=áo&page=0&size=12
     */
    @GetMapping("/products")
    public ResponseEntity<Page<ProductSummaryResponseDTO>> getProducts(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        return ResponseEntity.ok(productService.getProducts(keyword, pageable));
    }

    /**
     * GET /api/products/{id}
     */
    @GetMapping("/products/{id}")
    public ResponseEntity<ProductDetailResponseDTO> getProductDetail(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductDetail(id));
    }

    /**
     * GET /api/products/{id}/related?limit=4
     */
    @GetMapping("/products/{id}/related")
    public ResponseEntity<List<ProductSummaryResponseDTO>> getRelatedProducts(
            @PathVariable Long id,
            @RequestParam(defaultValue = "4") int limit
    ) {
        return ResponseEntity.ok(productService.getRelatedProducts(id, limit));
    }

    /**
     * GET /api/products/categories
     * Dùng cho dropdown chọn danh mục khi tạo/lọc sản phẩm
     */
    @GetMapping("/products/categories")
    public ResponseEntity<List<CategoryResponseDTO>> getAllCategories() {
        return ResponseEntity.ok(productService.getAllCategories());
    }

    // ========== ADMIN ==========

    /**
     * GET /api/admin/products?keyword=&status=ACTIVE&page=0&size=10
     */
    @GetMapping("/admin/products")
    public ResponseEntity<Page<ProductSummaryResponseDTO>> getAdminProducts(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) ProductStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        return ResponseEntity.ok(productService.getAdminProducts(keyword, status, pageable));
    }

    /**
     * POST /api/admin/products
     */
    @PostMapping("/admin/products")
    public ResponseEntity<ProductDetailResponseDTO> createProduct(
            @Valid @RequestBody CreateProductRequestDTO dto
    ) {
        return ResponseEntity.status(201).body(productService.createProduct(dto));
    }

    /**
     * PUT /api/admin/products/{id}
     */
    @PutMapping("/admin/products/{id}")
    public ResponseEntity<ProductDetailResponseDTO> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody UpdateProductRequestDTO dto
    ) {
        return ResponseEntity.ok(productService.updateProduct(id, dto));
    }

    /**
     * DELETE /api/admin/products/{id}
     */
    @DeleteMapping("/admin/products/{id}")
    public ResponseEntity<MessageResponseDTO> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(MessageResponseDTO.builder()
                .message("Xóa sản phẩm thành công!")
                .build());
    }
}