package com.fashion.service.cart;

import com.fashion.dto.request.AddToCartRequestDTO;
import com.fashion.dto.response.CartItemResponseDTO;
import com.fashion.model.*;
import com.fashion.repository.CartItemRepository;
import com.fashion.repository.ProductVariantRepository;
import com.fashion.repository.UserRepository;
import com.fashion.service.cart_item.CartServiceImpl;
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
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CartServiceImplTest {

    @Mock
    private CartItemRepository cartItemRepository;

    @Mock
    private ProductVariantRepository productVariantRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private CartServiceImpl cartService;

    private User mockUser;
    private ProductVariant mockVariant;
    private Product mockProduct;

    @BeforeEach
    void setUp() {
        mockUser = User.builder().id(1L).fullName("Test User").build();

        mockProduct = Product.builder().id(100L).name("Áo Thun").images(new ArrayList<>()).build();
        ProductImage image = ProductImage.builder().id(1L).url("image.png").color("Đỏ").build();
        mockProduct.getImages().add(image);

        mockVariant = ProductVariant.builder()
                .id(10L)
                .product(mockProduct)
                .size("M")
                .color("Đỏ")
                .stockQuantity(50L) // Tồn kho mặc định 50
                .price(150000.0)
                .build();
    }

    // AC-BE-US18-01: Add mới thành công
    @Test
    void addToCart_NewItem_Success() {
        AddToCartRequestDTO dto = new AddToCartRequestDTO(10L, 2);

        when(productVariantRepository.findById(10L)).thenReturn(Optional.of(mockVariant));
        when(cartItemRepository.findByUser_IdAndProductVariant_Id(1L, 10L)).thenReturn(Optional.empty());
        when(userRepository.findById(1L)).thenReturn(Optional.of(mockUser));

        when(cartItemRepository.save(any(CartItem.class))).thenAnswer(i -> {
            CartItem savedItem = i.getArgument(0);
            savedItem.setId(1000L); // Giả lập DB sinh ID
            return savedItem;
        });

        CartItemResponseDTO response = cartService.addToCart(1L, dto);

        assertNotNull(response);
        assertEquals(1000L, response.getCartItemId());
        assertEquals(10L, response.getVariantId());
        assertEquals(2, response.getQuantity());
        assertEquals("image.png", response.getPrimaryImageUrl()); // Test luôn logic fallback image
        verify(cartItemRepository, times(1)).save(any(CartItem.class));
    }

    // AC-BE-US18-05: Cộng dồn số lượng khi đã tồn tại
    @Test
    void addToCart_ExistingItem_MergesQuantity_Success() {
        AddToCartRequestDTO dto = new AddToCartRequestDTO(10L, 3);

        CartItem existingItem = CartItem.builder()
                .id(1000L).user(mockUser).productVariant(mockVariant).quantity(2).build();

        when(productVariantRepository.findById(10L)).thenReturn(Optional.of(mockVariant));
        when(cartItemRepository.findByUser_IdAndProductVariant_Id(1L, 10L)).thenReturn(Optional.of(existingItem));
        when(cartItemRepository.save(any(CartItem.class))).thenReturn(existingItem);

        CartItemResponseDTO response = cartService.addToCart(1L, dto);

        assertEquals(1000L, response.getCartItemId());
        assertEquals(5, response.getQuantity()); // 2 cũ + 3 mới
        verify(cartItemRepository, times(1)).save(existingItem);
    }

    // AC-BE-US18-03: Variant không tồn tại
    @Test
    void addToCart_VariantNotFound_ThrowsException() {
        AddToCartRequestDTO dto = new AddToCartRequestDTO(99L, 1);
        when(productVariantRepository.findById(99L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class, () -> cartService.addToCart(1L, dto));
        assertEquals("Sản phẩm không tồn tại!", ex.getMessage());
    }

    // AC-BE-US18-04: Thêm mới vượt quá tồn kho
    @Test
    void addToCart_NewItem_ExceedsStock_ThrowsException() {
        mockVariant.setStockQuantity(5L); // Kho chỉ còn 5
        AddToCartRequestDTO dto = new AddToCartRequestDTO(10L, 6); // Yêu cầu 6

        when(productVariantRepository.findById(10L)).thenReturn(Optional.of(mockVariant));

        RuntimeException ex = assertThrows(RuntimeException.class, () -> cartService.addToCart(1L, dto));
        assertEquals("Sản phẩm không đủ số lượng trong kho!", ex.getMessage());
    }

    // AC-BE-US18-04: Cộng dồn vượt quá tồn kho
    @Test
    void addToCart_ExistingItem_MergeExceedsStock_ThrowsException() {
        mockVariant.setStockQuantity(10L); // Kho có 10
        CartItem existingItem = CartItem.builder()
                .id(1000L).user(mockUser).productVariant(mockVariant).quantity(8).build(); // Đã có 8

        AddToCartRequestDTO dto = new AddToCartRequestDTO(10L, 3); // Thêm 3 (tổng 11 > 10)

        when(productVariantRepository.findById(10L)).thenReturn(Optional.of(mockVariant));
        when(cartItemRepository.findByUser_IdAndProductVariant_Id(1L, 10L)).thenReturn(Optional.of(existingItem));

        RuntimeException ex = assertThrows(RuntimeException.class, () -> cartService.addToCart(1L, dto));
        assertTrue(ex.getMessage().contains("Tổng số lượng vượt quá tồn kho!"));
        verify(cartItemRepository, never()).save(any());
    }
    // 6. AC-BE-US18-06 (Optional): Mapping image URL theo color fallback
    @Test
    void addToCart_ImageMappingFallback_Success() {
        // Arrange
        AddToCartRequestDTO dto = new AddToCartRequestDTO(10L, 1);

        // Tạo Product với 2 ảnh: 1 ảnh màu "Xanh", 1 ảnh màu "Đen"
        Product productWithImages = Product.builder().id(100L).name("Áo Thun").images(new ArrayList<>()).build();
        productWithImages.getImages().add(ProductImage.builder().id(1L).url("anh-xanh.png").color("Xanh").build());
        productWithImages.getImages().add(ProductImage.builder().id(2L).url("anh-den.png").color("Đen").build());

        // Variant khách chọn là màu "Đỏ" (Không khớp với ảnh Xanh hay Đen ở trên)
        ProductVariant variantRed = ProductVariant.builder()
                .id(10L)
                .product(productWithImages)
                .size("M")
                .color("Đỏ")
                .stockQuantity(50L)
                .price(150000.0)
                .build();

        when(productVariantRepository.findById(10L)).thenReturn(Optional.of(variantRed));
        when(cartItemRepository.findByUser_IdAndProductVariant_Id(1L, 10L)).thenReturn(Optional.empty());
        when(userRepository.findById(1L)).thenReturn(Optional.of(mockUser));

        when(cartItemRepository.save(any(CartItem.class))).thenAnswer(i -> {
            CartItem savedItem = i.getArgument(0);
            savedItem.setId(1001L);
            return savedItem;
        });

        // Act
        CartItemResponseDTO response = cartService.addToCart(1L, dto);

        // Assert
        assertNotNull(response);
        // Vì màu "Đỏ" không có ảnh tương ứng -> Hệ thống phải fallback lấy ảnh đầu tiên trong list là "anh-xanh.png"
        assertEquals("anh-xanh.png", response.getPrimaryImageUrl(), "Hệ thống phải fallback về ảnh đầu tiên khi không khớp màu");
    }
}