package com.fashion.service.wishlist;

import com.fashion.dto.request.RemoveWishlistRequestDTO;
import com.fashion.dto.response.WishlistItemResponseDTO;
import com.fashion.dto.response.WishlistToggleResponseDTO;
import com.fashion.exception.BadRequestException;
import com.fashion.exception.ResourceNotFoundException;
import com.fashion.model.User;
import com.fashion.model.enums.ProductStatus;
import com.fashion.model.Product;
import com.fashion.model.WishlistItem;
import com.fashion.repository.ProductRepository;
import com.fashion.repository.UserRepository;
import com.fashion.repository.WishlistItemRepository;
import com.fashion.util.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.RequestBody;

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
                                            : product.getVariants().get(0).getPrice()
                            )
                            .categoryName(product.getCategory() != null ? product.getCategory().getName() : "Uncategorized")
                            .inStock(product.getStatus() == ProductStatus.ACTIVE)
                            .primaryImageUrl(!product.getImages().isEmpty() ? product.getImages().get(0).getUrl() : null)
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
                    .orElseThrow(() -> new BadRequestException("Người dùng không tồn tại!"));
            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new BadRequestException("Sản phẩm không tồn tại!"));

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

    @Transactional
    @Override
    public void removeWishlistItems(Long userId, List<Long> wishlistItemIds) {
        List<WishlistItem> wishlistItems = wishlistItemRepository.findWishlistItemByIdInAndUserId(wishlistItemIds, userId);
        if (wishlistItems.size() != wishlistItemIds.size()) {
            throw new BadRequestException("Mot hoac nhieu muc yeu thich khong thuoc nguoi dung");
        }
        wishlistItemRepository.deleteAllInBatch(wishlistItems);
    }
}