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
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    // ========== PUBLIC ==========

    /**
     * GET /api/products?keyword=áo&page=0&size=12
     */
    @GetMapping("/list")
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
    @GetMapping("/{id}")
    public ResponseEntity<ProductDetailResponseDTO> getProductDetail(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductDetail(id));
    }

    /**
     * GET /api/products/{id}/related?limit=4
     */
    @GetMapping("/{id}/related")
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
    @GetMapping("/categories")
    public ResponseEntity<List<CategoryResponseDTO>> getAllCategories() {
        return ResponseEntity.ok(productService.getAllCategories());
    }

}