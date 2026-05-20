package com.fashion.service.cart_item;

import com.fashion.dto.request.AddToCartRequestDTO;
import com.fashion.dto.request.UpdateCartItemRequestDTO;
import com.fashion.dto.response.CartItemResponseDTO;
import com.fashion.dto.response.CartResponseDTO;
import com.fashion.dto.response.MessageResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

public interface CartService {
    // Quản lý giỏ hàng - Xem giỏ hàng
    CartResponseDTO getCartItems(Long userId);

    // Thêm vào giỏ hàng
    CartItemResponseDTO addToCart(Long userId, AddToCartRequestDTO dto);

    // Cập nhật số lượng sản phẩm trong giỏ
    CartItemResponseDTO updateCartItem(Long userId, UpdateCartItemRequestDTO dto);

    // Xóa sản phẩm khỏi giỏ hàng
    MessageResponseDTO removeCartItem(Long userId, Long cartItemId);
}
