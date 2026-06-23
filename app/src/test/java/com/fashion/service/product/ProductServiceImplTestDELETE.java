package com.fashion.service.product;

import com.fashion.exception.BadRequestException;
import com.fashion.exception.ResourceNotFoundException;
import com.fashion.model.Product;
import com.fashion.model.ProductVariant;
import com.fashion.repository.OrderItemRepository;
import com.fashion.repository.ProductCleanupRepository;
import com.fashion.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceImplTestDELETE {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private ProductCleanupRepository cleanupRepository;

    @Mock
    private OrderItemRepository orderItemRepository;

    @InjectMocks
    private ProductServiceImpl productService;

    private Product mockProduct;
    private List<ProductVariant> mockVariants;

    @BeforeEach
    void setUp() {
        mockProduct = new Product();
        mockProduct.setId(1L);
        mockProduct.setName("Sản phẩm thử nghiệm");

        ProductVariant variant1 = new ProductVariant();
        variant1.setId(10L);
        variant1.setSize("M");
        variant1.setColor("Đỏ");

        ProductVariant variant2 = new ProductVariant();
        variant2.setId(20L);
        variant2.setSize("L");
        variant2.setColor("Xanh");

        mockVariants = new ArrayList<>();
        mockVariants.add(variant1);
        mockVariants.add(variant2);
        mockProduct.setVariants(mockVariants);
    }

    // 1. UNIT TEST: delete ok (Xóa thành công khi chưa có đơn hàng và sản phẩm tồn tại)
    @Test
    void testDeleteProduct_Success() {
        // Arrange
        when(productRepository.findById(1L)).thenReturn(Optional.of(mockProduct));
        // Cả 2 biến thể đều chưa được mua
        when(orderItemRepository.existsByProductVariantId(10L)).thenReturn(false);
        when(orderItemRepository.existsByProductVariantId(20L)).thenReturn(false);

        // Act
        assertDoesNotThrow(() -> productService.deleteProduct(1L));

        // Assert
        verify(productRepository, times(1)).findById(1L);
        verify(orderItemRepository, times(1)).existsByProductVariantId(10L);
        verify(orderItemRepository, times(1)).existsByProductVariantId(20L);
        verify(cleanupRepository, times(1)).nuclearDelete(1L);
    }

    // 2. UNIT TEST: delete not found (Báo lỗi 404 khi sản phẩm không tồn tại)
    @Test
    void testDeleteProduct_NotFound() {
        // Arrange
        when(productRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () -> {
            productService.deleteProduct(999L);
        });

        assertEquals("Sản phẩm không tồn tại!", exception.getMessage());
        verify(productRepository, times(1)).findById(999L);
        verify(orderItemRepository, never()).existsByProductVariantId(anyLong());
        verify(cleanupRepository, never()).nuclearDelete(anyLong());
    }

    // 3. UNIT TEST: delete blocked (Bị chặn xóa khi sản phẩm đã phát sinh đơn hàng)
    @Test
    void testDeleteProduct_BlockedByOrder() {
        // Arrange
        when(productRepository.findById(1L)).thenReturn(Optional.of(mockProduct));
        // Giả sử biến thể ID 20 đã phát sinh đơn hàng
        when(orderItemRepository.existsByProductVariantId(10L)).thenReturn(false);
        when(orderItemRepository.existsByProductVariantId(20L)).thenReturn(true);

        // Act & Assert
        BadRequestException exception = assertThrows(BadRequestException.class, () -> {
            productService.deleteProduct(1L);
        });

        assertTrue(exception.getMessage().contains("Không thể xóa sản phẩm này vì đã phát sinh giao dịch mua hàng"));
        verify(productRepository, times(1)).findById(1L);
        // Có thể dừng kiểm tra ngay khi phát hiện biến thể đầu tiên bị ordered (hoặc kiểm tra tất cả tùy cách stream.anyMatch chạy)
        // verify(cleanupRepository, never()) đảm bảo DB không bao giờ thực hiện câu lệnh xóa nuclearDelete
        verify(cleanupRepository, never()).nuclearDelete(1L);
    }
}
