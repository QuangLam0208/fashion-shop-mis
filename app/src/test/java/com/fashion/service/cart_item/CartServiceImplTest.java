package com.fashion.service.cart_item;

import com.fashion.dto.request.AddToCartRequestDTO;
import com.fashion.dto.request.UpdateCartItemRequestDTO;
import com.fashion.dto.response.CartItemResponseDTO;
import com.fashion.dto.response.CartResponseDTO;
import com.fashion.dto.response.MessageResponseDTO;
import com.fashion.exception.BadRequestException;
import com.fashion.exception.ResourceNotFoundException;
import com.fashion.model.*;
import com.fashion.repository.CartItemRepository;
import com.fashion.repository.ProductVariantRepository;
import com.fashion.repository.UserRepository;
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

    // =========================================================================
    // TEST CASES: ADD TO CART
    // =========================================================================

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
        assertEquals("image.png", response.getPrimaryImageUrl());
        verify(cartItemRepository, times(1)).save(any(CartItem.class));
    }

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

    @Test
    void addToCart_VariantNotFound_ThrowsException() {
        AddToCartRequestDTO dto = new AddToCartRequestDTO(99L, 1);
        when(productVariantRepository.findById(99L)).thenReturn(Optional.empty());

        ResourceNotFoundException ex = assertThrows(ResourceNotFoundException.class, () -> cartService.addToCart(1L, dto));
        assertEquals("Sản phẩm không tồn tại!", ex.getMessage());
    }

    @Test
    void addToCart_NewItem_ExceedsStock_ThrowsException() {
        mockVariant.setStockQuantity(5L); // Kho chỉ còn 5
        AddToCartRequestDTO dto = new AddToCartRequestDTO(10L, 6); // Yêu cầu 6

        when(productVariantRepository.findById(10L)).thenReturn(Optional.of(mockVariant));

        BadRequestException ex = assertThrows(BadRequestException.class, () -> cartService.addToCart(1L, dto));
        assertEquals("Sản phẩm không đủ số lượng trong kho!", ex.getMessage());
    }

    @Test
    void addToCart_ExistingItem_MergeExceedsStock_ThrowsException() {
        mockVariant.setStockQuantity(10L); // Kho có 10
        CartItem existingItem = CartItem.builder()
                .id(1000L).user(mockUser).productVariant(mockVariant).quantity(8).build(); // Đã có 8

        AddToCartRequestDTO dto = new AddToCartRequestDTO(10L, 3); // Thêm 3 (tổng 11 > 10)

        when(productVariantRepository.findById(10L)).thenReturn(Optional.of(mockVariant));
        when(cartItemRepository.findByUser_IdAndProductVariant_Id(1L, 10L)).thenReturn(Optional.of(existingItem));

        BadRequestException ex = assertThrows(BadRequestException.class, () -> cartService.addToCart(1L, dto));
        assertTrue(ex.getMessage().contains("Tổng số lượng vượt quá tồn kho!"));
        verify(cartItemRepository, never()).save(any());
    }

    @Test
    void addToCart_ImageMappingFallback_Success() {
        AddToCartRequestDTO dto = new AddToCartRequestDTO(10L, 1);

        Product productWithImages = Product.builder().id(100L).name("Áo Thun").images(new ArrayList<>()).build();
        productWithImages.getImages().add(ProductImage.builder().id(1L).url("anh-xanh.png").color("Xanh").build());
        productWithImages.getImages().add(ProductImage.builder().id(2L).url("anh-den.png").color("Đen").build());

        ProductVariant variantRed = ProductVariant.builder()
                .id(10L).product(productWithImages).size("M").color("Đỏ").stockQuantity(50L).price(150000.0).build();

        when(productVariantRepository.findById(10L)).thenReturn(Optional.of(variantRed));
        when(cartItemRepository.findByUser_IdAndProductVariant_Id(1L, 10L)).thenReturn(Optional.empty());
        when(userRepository.findById(1L)).thenReturn(Optional.of(mockUser));
        when(cartItemRepository.save(any(CartItem.class))).thenAnswer(i -> {
            CartItem savedItem = i.getArgument(0);
            savedItem.setId(1001L);
            return savedItem;
        });

        CartItemResponseDTO response = cartService.addToCart(1L, dto);

        assertNotNull(response);
        assertEquals("anh-xanh.png", response.getPrimaryImageUrl(), "Hệ thống phải fallback về ảnh đầu tiên khi không khớp màu");
    }

    // =========================================================================
    // TEST CASES: GET CART ITEMS
    // =========================================================================

    @Test
    void getCartItems_ReturnsItemsMappedCorrectly() {
        Product product = Product.builder().id(200L).name("Áo Sơ Mi").images(new ArrayList<>()).build();
        ProductVariant variant1 = ProductVariant.builder().id(11L).product(product).size("L").color("Trắng").price(100000.0).build();
        CartItem cartItem1 = CartItem.builder().id(1L).user(mockUser).productVariant(variant1).quantity(2).build();

        when(cartItemRepository.findByUser_Id(1L)).thenReturn(List.of(cartItem1));

        CartResponseDTO response = cartService.getCartItems(1L);

        assertNotNull(response);
        assertEquals(1, response.getItems().size());

        CartItemResponseDTO itemDTO = response.getItems().get(0);
        assertEquals(1L, itemDTO.getCartItemId());
        assertEquals(11L, itemDTO.getVariantId());
        assertEquals(200L, itemDTO.getProductId());
        assertEquals("Áo Sơ Mi", itemDTO.getProductName());
        assertEquals("L", itemDTO.getSize());
        assertEquals("Trắng", itemDTO.getColor());
        assertEquals(100000.0, itemDTO.getPrice());
        assertEquals(2, itemDTO.getQuantity());
    }

    @Test
    void getCartItems_CalculatesTotalAmountCorrectly() {
        Product product = Product.builder().id(200L).name("Test Product").images(new ArrayList<>()).build();
        ProductVariant variant1 = ProductVariant.builder().id(11L).product(product).price(100.0).build();
        CartItem cartItem1 = CartItem.builder().id(1L).user(mockUser).productVariant(variant1).quantity(2).build();
        ProductVariant variant2 = ProductVariant.builder().id(12L).product(product).price(50.0).build();
        CartItem cartItem2 = CartItem.builder().id(2L).user(mockUser).productVariant(variant2).quantity(1).build();

        when(cartItemRepository.findByUser_Id(1L)).thenReturn(List.of(cartItem1, cartItem2));

        CartResponseDTO response = cartService.getCartItems(1L);

        assertEquals(250.0, response.getTotalAmount(), "Tổng tiền phải bằng chính xác 250 (100*2 + 50*1)");
    }

    @Test
    void getCartItems_EmptyCart_ReturnsEmptyListAndZeroTotal() {
        when(cartItemRepository.findByUser_Id(1L)).thenReturn(new ArrayList<>());

        CartResponseDTO response = cartService.getCartItems(1L);

        assertNotNull(response);
        assertTrue(response.getItems().isEmpty(), "Danh sách item phải rỗng");
        assertEquals(0.0, response.getTotalAmount(), "Tổng tiền của giỏ hàng rỗng phải là 0");
    }

    @Test
    void getCartItems_ImageMappingLogic() {
        Product product = Product.builder().id(300L).name("Quần Jean").images(new ArrayList<>()).build();
        product.getImages().add(ProductImage.builder().id(1L).url("img-xanh.jpg").color("Xanh").build());
        product.getImages().add(ProductImage.builder().id(2L).url("img-den.jpg").color("Đen").build());

        ProductVariant variantDen = ProductVariant.builder().id(21L).product(product).color("Đen").price(0.0).build();
        CartItem itemMatch = CartItem.builder().id(1L).user(mockUser).productVariant(variantDen).quantity(1).build();

        ProductVariant variantDo = ProductVariant.builder().id(22L).product(product).color("Đỏ").price(0.0).build();
        CartItem itemFallback = CartItem.builder().id(2L).user(mockUser).productVariant(variantDo).quantity(1).build();

        Product productNoImage = Product.builder().id(301L).name("Phụ kiện").images(new ArrayList<>()).build();
        ProductVariant variantNoImg = ProductVariant.builder().id(23L).product(productNoImage).color("Vàng").price(0.0).build();
        CartItem itemNullImg = CartItem.builder().id(3L).user(mockUser).productVariant(variantNoImg).quantity(1).build();

        when(cartItemRepository.findByUser_Id(1L)).thenReturn(List.of(itemMatch, itemFallback, itemNullImg));

        CartResponseDTO response = cartService.getCartItems(1L);

        assertEquals("img-den.jpg", response.getItems().get(0).getPrimaryImageUrl(), "Phải chọn ảnh khớp màu Đen");
        assertEquals("img-xanh.jpg", response.getItems().get(1).getPrimaryImageUrl(), "Phải fallback về ảnh đầu tiên khi không có màu Đỏ");
        assertNull(response.getItems().get(2).getPrimaryImageUrl(), "Phải trả về null nếu sản phẩm không có ảnh nào");
    }

    // =========================================================================
    // TEST CASES: UPDATE & DELETE CART ITEM
    // =========================================================================

    @Test
    void updateCartItem_Success() {
        UpdateCartItemRequestDTO dto = new UpdateCartItemRequestDTO(100L, 5);
        CartItem cartItem = CartItem.builder()
                .id(100L).user(mockUser).productVariant(mockVariant).quantity(2).build();

        when(cartItemRepository.findById(100L)).thenReturn(Optional.of(cartItem));
        when(cartItemRepository.save(any(CartItem.class))).thenReturn(cartItem);

        CartItemResponseDTO response = cartService.updateCartItem(1L, dto);

        assertNotNull(response);
        assertEquals(5, response.getQuantity());
        verify(cartItemRepository).save(cartItem);
    }

    @Test
    void updateCartItem_NotFound_ThrowsException() {
        UpdateCartItemRequestDTO dto = new UpdateCartItemRequestDTO(99L, 2);
        when(cartItemRepository.findById(99L)).thenReturn(Optional.empty());

        ResourceNotFoundException ex = assertThrows(ResourceNotFoundException.class, () -> cartService.updateCartItem(1L, dto));
        assertEquals("Sản phẩm không có trong giỏ hàng!", ex.getMessage());
    }

    @Test
    void updateCartItem_NotOwned_ThrowsException() {
        User userB = User.builder().id(2L).build(); // Cart thuộc về user 2
        CartItem cartItem = CartItem.builder().id(100L).user(userB).productVariant(mockVariant).quantity(2).build();
        UpdateCartItemRequestDTO dto = new UpdateCartItemRequestDTO(100L, 5);

        when(cartItemRepository.findById(100L)).thenReturn(Optional.of(cartItem));

        BadRequestException ex = assertThrows(BadRequestException.class, () -> cartService.updateCartItem(1L, dto));
        assertEquals("Bạn không có quyền thay đổi giỏ hàng này!", ex.getMessage());
    }

    @Test
    void updateCartItem_ExceedStock_ThrowsException() {
        mockVariant.setStockQuantity(3L); // Kho chỉ có 3
        CartItem cartItem = CartItem.builder().id(100L).user(mockUser).productVariant(mockVariant).quantity(2).build();
        UpdateCartItemRequestDTO dto = new UpdateCartItemRequestDTO(100L, 10); // Cập nhật thành 10

        when(cartItemRepository.findById(100L)).thenReturn(Optional.of(cartItem));

        BadRequestException ex = assertThrows(BadRequestException.class, () -> cartService.updateCartItem(1L, dto));
        assertEquals("Số lượng vượt quá tồn kho!", ex.getMessage());
    }

    @Test
    void removeCartItem_Success() {
        CartItem cartItem = CartItem.builder().id(100L).user(mockUser).build();
        when(cartItemRepository.findById(100L)).thenReturn(Optional.of(cartItem));

        MessageResponseDTO response = cartService.removeCartItem(1L, 100L);

        assertEquals("Đã xóa sản phẩm khỏi giỏ hàng.", response.getMessage());
        verify(cartItemRepository).delete(cartItem);
    }

    @Test
    void removeCartItem_NotFound_ThrowsException() {
        when(cartItemRepository.findById(99L)).thenReturn(Optional.empty());

        ResourceNotFoundException ex = assertThrows(ResourceNotFoundException.class, () -> cartService.removeCartItem(1L, 99L));
        assertEquals("Sản phẩm không có trong giỏ hàng!", ex.getMessage());
    }

    @Test
    void removeCartItem_NotOwned_ThrowsException() {
        User userB = User.builder().id(2L).build();
        CartItem cartItem = CartItem.builder().id(100L).user(userB).build();

        when(cartItemRepository.findById(100L)).thenReturn(Optional.of(cartItem));

        BadRequestException ex = assertThrows(BadRequestException.class, () -> cartService.removeCartItem(1L, 100L));
        assertEquals("Bạn không có quyền xóa sản phẩm này!", ex.getMessage());
    }
}