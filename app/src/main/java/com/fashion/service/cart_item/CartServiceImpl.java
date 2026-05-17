package com.fashion.service.cart_item;

import com.fashion.dto.request.AddToCartRequestDTO;
import com.fashion.dto.request.UpdateCartItemRequestDTO;
import com.fashion.dto.response.CartItemResponseDTO;
import com.fashion.dto.response.CartResponseDTO;
import com.fashion.dto.response.MessageResponseDTO;
import com.fashion.model.*;
import com.fashion.repository.CartItemRepository;
import com.fashion.repository.ProductVariantRepository;
import com.fashion.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {
    private final CartItemRepository cartItemRepository;
    private final ProductVariantRepository productVariantRepository;
    private final UserRepository userRepository;

    // Quản lý giỏ hàng - Xem toàn bộ giỏ hàng
    @Override
    public CartResponseDTO getCartItems(Long userId) {
        List<CartItem> items = cartItemRepository.findByUser_Id(userId);

        List<CartItemResponseDTO> itemDTOs =  items.stream()
                .map(this::mapToCartItemResponse)
                .toList();

        double total = itemDTOs.stream()
                .mapToDouble(dto -> dto.getPrice() * dto.getQuantity())
                .sum();

        return CartResponseDTO.builder()
                .items(itemDTOs)
                .totalAmount(total)
                .build();
    }

    // Thêm vào giỏ hàng
    @Override
    @Transactional
    public CartItemResponseDTO addToCart(Long userId, AddToCartRequestDTO dto) {
        // Kiểm tra đầy đủ thuộc tính sản phẩm (variantId đã bao gồm size + color)
        if (dto.getVariantId() == null) {
            throw new RuntimeException("Vui lòng chọn đầy đủ thông tin sản phẩm (kích thước, màu sắc)!");
        }

        if (dto.getQuantity() <= 0) {
            throw new RuntimeException("Số lượng phải lớn hơn 0!");
        }

        ProductVariant variant = productVariantRepository.findById(dto.getVariantId())
                .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại!"));

        // Kiểm tra tồn kho
        if (variant.getStockQuantity() < dto.getQuantity()) {
            throw new RuntimeException("Sản phẩm không đủ số lượng trong kho!");
        }

        // Kiểm tra sản phẩm đã tồn tại trong giỏ hàng chưa
        Optional<CartItem> existingItem = cartItemRepository.findByUser_IdAndProductVariant_Id(userId, dto.getVariantId());

        CartItem cartItem;
        if (existingItem.isPresent()) {
            // Sản phẩm đã có → cập nhật số lượng
            cartItem = existingItem.get();
            int newQuantity = cartItem.getQuantity() + dto.getQuantity();

            if (variant.getStockQuantity() < newQuantity) {
                throw new RuntimeException("Tổng số lượng vượt quá tồn kho! Trong kho còn " + variant.getStockQuantity() + " sản phẩm.");
            }

            cartItem.setQuantity(newQuantity);
        } else {
            // Sản phẩm chưa có → thêm mới
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại!"));

            cartItem = CartItem.builder()
                    .user(user)
                    .productVariant(variant)
                    .quantity(dto.getQuantity())
                    .build();
        }

        cartItem = cartItemRepository.save(cartItem);
        return mapToCartItemResponse(cartItem);
    }

    // Cập nhật số lượng sản phẩm trong giỏ
    @Override
    @Transactional
    public CartItemResponseDTO updateCartItem(Long userId, UpdateCartItemRequestDTO dto) {
        CartItem cartItem = cartItemRepository.findById(dto.getCartItemId())
                .orElseThrow(() -> new RuntimeException("Sản phẩm không có trong giỏ hàng!"));

        if (!cartItem.getUser().getId().equals(userId)) {
            throw new RuntimeException("Bạn không có quyền thay đổi giỏ hàng này!");
        }

        if (dto.getQuantity() <= 0) {
            // Nếu số lượng = 0 hoặc âm → xóa khỏi giỏ
            cartItemRepository.delete(cartItem);
            return null;
        }

        // Kiểm tra tồn kho
        if (cartItem.getProductVariant().getStockQuantity() < dto.getQuantity()) {
            throw new RuntimeException("Số lượng vượt quá tồn kho!");
        }

        cartItem.setQuantity(dto.getQuantity());
        cartItem = cartItemRepository.save(cartItem);
        return mapToCartItemResponse(cartItem);
    }

    // Xóa sản phẩm khỏi giỏ hàng
    @Override
    @Transactional
    public MessageResponseDTO removeCartItem(Long userId, Long cartItemId) {
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Sản phẩm không có trong giỏ hàng!"));

        if (!cartItem.getUser().getId().equals(userId)) {
            throw new RuntimeException("Bạn không có quyền xóa sản phẩm này!");
        }

        cartItemRepository.delete(cartItem);

        return MessageResponseDTO.builder()
                .message("Đã xóa sản phẩm khỏi giỏ hàng.")
                .build();
    }

    private CartItemResponseDTO mapToCartItemResponse(CartItem item) {
        ProductVariant variant = item.getProductVariant();
        Product product = variant.getProduct();

        // Tìm hình ảnh phù hợp với màu sắc hoặc lấy hình ảnh đầu tiên
        String imageUrl = null;
        if (variant.getColor() != null && !variant.getColor().isEmpty()) {
            imageUrl = product.getImages().stream()
                    .filter(img -> variant.getColor().equalsIgnoreCase(img.getColor()))
                    .map(ProductImage::getUrl)
                    .findFirst()
                    .orElse(null);
        }

        if (imageUrl == null && !product.getImages().isEmpty()) {
            imageUrl = product.getImages().get(0).getUrl();
        }

        return CartItemResponseDTO.builder()
                .cartItemId(item.getId())
                .variantId(variant.getId())
                .productId(product.getId())
                .productName(product.getName())
                .size(variant.getSize())
                .color(variant.getColor())
                .price(variant.getPrice())
                .quantity(item.getQuantity())
                .primaryImageUrl(imageUrl)
                .build();
    }
}
