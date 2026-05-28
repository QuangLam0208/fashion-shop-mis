package com.fashion.service.product;

import com.fashion.dto.request.UpdateProductRequestDTO;
import com.fashion.model.Category;
import com.fashion.model.Product;
import com.fashion.model.ProductImage;
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

        ProductImage oldImage = new ProductImage();
        oldImage.setId(100L);
        oldImage.setUrl("https://example.com/old-image.jpg");
        List<ProductImage> images = new ArrayList<>();
        images.add(oldImage);
        mockProduct.setImages(images);

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

    @Test
    void testUpdateProduct_Success_ReplaceImages() {
        // Arrange
        when(productRepository.findById(1L)).thenReturn(Optional.of(mockProduct));
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(mockCategory));
        when(reviewRepository.getAverageRatingByProductId(anyLong())).thenReturn(0.0);
        when(reviewRepository.countByProductId(anyLong())).thenReturn(0L);
        when(reviewRepository.findByProductId(anyLong(), any())).thenReturn(new org.springframework.data.domain.PageImpl<>(new ArrayList<>()));

        // Gửi request CÓ mảng ảnh mới
        updateRequest.setImageUrls(List.of("https://example.com/new-pic-1.jpg", "https://example.com/new-pic-2.jpg"));

        // Cần thêm 1 variant để pass Validation DTO/Logic
        updateRequest.getVariants().add(new UpdateProductRequestDTO.ProductVariantRequestDTO(10L, "M", "Đen", 50L));

        // Act
        productService.updateProduct(1L, updateRequest);

        // Assert
        assertEquals(2, mockProduct.getImages().size(), "Phải có đúng 2 ảnh mới");
        assertTrue(mockProduct.getImages().stream().anyMatch(img -> img.getUrl().equals("https://example.com/new-pic-1.jpg")));
        assertFalse(mockProduct.getImages().stream().anyMatch(img -> img.getUrl().equals("https://example.com/old-image.jpg")), "Ảnh cũ phải bị xóa");
    }

    @Test
    void testUpdateProduct_Success_KeepExistingImages() {
        // Arrange
        when(productRepository.findById(1L)).thenReturn(Optional.of(mockProduct));
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(mockCategory));
        when(reviewRepository.getAverageRatingByProductId(anyLong())).thenReturn(0.0);
        when(reviewRepository.countByProductId(anyLong())).thenReturn(0L);
        when(reviewRepository.findByProductId(anyLong(), any())).thenReturn(new org.springframework.data.domain.PageImpl<>(new ArrayList<>()));

        // Gửi request KHÔNG CÓ mảng ảnh (null)
        updateRequest.setImageUrls(null);

        // Cần thêm 1 variant để pass Validation
        updateRequest.getVariants().add(new UpdateProductRequestDTO.ProductVariantRequestDTO(10L, "M", "Đen", 50L));

        // Act
        productService.updateProduct(1L, updateRequest);

        // Assert
        assertEquals(1, mockProduct.getImages().size(), "Số lượng ảnh cũ phải được bảo toàn");
        assertEquals("https://example.com/old-image.jpg", mockProduct.getImages().get(0).getUrl(), "URL ảnh cũ không được thay đổi");
    }

    @Test
    void testUpdateProduct_Fail_VariantNotBelongToProduct() {
        // Arrange
        when(productRepository.findById(1L)).thenReturn(Optional.of(mockProduct));
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(mockCategory));

        // Payload: Cố tình gửi lên một variantId (999L) không có trong mockProduct (chỉ có 10L và 20L)
        updateRequest.getVariants().add(
                new UpdateProductRequestDTO.ProductVariantRequestDTO(999L, "S", "Hồng", 10L)
        );

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            productService.updateProduct(1L, updateRequest);
        });

        // Kiểm tra xem message lỗi có đúng chuẩn như đã code trong Service không
        assertTrue(exception.getMessage().contains("không tồn tại hoặc không thuộc về sản phẩm này"));
        verify(productRepository, never()).save(any(Product.class)); // Đảm bảo chưa lưu xuống DB
    }

    @Test
    void testUpdateProduct_Fail_EmptyImageArray() {
        // Arrange
        when(productRepository.findById(1L)).thenReturn(Optional.of(mockProduct));
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(mockCategory));

        // Payload: Gửi mảng ảnh rỗng [] (ý đồ xóa hết ảnh)
        updateRequest.setImageUrls(new ArrayList<>());

        // Thêm 1 variant hợp lệ để không bị văng lỗi thiếu variant trước khi check tới ảnh
        updateRequest.getVariants().add(
                new UpdateProductRequestDTO.ProductVariantRequestDTO(10L, "M", "Đen", 50L)
        );

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            productService.updateProduct(1L, updateRequest);
        });

        assertTrue(exception.getMessage().contains("Phải có ít nhất một ảnh sản phẩm"));
        verify(productRepository, never()).save(any(Product.class));
    }
}
