package com.fashion.service.wishlist;

import com.fashion.dto.response.WishlistItemResponseDTO;
import com.fashion.dto.response.WishlistToggleResponseDTO;
import com.fashion.exception.BadRequestException;
import com.fashion.model.Product;
import com.fashion.model.User;
import com.fashion.model.WishlistItem;
import com.fashion.model.enums.ProductStatus;
import com.fashion.repository.ProductRepository;
import com.fashion.repository.UserRepository;
import com.fashion.repository.WishlistItemRepository;
import com.fashion.util.SecurityUtils;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class WishlistServiceTest {

    @Mock private WishlistItemRepository wishlistItemRepository;
    @Mock private UserRepository userRepository;
    @Mock private ProductRepository productRepository;

    @InjectMocks private WishlistServiceImpl wishlistService;

    private MockedStatic<SecurityUtils> mockedSecurityUtils;
    private final Long mockUserId = 1L;
    private User mockUser;
    private Product mockProduct;

    @BeforeEach
    void setUp() {
        // Giả lập hệ thống Security luôn trả về userId = 1
        mockedSecurityUtils = mockStatic(SecurityUtils.class);
        mockedSecurityUtils.when(SecurityUtils::getAuthenticatedUserId).thenReturn(mockUserId);

        mockUser = User.builder().id(mockUserId).email("minh@student.hcmute.edu.vn").build();
        mockProduct = Product.builder()
                .id(100L)
                .name("Áo thun Premium")
                .status(ProductStatus.ACTIVE)
                .variants(new ArrayList<>())
                .images(new ArrayList<>())
                .build();
    }

    @AfterEach
    void tearDown() {
        // Đóng mock static sau khi test xong để giải phóng bộ nhớ hệ thống
        mockedSecurityUtils.close();
    }

    // ==========================================
    // CHỨC NĂNG 1: TOGGLE WISHLIST
    // ==========================================

    @Test
    void toggleWishlist_AddSuccess_CreatesWishlistItem() {
        Long productId = 100L;
        when(wishlistItemRepository.findByUserIdAndProductId(mockUserId, productId)).thenReturn(Optional.empty());
        when(userRepository.findById(mockUserId)).thenReturn(Optional.of(mockUser));
        when(productRepository.findById(productId)).thenReturn(Optional.of(mockProduct));

        WishlistToggleResponseDTO response = wishlistService.toggleWishlist(mockUserId, productId);

        assertTrue(response.isWishlisted());
        assertEquals("Đã thêm sản phẩm vào mục yêu thích.", response.getMessage());
        verify(wishlistItemRepository, times(1)).save(any(WishlistItem.class));
    }

    @Test
    void toggleWishlist_RemoveSuccess_DeletesWishlistItem() {
        Long productId = 100L;
        WishlistItem existingItem = WishlistItem.builder().id(1L).user(mockUser).product(mockProduct).build();

        when(wishlistItemRepository.findByUserIdAndProductId(mockUserId, productId)).thenReturn(Optional.of(existingItem));

        WishlistToggleResponseDTO response = wishlistService.toggleWishlist(mockUserId, productId);

        assertFalse(response.isWishlisted());
        assertEquals("Đã xóa sản phẩm khỏi mục yêu thích.", response.getMessage());
        verify(wishlistItemRepository, times(1)).delete(existingItem);
    }

    @Test
    void toggleWishlist_ProductNotFound_ThrowsException() {
        Long productId = 999L;

        when(wishlistItemRepository.findByUserIdAndProductId(mockUserId, productId)).thenReturn(Optional.empty());
        when(productRepository.findById(productId)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> wishlistService.toggleWishlist(mockUserId, productId));
        verify(wishlistItemRepository, never()).save(any());
    }

    // ==========================================
    // CHỨC NĂNG 2: REMOVE LIST WISHLIST ITEMS
    // ==========================================

    @Test
    void removeWishlistItems_Success_DeletesAllRequestedItems() {
        List<Long> idsToRemove = List.of(1L, 2L);
        WishlistItem item1 = WishlistItem.builder().id(1L).user(mockUser).build();
        WishlistItem item2 = WishlistItem.builder().id(2L).user(mockUser).build();
        List<WishlistItem> mockFoundList = List.of(item1, item2);

        when(wishlistItemRepository.findWishlistItemByIdInAndUserId(idsToRemove, mockUserId)).thenReturn(mockFoundList);

        assertDoesNotThrow(() -> wishlistService.removeWishlistItems(mockUserId, idsToRemove));
        verify(wishlistItemRepository, times(1)).deleteAllInBatch(mockFoundList);
    }

    @Test
    void removeWishlistItems_ContainsInvalidOrNotOwnedId_ThrowsException() {
        List<Long> idsToRemove = List.of(1L, 999L);
        WishlistItem item1 = WishlistItem.builder().id(1L).user(mockUser).build();
        List<WishlistItem> mockFoundList = List.of(item1);

        when(wishlistItemRepository.findWishlistItemByIdInAndUserId(idsToRemove, mockUserId)).thenReturn(mockFoundList);

        assertThrows(BadRequestException.class, () -> wishlistService.removeWishlistItems(mockUserId, idsToRemove));
        verify(wishlistItemRepository, never()).deleteAllInBatch(any());
    }

    // ==========================================
    // CHỨC NĂNG 3: GET WISHLIST LIST
    // ==========================================

    @Test
    void getWishlist_ReturnsMappedDTOList() {
        WishlistItem item = WishlistItem.builder().id(1L).user(mockUser).product(mockProduct).build();
        when(wishlistItemRepository.findByUserId(mockUserId)).thenReturn(List.of(item));

        List<WishlistItemResponseDTO> result = wishlistService.getWishlist(mockUserId);

        assertFalse(result.isEmpty());
        assertEquals(1, result.size());
        assertEquals("Áo thun Premium", result.get(0).getProductName());
    }
}