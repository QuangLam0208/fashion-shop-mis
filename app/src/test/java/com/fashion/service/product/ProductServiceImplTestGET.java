package com.fashion.service.product;

import com.fashion.dto.response.ProductDetailResponseDTO;
import com.fashion.dto.response.ProductSummaryResponseDTO;
import com.fashion.model.enums.ProductStatus;
import com.fashion.exception.ResourceNotFoundException;
import com.fashion.model.*;
import com.fashion.repository.CategoryRepository;
import com.fashion.repository.ProductRepository;
import com.fashion.repository.ReviewRepository;
import com.fashion.service.category.CategoryService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceImplTestGET {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private ReviewRepository reviewRepository;

    @InjectMocks
    private ProductServiceImpl productService;

    @Test
    void testGetProducts_WithKeywordOnly_CategoryIdIsNull() {
        // Arrange
        String keyword = "áo sơ mi";
        Pageable pageable = PageRequest.of(0, 12);
        Page<Product> emptyPage = new PageImpl<>(new ArrayList<>());

        when(productRepository.findFiltered(eq(keyword), eq(List.of(-1L)), eq(false), eq(pageable)))
                .thenReturn(emptyPage);

        // Act
        Page<ProductSummaryResponseDTO> result = productService.getProducts(keyword, null, pageable);

        // Assert
        assertNotNull(result);

        // Đã xóa verify categoryService vì code bạn không dùng nữa
        // categoryId là null nên không có hàm đệ quy nào chạy vào Database
        verify(productRepository, times(1)).findFiltered(eq(keyword), eq(List.of(-1L)), eq(false), eq(pageable));
    }

    @Test
    void testGetProducts_WithCategoryId_IncludeDescendants() {
        // Arrange
        Long categoryId = 1L;
        String keyword = null;
        Pageable pageable = PageRequest.of(0, 12);
        Page<Product> emptyPage = new PageImpl<>(new ArrayList<>());

        // --- CẬP NHẬT Ở ĐÂY: GIẢ LẬP DỮ LIỆU CHO HÀM PRIVATE ĐỆ QUY ---
        // Giả lập: Category cha 1L có 2 con là 2L và 3L. Hai thằng con không có cháu.
        Category child1 = new Category(); child1.setId(2L);
        Category child2 = new Category(); child2.setId(3L);

        // LƯU Ý: Nếu hàm private của bạn gọi qua `categoryService`, hãy đổi `categoryRepository` thành `categoryService` ở đoạn mock dưới đây
        when(categoryRepository.findByParentId(1L)).thenReturn(List.of(child1, child2));
        when(categoryRepository.findByParentId(2L)).thenReturn(new ArrayList<>());
        when(categoryRepository.findByParentId(3L)).thenReturn(new ArrayList<>());

        // Vì hàm private sẽ CHẠY THẬT, nó sẽ tự động gom các kết quả giả lập ở trên thành list [1L, 2L, 3L]
        List<Long> expectedDescendantIds = List.of(1L, 2L, 3L);

        when(productRepository.findFiltered(eq(null), eq(expectedDescendantIds), eq(true), eq(pageable)))
                .thenReturn(emptyPage);

        // Act
        Page<ProductSummaryResponseDTO> result = productService.getProducts(keyword, categoryId, pageable);

        // Assert
        assertNotNull(result);

        // Kiểm tra xem hàm đệ quy bên trong có gọi xuống Repository đúng 3 lần không
        verify(categoryRepository, times(1)).findByParentId(1L);
        verify(categoryRepository, times(1)).findByParentId(2L);
        verify(categoryRepository, times(1)).findByParentId(3L);

        // Kiểm tra list ID cuối cùng được truyền vào SQL Query có chính xác không
        verify(productRepository, times(1)).findFiltered(eq(null), eq(expectedDescendantIds), eq(true), eq(pageable));
    }

    @Test
    void testGetProductDetail_FullData_Success() {
        // Arrange: Chuẩn bị 1 sản phẩm có đầy đủ danh mục, ảnh, biến thể, review
        Long productId = 1L;

        Category parentCat = new Category(); parentCat.setName("Áo");
        Category childCat = new Category(); childCat.setName("Áo thun"); childCat.setId(10L); childCat.setParent(parentCat);

        Product product = new Product();
        product.setId(productId);
        product.setName("Áo thun nam");
        product.setDescription("Mô tả chi tiết");
        product.setStatus(ProductStatus.ACTIVE);
        product.setCategory(childCat);

        // Biến thể (Variants)
        ProductVariant variant1 = new ProductVariant(); variant1.setId(101L); variant1.setPrice(150000.0); variant1.setSize("M"); variant1.setColor("Đỏ"); variant1.setStockQuantity(50L);
        ProductVariant variant2 = new ProductVariant(); variant2.setId(102L); variant2.setPrice(100000.0); variant2.setSize("S"); variant2.setColor("Xanh"); variant2.setStockQuantity(20L);
        product.setVariants(List.of(variant1, variant2));

        // Ảnh (Images)
        ProductImage img1 = new ProductImage(); img1.setId(201L); img1.setUrl("img1.png"); img1.setColor("Đỏ");
        ProductImage img2 = new ProductImage(); img2.setId(202L); img2.setUrl("img2.png"); img2.setColor("Xanh");
        product.setImages(List.of(img1, img2));

        // Review
        User user = new User(); user.setFullName("Nguyen Van A");
        OrderItem orderItem = new OrderItem(); orderItem.setProductVariant(variant1);
        Review review = new Review(); review.setId(301L); review.setRating(5); review.setComment("Rất tốt");
        review.setUser(user); review.setOrderItem(orderItem); review.setCreatedAt(Instant.now());

        // Mocks
        when(productRepository.findById(productId)).thenReturn(Optional.of(product));
        when(reviewRepository.getAverageRatingByProductId(productId)).thenReturn(4.5);
        when(reviewRepository.countByProductId(productId)).thenReturn(15L);
        when(reviewRepository.findByProductId(eq(productId), any(PageRequest.class)))
                .thenReturn(new PageImpl<>(List.of(review)));

        // Act
        ProductDetailResponseDTO response = productService.getProductDetail(productId);

        // Assert
        assertNotNull(response);
        assertEquals(productId, response.getProductId());
        assertEquals("Áo thun nam", response.getName());
        assertEquals("Mô tả chi tiết", response.getDescription());
        assertEquals(10L, response.getCategoryId());

        // Kiểm tra logic lấy giá Min và giá hiển thị mặc định
        assertEquals(150000.0, response.getPrice()); // Giá của variant đầu tiên
        assertEquals(100000.0, response.getMinPrice()); // Giá thấp nhất trong các variants

        // Kiểm tra Rating & Reviews
        assertEquals(4.5, response.getAverageRating());
        assertEquals(15L, response.getReviewCount());
        assertEquals(1, response.getReviews().size());
        assertEquals("Nguyen Van A", response.getReviews().get(0).getReviewerName());

        // Kiểm tra logic Ảnh (Main / Hover)
        assertTrue(response.getMainImage().contains("img1.png"));
        assertTrue(response.getHoverImage().contains("img2.png")); // Ảnh 2 làm hover

        verify(productRepository, times(1)).findById(productId);
    }

    @Test
    void testGetProductDetail_EmptyData_Success() {
        // Arrange: Sản phẩm KHÔNG có ảnh, biến thể, review (Cover các nhánh toán tử 3 ngôi rỗng)
        Long productId = 2L;
        Product emptyProduct = new Product();
        emptyProduct.setId(productId);
        emptyProduct.setName("Sản phẩm trống");
        emptyProduct.setVariants(new ArrayList<>());
        emptyProduct.setImages(new ArrayList<>());
        emptyProduct.setCategory(null);

        when(productRepository.findById(productId)).thenReturn(Optional.of(emptyProduct));
        when(reviewRepository.getAverageRatingByProductId(productId)).thenReturn(null); // Cover avgRating null
        when(reviewRepository.countByProductId(productId)).thenReturn(0L);
        when(reviewRepository.findByProductId(eq(productId), any(Pageable.class)))
                .thenReturn(new PageImpl<>(new ArrayList<>()));

        // Act
        ProductDetailResponseDTO response = productService.getProductDetail(productId);

        // Assert
        assertNotNull(response);
        assertEquals(0.0, response.getPrice());
        assertEquals(0.0, response.getMinPrice());
        assertNull(response.getCategoryId());
        assertEquals(0.0, response.getAverageRating()); // Đảm bảo null -> 0.0
        assertEquals(0L, response.getReviewCount());
        assertEquals(0, response.getReviews().size());

        // Kiểm tra logic placeholder cho ảnh
        assertTrue(response.getMainImage().contains("/images/placeholder.png"));
        assertTrue(response.getHoverImage().contains("/images/placeholder.png"));
    }

    @Test
    void testGetProductDetail_NotFound_ThrowsException() {
        // Arrange
        Long invalidId = 999L;
        when(productRepository.findById(invalidId)).thenReturn(Optional.empty());

        // Act & Assert
        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class,
                () -> productService.getProductDetail(invalidId));

        assertEquals("Sản phẩm không tồn tại hoặc đã bị ngừng kinh doanh!", exception.getMessage());

        // Đảm bảo không gọi xuống database lấy review khi không tìm thấy sản phẩm
        verify(reviewRepository, never()).getAverageRatingByProductId(anyLong());
        verify(reviewRepository, never()).countByProductId(anyLong());
        verify(reviewRepository, never()).findByProductId(anyLong(), any(Pageable.class));
    }

    // =========================================================================
    // TEST CASES CHO GET RELATED PRODUCTS (AC-US17)
    // =========================================================================

    @Test
    void testGetRelatedProducts_Success_ExcludesSelfAndLimits() {
        // Arrange (AC-US17-01: Cùng danh mục, loại trừ X, giới hạn limit)
        Long productId = 1L;
        int limit = 4;

        Category category = new Category();
        category.setId(10L);
        category.setName("Áo Sơ Mi");

        Product currentProduct = new Product();
        currentProduct.setId(productId);
        currentProduct.setName("Sản phẩm X");
        currentProduct.setCategory(category);

        // Tạo danh sách sản phẩm cùng danh mục trả về từ DB (Bao gồm cả chính nó và 5 sản phẩm khác)
        Product p1 = currentProduct; // Chính nó (sẽ bị loại)
        Product p2 = new Product(); p2.setId(2L); p2.setName("SP 2"); p2.setVariants(new ArrayList<>()); p2.setImages(new ArrayList<>());
        Product p3 = new Product(); p3.setId(3L); p3.setName("SP 3"); p3.setVariants(new ArrayList<>()); p3.setImages(new ArrayList<>());
        Product p4 = new Product(); p4.setId(4L); p4.setName("SP 4"); p4.setVariants(new ArrayList<>()); p4.setImages(new ArrayList<>());
        Product p5 = new Product(); p5.setId(5L); p5.setName("SP 5"); p5.setVariants(new ArrayList<>()); p5.setImages(new ArrayList<>());
        Product p6 = new Product(); p6.setId(6L); p6.setName("SP 6"); p6.setVariants(new ArrayList<>()); p6.setImages(new ArrayList<>()); // SP này sẽ bị cắt bởi limit

        List<Product> mockDbProducts = List.of(p1, p2, p3, p4, p5, p6);
        Page<Product> mockPage = new PageImpl<>(mockDbProducts);

        when(productRepository.findById(productId)).thenReturn(Optional.of(currentProduct));

        // Cần truyền limit + 1 = 5 vào PageRequest theo đúng code của bạn
        when(productRepository.findByCategoryIds(eq(List.of(10L)), any(Pageable.class)))
                .thenReturn(mockPage);

        // Mock review cho mapToSummaryDTO (Tránh null pointer)
        when(reviewRepository.getAverageRatingByProductId(anyLong())).thenReturn(4.5);
        when(reviewRepository.countByProductId(anyLong())).thenReturn(10L);

        // Act
        List<ProductSummaryResponseDTO> result = productService.getRelatedProducts(productId, limit);

        // Assert
        assertNotNull(result);
        assertEquals(limit, result.size()); // Đảm bảo chỉ lấy tối đa 4 sản phẩm

        // Đảm bảo không có "Sản phẩm X" (ID = 1L) trong kết quả trả về
        boolean containsSelf = result.stream().anyMatch(dto -> dto.getProductId().equals(productId));
        assertFalse(containsSelf, "Danh sách không được chứa sản phẩm hiện tại");

        verify(productRepository, times(1)).findById(productId);
        verify(productRepository, times(1)).findByCategoryIds(eq(List.of(10L)), any(Pageable.class));
    }

    @Test
    void testGetRelatedProducts_NotFound_ThrowsException() {
        // Arrange
        Long invalidId = 999L;
        when(productRepository.findById(invalidId)).thenReturn(Optional.empty());

        // Act & Assert
        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class,
                () -> productService.getRelatedProducts(invalidId, 4));

        assertEquals("Sản phẩm không tồn tại!", exception.getMessage());

        verify(productRepository, never()).findByCategoryIds(anyList(), any(Pageable.class));
    }
}