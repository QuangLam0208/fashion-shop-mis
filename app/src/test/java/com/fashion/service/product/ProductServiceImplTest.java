package com.fashion.service.product;

import com.fashion.dto.request.CreateProductRequestDTO;
import com.fashion.dto.response.ProductDetailResponseDTO;
import com.fashion.exception.BadRequestException;
import com.fashion.model.Category;
import com.fashion.model.Product;
import com.fashion.model.ProductImage;
import com.fashion.model.ProductVariant;
import com.fashion.model.enums.ProductStatus;
import com.fashion.repository.CategoryRepository;
import com.fashion.repository.ProductCleanupRepository;
import com.fashion.repository.ProductRepository;
import com.fashion.repository.ReviewRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ProductServiceImplTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private ProductCleanupRepository cleanupRepository;

    @Mock
    private ReviewRepository reviewRepository;

    @InjectMocks
    private ProductServiceImpl productService;

    private Category mockCategory;
    private CreateProductRequestDTO validCreateDto;

    @BeforeEach
    void setUp() {
        // Tạo Category cha
        Category parentCategory = Category.builder()
                .id(1L)
                .name("Thời trang nam")
                .build();

        // Tạo Category con
        mockCategory = Category.builder()
                .id(2L)
                .name("Áo thun")
                .parent(parentCategory)
                .build();

        // Tạo DTO hợp lệ để test
        CreateProductRequestDTO.ProductVariantRequestDTO variantDto = CreateProductRequestDTO.ProductVariantRequestDTO.builder()
                .size("M")
                .color("Đỏ")
                .stockQuantity(100L)
                .build();

        validCreateDto = CreateProductRequestDTO.builder()
                .name("Áo thun Polo cao cấp")
                .categoryId(2L)
                .description("Áo thun Polo thoáng mát, chất liệu 100% cotton")
                .price(250000.0)
                .imageUrls(List.of("images/polo1.png", "images/polo2.png"))
                .variants(List.of(variantDto))
                .build();
    }

    // =========================================================================
    // TEST CASE 1: CREATE PRODUCT SUCCESS (Product + Variants saved)
    // =========================================================================
    @Test
    void testCreateProduct_Success() {
        // Arrange
        when(categoryRepository.findById(2L)).thenReturn(Optional.of(mockCategory));

        // Mock hành vi save và set ID cho product
        when(productRepository.save(any(Product.class))).thenAnswer(invocation -> {
            Product productToSave = invocation.getArgument(0);
            productToSave.setId(10L); // Giả lập database tự sinh ID
            if (productToSave.getVariants() != null && !productToSave.getVariants().isEmpty()) {
                productToSave.getVariants().get(0).setId(101L); // Giả lập database tự sinh ID cho variant
            }
            if (productToSave.getImages() != null && !productToSave.getImages().isEmpty()) {
                productToSave.getImages().get(0).setId(201L); // Giả lập database tự sinh ID cho image
            }
            return productToSave;
        });

        // Mock findById được gọi bên trong getProductDetail(productId)
        when(productRepository.findById(10L)).thenAnswer(invocation -> {
            // Xây dựng Product đầy đủ dữ liệu giả lập giống như sau khi save thành công
            Product savedProduct = Product.builder()
                    .id(10L)
                    .name(validCreateDto.getName())
                    .category(mockCategory)
                    .description(validCreateDto.getDescription())
                    .status(ProductStatus.ACTIVE)
                    .build();

            ProductVariant variant = ProductVariant.builder()
                    .id(101L)
                    .size("M")
                    .color("Đỏ")
                    .stockQuantity(100L)
                    .price(250000.0)
                    .product(savedProduct)
                    .build();
            savedProduct.getVariants().add(variant);

            ProductImage image = ProductImage.builder()
                    .id(201L)
                    .url("images/polo1.png")
                    .product(savedProduct)
                    .build();
            savedProduct.getImages().add(image);

            return Optional.of(savedProduct);
        });

        // Mock các truy vấn review bên trong getProductDetail
        when(reviewRepository.getAverageRatingByProductId(10L)).thenReturn(4.5);
        when(reviewRepository.countByProductId(10L)).thenReturn(5L);
        when(reviewRepository.findByProductId(eq(10L), any(Pageable.class)))
                .thenReturn(new PageImpl<>(Collections.emptyList()));

        // Act
        ProductDetailResponseDTO response = productService.createProduct(validCreateDto);

        // Assert
        assertNotNull(response);
        assertEquals(10L, response.getProductId());
        assertEquals("Áo thun Polo cao cấp", response.getName());
        assertEquals(250000.0, response.getPrice());
        assertEquals("Thời trang nam", response.getCategory()); // Tên Category cha
        assertEquals("Áo thun", response.getCategoryName()); // Tên Category con
        assertEquals(2L, response.getCategoryId());
        assertEquals("Áo thun Polo thoáng mát, chất liệu 100% cotton", response.getDescription());
        assertEquals(ProductStatus.ACTIVE, response.getStatus());
        assertEquals(4.5, response.getAverageRating());
        assertEquals(5L, response.getReviewCount());

        // Kiểm tra biến thể được map chính xác
        assertFalse(response.getVariants().isEmpty());
        assertEquals(1, response.getVariants().size());
        ProductDetailResponseDTO.ProductVariantDTO varDto = response.getVariants().get(0);
        assertEquals(101L, varDto.getVariantId());
        assertEquals("M", varDto.getSize());
        assertEquals("Đỏ", varDto.getColor());
        assertEquals(100L, varDto.getStockQuantity());
        assertEquals(250000.0, varDto.getPrice());

        // Kiểm tra hình ảnh được map chính xác
        assertFalse(response.getImages().isEmpty());
        assertEquals(1, response.getImages().size());
        assertEquals("/images/polo1.png", response.getImages().get(0).getUrl());

        // Verify Mockito gọi đúng phương thức lưu trữ
        verify(categoryRepository, times(1)).findById(2L);
        verify(productRepository, times(1)).save(any(Product.class));
        verify(productRepository, times(1)).findById(10L);
    }

    // =========================================================================
    // TEST CASE 2: INVALID STOCK QUANTITY (Throws RuntimeException)
    // =========================================================================
    @Test
    void testCreateProduct_InvalidStockQuantity_ThrowsRuntimeException() {
        // Arrange: Mock Category để vượt qua bước check category ban đầu
        when(categoryRepository.findById(2L)).thenReturn(Optional.of(mockCategory));

        // Arrange: Đặt tồn kho của variant là số âm
        CreateProductRequestDTO.ProductVariantRequestDTO invalidVariantDto = CreateProductRequestDTO.ProductVariantRequestDTO.builder()
                .size("M")
                .color("Đỏ")
                .stockQuantity(-10L) // Số lượng tồn kho âm
                .build();

        validCreateDto.setVariants(List.of(invalidVariantDto));

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            productService.createProduct(validCreateDto);
        });

        assertEquals("Số lượng tồn kho không hợp lệ", exception.getMessage());
        // Verify: Đảm bảo không lưu vào db
        verify(productRepository, never()).save(any(Product.class));
    }

    @Test
    void testCreateProduct_NullStockQuantity_ThrowsRuntimeException() {
        // Arrange: Mock Category để vượt qua bước check category ban đầu
        when(categoryRepository.findById(2L)).thenReturn(Optional.of(mockCategory));

        // Arrange: Đặt tồn kho của variant là null
        CreateProductRequestDTO.ProductVariantRequestDTO invalidVariantDto = CreateProductRequestDTO.ProductVariantRequestDTO.builder()
                .size("M")
                .color("Đỏ")
                .stockQuantity(null) // Số lượng tồn kho null
                .build();

        validCreateDto.setVariants(List.of(invalidVariantDto));

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            productService.createProduct(validCreateDto);
        });

        assertEquals("Số lượng tồn kho không hợp lệ", exception.getMessage());
        // Verify: Đảm bảo không lưu vào db
        verify(productRepository, never()).save(any(Product.class));
    }

    // =========================================================================
    // TEST CASE 3: VARIANTS EMPTY (Throws BadRequestException)
    // =========================================================================
    @Test
    void testCreateProduct_VariantsEmpty_ThrowsBadRequestException() {
        // Arrange: Đặt danh sách variant rỗng
        validCreateDto.setVariants(Collections.emptyList());

        // Act & Assert
        BadRequestException exception = assertThrows(BadRequestException.class, () -> {
            productService.createProduct(validCreateDto);
        });

        assertEquals("Phải có ít nhất một biến thể sản phẩm (variant)", exception.getMessage());
        verify(productRepository, never()).save(any(Product.class));
    }

    @Test
    void testCreateProduct_VariantsNull_ThrowsBadRequestException() {
        // Arrange: Đặt danh sách variant là null
        validCreateDto.setVariants(null);

        // Act & Assert
        BadRequestException exception = assertThrows(BadRequestException.class, () -> {
            productService.createProduct(validCreateDto);
        });

        assertEquals("Phải có ít nhất một biến thể sản phẩm (variant)", exception.getMessage());
        verify(productRepository, never()).save(any(Product.class));
    }

    // =========================================================================
    // TEST CASES CHO AC-BE-12-11: IMAGE PERSISTENCE TESTS
    // =========================================================================
    @Test
    void testCreateProduct_WithImageUrls_PersistCorrectly() {
        // Arrange
        when(categoryRepository.findById(2L)).thenReturn(Optional.of(mockCategory));

        validCreateDto.setImageUrls(List.of("images/custom1.png", "images/custom2.png"));

        when(productRepository.save(any(Product.class))).thenAnswer(invocation -> {
            Product p = invocation.getArgument(0);
            p.setId(15L);
            // Gán ID cho các ảnh trong list để mô phỏng database
            for (int i = 0; i < p.getImages().size(); i++) {
                p.getImages().get(i).setId((long) (300 + i));
            }
            return p;
        });

        when(productRepository.findById(15L)).thenAnswer(invocation -> {
            Product savedProduct = Product.builder()
                    .id(15L)
                    .name(validCreateDto.getName())
                    .category(mockCategory)
                    .description(validCreateDto.getDescription())
                    .status(ProductStatus.ACTIVE)
                    .build();

            ProductVariant variant = ProductVariant.builder()
                    .id(101L)
                    .size("M")
                    .color("Đỏ")
                    .stockQuantity(100L)
                    .price(250000.0)
                    .product(savedProduct)
                    .build();
            savedProduct.getVariants().add(variant);

            // Phục hồi lại danh sách ảnh đã lưu
            for (int i = 0; i < validCreateDto.getImageUrls().size(); i++) {
                ProductImage image = ProductImage.builder()
                        .id((long) (300 + i))
                        .url(validCreateDto.getImageUrls().get(i))
                        .product(savedProduct)
                        .build();
                savedProduct.getImages().add(image);
            }

            return Optional.of(savedProduct);
        });

        // Mock review
        when(reviewRepository.getAverageRatingByProductId(15L)).thenReturn(0.0);
        when(reviewRepository.countByProductId(15L)).thenReturn(0L);
        when(reviewRepository.findByProductId(eq(15L), any(Pageable.class)))
                .thenReturn(new PageImpl<>(Collections.emptyList()));

        // Act
        ProductDetailResponseDTO response = productService.createProduct(validCreateDto);

        // Assert
        assertNotNull(response);
        assertEquals(15L, response.getProductId());
        assertEquals(2, response.getImages().size());
        assertEquals("/images/custom1.png", response.getImages().get(0).getUrl());
        assertEquals("/images/custom2.png", response.getImages().get(1).getUrl());
        assertEquals("/images/custom1.png", response.getMainImage());
        assertEquals("/images/custom2.png", response.getHoverImage());

        verify(productRepository, times(1)).save(any(Product.class));
    }

    @Test
    void testCreateProduct_WithoutImages_Success() {
        // Arrange
        when(categoryRepository.findById(2L)).thenReturn(Optional.of(mockCategory));

        // Đặt danh sách ảnh trống
        validCreateDto.setImageUrls(null);

        when(productRepository.save(any(Product.class))).thenAnswer(invocation -> {
            Product p = invocation.getArgument(0);
            p.setId(16L);
            return p;
        });

        when(productRepository.findById(16L)).thenAnswer(invocation -> {
            Product savedProduct = Product.builder()
                    .id(16L)
                    .name(validCreateDto.getName())
                    .category(mockCategory)
                    .description(validCreateDto.getDescription())
                    .status(ProductStatus.ACTIVE)
                    .build();

            ProductVariant variant = ProductVariant.builder()
                    .id(101L)
                    .size("M")
                    .color("Đỏ")
                    .stockQuantity(100L)
                    .price(250000.0)
                    .product(savedProduct)
                    .build();
            savedProduct.getVariants().add(variant);

            // Không thêm ảnh nào
            return Optional.of(savedProduct);
        });

        // Mock review
        when(reviewRepository.getAverageRatingByProductId(16L)).thenReturn(0.0);
        when(reviewRepository.countByProductId(16L)).thenReturn(0L);
        when(reviewRepository.findByProductId(eq(16L), any(Pageable.class)))
                .thenReturn(new PageImpl<>(Collections.emptyList()));

        // Act
        ProductDetailResponseDTO response = productService.createProduct(validCreateDto);

        // Assert
        assertNotNull(response);
        assertEquals(16L, response.getProductId());
        assertTrue(response.getImages().isEmpty());
        // Khi không có ảnh, hệ thống phải tự động trả về ảnh placeholder
        assertEquals("/images/placeholder.png", response.getMainImage());
        assertEquals("/images/placeholder.png", response.getHoverImage());

        verify(productRepository, times(1)).save(any(Product.class));
    }
}
