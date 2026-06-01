package com.fashion.service.review;

import com.fashion.dto.request.SubmitReviewRequestDTO;
import com.fashion.dto.response.MessageResponseDTO;
import com.fashion.dto.response.ReviewResponseDTO;
import com.fashion.model.OrderItem;
import com.fashion.model.Product;
import com.fashion.model.Review;
import com.fashion.model.User;
import com.fashion.model.enums.OrderStatus;
import com.fashion.repository.OrderItemRepository;
import com.fashion.repository.ProductRepository;
import com.fashion.repository.ReviewRepository;
import com.fashion.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.SimpleDateFormat;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderItemRepository orderItemRepository;

    @Override
    @Transactional
    public MessageResponseDTO submitReview(Long userId, SubmitReviewRequestDTO dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại!"));

        Product product = productRepository.findById(dto.getProductId())
                .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại!"));

        // Kiểm tra khách hàng đã mua sản phẩm và OrderItem đã ở trạng thái hoàn tất
        boolean hasPurchased = orderItemRepository.existsByOrderUserIdAndStatusAndProductVariantProductId(
                userId, OrderStatus.DELIVERED, dto.getProductId()) ||
                orderItemRepository.existsByOrderUserIdAndStatusAndProductVariantProductId(
                        userId, OrderStatus.COMPLETED, dto.getProductId());

        if (!hasPurchased) {
            throw new RuntimeException("Bạn chỉ có thể đánh giá sản phẩm đã mua và đã giao thành công!");
        }

        // Validate rating
        if (dto.getRating() < 1 || dto.getRating() > 5) {
            throw new RuntimeException("Điểm đánh giá phải từ 1 đến 5!");
        }

        // if (dto.getComment() == null || dto.getComment().isBlank()) {
        // throw new RuntimeException("Nội dung nhận xét không được để trống!");
        // }

        // Lưu đánh giá
        Review review = Review.builder()
                .user(user)
                .product(product)
                .rating(dto.getRating())
                .comment(dto.getComment())
                .createdAt(Instant.now())
                .build();

        // Bỏ chức năng thêm hình ảnh

        // Nếu có orderItemId, đánh dấu OrderItem là đã đánh giá
        if (dto.getOrderItemId() != null) {
            orderItemRepository.findById(dto.getOrderItemId()).ifPresent(item -> {
                item.setReviewed(true);
                orderItemRepository.save(item);
                review.setOrderItem(item);
            });
        } else {
            // Fallback: Tìm OrderItem chưa đánh giá gần nhất của user cho sản phẩm này
            orderItemRepository
                    .findFirstByOrderUserIdAndProductVariantProductIdAndIsReviewedFalseOrderByOrderOrderDateDesc(
                            userId, dto.getProductId())
                    .ifPresent(item -> {
                        item.setReviewed(true);
                        orderItemRepository.save(item);
                        review.setOrderItem(item);
                    });
        }

        reviewRepository.save(review);

        return MessageResponseDTO.builder()
                .message("Gửi đánh giá thành công! Cảm ơn bạn đã đánh giá sản phẩm.")
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ReviewResponseDTO> getReviewsByProduct(Long productId, Pageable pageable) {
        return reviewRepository.findByProductId(productId, pageable).map(this::mapToDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ReviewResponseDTO> getReviewsByUser(Long userId, Pageable pageable) {
        return reviewRepository.findByUserId(userId, pageable).map(this::mapToDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ReviewResponseDTO> getAllReviews(Pageable pageable) {
        return reviewRepository.findAll(pageable).map(this::mapToDTO);
    }

    private ReviewResponseDTO mapToDTO(Review review) {
        String imageUrl = "/images/placeholder.png";
        if (!review.getProduct().getImages().isEmpty()) {
            imageUrl = review.getProduct().getImages().get(0).getUrl();
        }

        ReviewResponseDTO.ReviewResponseDTOBuilder builder = ReviewResponseDTO.builder()
                .reviewId(review.getId())
                .productId(review.getProduct().getId())
                .productName(review.getProduct().getName())
                .productImage(formatImageUrl(imageUrl))
                .userId(review.getUser().getId())
                .customerName(review.getUser().getFullName())
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt() != null ? DateTimeFormatter.ofPattern("dd/MM/yyyy").withZone(ZoneId.systemDefault()).format(review.getCreatedAt()) : "N/A");


        // Bổ sung thông tin đơn hàng (Sử dụng cơ chế Fallback nếu thiếu liên kết trực tiếp)
        OrderItem orderItem = review.getOrderItem();
        if (orderItem == null) {
            orderItem = orderItemRepository
                    .findFirstByOrderUserIdAndProductVariantProductIdOrderByOrderOrderDateDesc(
                            review.getUser().getId(),
                            review.getProduct().getId())
                    .orElse(null);
        }

        if (orderItem != null) {
            builder.price(orderItem.getPrice());
            if (orderItem.getOrder() != null && orderItem.getOrder().getOrderDate() != null) {
                builder.orderDate(new SimpleDateFormat("dd/MM/yyyy").format(orderItem.getOrder().getOrderDate()));
            }
        }

        return builder.build();
    }

    private String formatImageUrl(String url) {
        if (url == null) return "/images/placeholder.png";
        if (url.startsWith("http") || url.startsWith("/")) return url;
        return "/" + url;
    }
}
