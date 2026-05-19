package com.fashion.service.wishlist;

import com.fashion.dto.response.WishlistItemResponseDTO;
import com.fashion.dto.response.WishlistToggleResponseDTO;
import com.fashion.model.User;
import com.fashion.model.enums.ProductStatus;
import com.fashion.model.Product;
import com.fashion.model.WishlistItem;
import com.fashion.repository.ProductRepository;
import com.fashion.repository.UserRepository;
import com.fashion.repository.WishlistItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;


@Service
@RequiredArgsConstructor
public class WishlistServiceImpl implements WishlistService {

    private final WishlistItemRepository wishlistItemRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    @Override
    public List<WishlistItemResponseDTO> getWishlist(Long userId) {
        List<WishlistItem> items = wishlistItemRepository.findByUserId(userId);

        // Danh sách mục yêu thích trống -> trả về list rỗng, Controller/View sẽ hiển thị thông báo
        return items.stream()
                .map((WishlistItem item) -> {
                    Product product = item.getProduct();
                    return WishlistItemResponseDTO.builder()
                            .wishlistItemId(item.getId())
                            .productId(product.getId())
                            .productName(product.getName())
                            .productPrice(
                                    product.getVariants().isEmpty()
                                            ? 0.0
                                            : product.getVariants().getFirst().getPrice()
                            )
                            .categoryName(product.getCategory() != null ? product.getCategory().getName() : "Uncategorized")
                            .inStock(product.getStatus() == ProductStatus.ACTIVE)
                            .primaryImageUrl(!product.getImages().isEmpty() ? product.getImages().getFirst().getUrl() : null)
                            .build();
                })
                .toList();
    }

    @Override
    @Transactional
    public WishlistToggleResponseDTO toggleWishlist(Long userId, Long productId) {
        Optional<WishlistItem> existing = wishlistItemRepository.findByUserIdAndProductId(userId, productId);

        if (existing.isPresent()) {
            // Đã yêu thích -> Bỏ yêu thích
            wishlistItemRepository.delete(existing.get());
            return WishlistToggleResponseDTO.builder()
                    .productId(productId)
                    .wishlisted(false)
                    .message("Đã xóa sản phẩm khỏi mục yêu thích.")
                    .build();
        } else {
            // Chưa yêu thích -> Thêm vào yêu thích
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại!"));
            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại!"));

            WishlistItem newItem = WishlistItem.builder()
                    .user(user)
                    .product(product)
                    .build();
            wishlistItemRepository.save(newItem);

            return WishlistToggleResponseDTO.builder()
                    .productId(productId)
                    .wishlisted(true)
                    .message("Đã thêm sản phẩm vào mục yêu thích.")
                    .build();
        }
    }

    @Override
    @Transactional
    public void removeWishlistItem(Long userId, Long wishlistItemId) {
        WishlistItem item = wishlistItemRepository.findById(wishlistItemId)
                .orElseThrow(() -> new RuntimeException("Mục yêu thích không tồn tại!"));

        if (!item.getUser().getId().equals(userId)) {
            throw new RuntimeException("Bạn không có quyền xóa mục yêu thích này!");
        }

        wishlistItemRepository.delete(item);
    }
}
