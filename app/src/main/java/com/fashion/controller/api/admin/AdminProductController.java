package com.fashion.controller.api.admin;

import com.fashion.dto.request.CreateProductRequestDTO;
import com.fashion.dto.request.UpdateProductRequestDTO;
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

@RestController
@RequestMapping("/api/admin/products")
@RequiredArgsConstructor
public class AdminProductController {

    private final ProductService productService;

    /**
     * GET /api/admin/products?keyword=&status=ACTIVE&page=0&size=10
     */
    @GetMapping("/list")
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
     * POST /api/admin/products/create
     */
    @PostMapping("/create")
    public ResponseEntity<ProductDetailResponseDTO> createProduct(
            @Valid @RequestBody CreateProductRequestDTO dto
    ) {
        return ResponseEntity.status(201).body(productService.createProduct(dto));
    }

    /**
     * PUT /api/admin/products/update/{id}
     */
    @PutMapping("/update/{id}")
    public ResponseEntity<ProductDetailResponseDTO> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody UpdateProductRequestDTO dto
    ) {
        return ResponseEntity.ok(productService.updateProduct(id, dto));
    }

    /**
     * DELETE /api/admin/products/{id}
     */
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<MessageResponseDTO> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(MessageResponseDTO.builder()
                .message("Xóa sản phẩm thành công!")
                .build());
    }
}
