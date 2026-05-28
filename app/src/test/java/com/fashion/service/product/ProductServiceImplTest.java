package com.fashion.service.product;

import com.fashion.dto.request.UpdateProductRequestDTO;
import com.fashion.model.Category;
import com.fashion.model.Product;
import com.fashion.model.ProductVariant;
import com.fashion.repository.CategoryRepository;
import com.fashion.repository.OrderItemRepository;
import com.fashion.repository.ProductRepository;
import com.fashion.repository.ReviewRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceImplTest {

    @Mock
    private ProductRepository productRepository;
    @Mock
    private CategoryRepository categoryRepository;
    @Mock
    private OrderItemRepository orderItemRepository;

    @Mock
    private ReviewRepository reviewRepository;

    @InjectMocks
    private ProductServiceImpl productService;

    private Product mockProduct;
    private Category mockCategory;
    private UpdateProductRequestDTO updateRequest;

    @BeforeEach
    void setUp() {
        mockCategory = new Category();
        mockCategory.setId(1L);

        mockProduct = new Product();
        mockProduct.setId(1L);
        mockProduct.setName("Sản phẩm gốc");
        mockProduct.setCategory(mockCategory);

        ProductVariant variant1 = new ProductVariant();
        variant1.setId(10L);
        variant1.setSize("M");
        variant1.setColor("Đen");

        ProductVariant variant2 = new ProductVariant();
        variant2.setId(20L);
        variant2.setSize("L");
        variant2.setColor("Trắng");

        List<ProductVariant> variants = new ArrayList<>();
        variants.add(variant1);
        variants.add(variant2);
        mockProduct.setVariants(variants);

        updateRequest = new UpdateProductRequestDTO();
        updateRequest.setName("Sản phẩm update");
        updateRequest.setCategoryId(1L);
        updateRequest.setPrice(150.0);
        updateRequest.setVariants(new ArrayList<>());
    }

    @Test
    void testUpdateProduct_Success_AddUpdateDeleteVariants() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(mockProduct));

        // Mock Category và OrderItem
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(mockCategory));
        when(orderItemRepository.existsByProductVariantId(20L)).thenReturn(false);

        // Mock ReviewRepository (Dùng cho hàm getProductDetail ở cuối)
        when(reviewRepository.getAverageRatingByProductId(anyLong())).thenReturn(0.0);
        when(reviewRepository.countByProductId(anyLong())).thenReturn(0L);
        when(reviewRepository.findByProductId(anyLong(), any())).thenReturn(new org.springframework.data.domain.PageImpl<>(new ArrayList<>()));

        // Payload: Sửa variant 10, Thêm variant mới (id = null), BỎ QUA variant 20 (để xóa)
        updateRequest.getVariants().add(
                new UpdateProductRequestDTO.ProductVariantRequestDTO(10L, "M", "Đen nhánh", 100L)
        );
        updateRequest.getVariants().add(
                new UpdateProductRequestDTO.ProductVariantRequestDTO(null, "XL", "Đỏ", 30L)
        );

        productService.updateProduct(1L, updateRequest);

        verify(productRepository, times(1)).save(mockProduct);
        assertEquals(2, mockProduct.getVariants().size()); // Chỉ còn lại 10 và XL mới

        // Kiểm tra Update biến thể 10
        ProductVariant updated = mockProduct.getVariants().stream().filter(v -> v.getId() != null).findFirst().get();
        assertEquals("Đen nhánh", updated.getColor());
        assertEquals(100L, updated.getStockQuantity());

        // Kiểm tra Thêm mới XL
        ProductVariant added = mockProduct.getVariants().stream().filter(v -> v.getId() == null).findFirst().get();
        assertEquals("XL", added.getSize());
    }

    @Test
    void testUpdateProduct_Fail_DeleteVariantWithExistingOrder() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(mockProduct));
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(mockCategory));

        // Payload chỉ có biến thể 10 -> Hệ thống sẽ cố gắng xóa biến thể 20
        updateRequest.getVariants().add(
                new UpdateProductRequestDTO.ProductVariantRequestDTO(10L, "M", "Đen", 50L)
        );

        // Giả lập Database báo: "Biến thể 20 đã có người mua rồi"
        when(orderItemRepository.existsByProductVariantId(20L)).thenReturn(true);

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            productService.updateProduct(1L, updateRequest);
        });

        assertTrue(exception.getMessage().contains("đã phát sinh giao dịch"));
        verify(productRepository, never()).save(any(Product.class));
    }
}
