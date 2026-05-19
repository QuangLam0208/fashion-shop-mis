package com.fashion.service.wishlist;

import com.fashion.dto.response.WishlistItemResponseDTO;
import com.fashion.dto.response.WishlistToggleResponseDTO;

import java.util.List;

public interface WishlistService {
    // Quản lý mục yêu thích
    List<WishlistItemResponseDTO> getWishlist(Long userId);
    WishlistToggleResponseDTO toggleWishlist(Long userId, Long productId);
    void removeWishlistItem(Long userId, Long wishlistItemId);
}
