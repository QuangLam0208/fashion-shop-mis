package com.fashion.service.review;

import com.fashion.dto.request.SubmitReviewRequestDTO;
import com.fashion.dto.response.MessageResponseDTO;
import com.fashion.dto.response.ProductReviewListResponseDTO;
import com.fashion.dto.response.ReviewResponseDTO;
import com.fashion.exception.BadRequestException;
import com.fashion.exception.ResourceNotFoundException;
import com.fashion.model.OrderItem;
import com.fashion.model.Product;
import com.fashion.model.Review;
import com.fashion.model.ReviewImage;
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
    public ReviewResponseDTO submitReview(Long userId, SubmitReviewRequestDTO dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng không tồn tại!"));

        Product product = productRepository.findById(dto.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm không tồn tại!"));

        OrderItem targetOrderItem;
        if (dto.getOrderItemId() != null) {
            targetOrderItem = orderItemRepository.findById(dto.getOrderItemId())
                    .orElseThrow(() -> new BadRequestException("OrderItem không tồn tại!"));

            if (!targetOrderItem.getProductVariant().getProduct().getId().equals(dto.getProductId())) {
                throw new BadRequestException("OrderItem không khớp với sản phẩm!");
            }
        } else {
            targetOrderItem = orderItemRepository
                    .findFirstByOrderUserIdAndProductVariantProductIdAndIsReviewedFalseOrderByOrderOrderDateDesc(
                            userId, dto.getProductId())
                    .orElseThrow(() -> new BadRequestException(
                            "Không tìm thấy sản phẩm chưa đánh giá hợp lệ!"));
        }

        // Kiểm tra đơn hàng thuộc user đăng nhập và trạng thái DELIVERED
        if (!targetOrderItem.getOrder().getUser().getId().equals(userId)) {
            throw new BadRequestException("Sản phẩm này không thuộc đơn hàng của bạn!");
        }
        if (targetOrderItem.getStatus() != OrderStatus.DELIVERED) {
            throw new BadRequestException("Bạn chỉ có thể đánh giá sản phẩm đã giao thành công!");
        }

        // Chặn đánh giá trùng lặp
        if (targetOrderItem.isReviewed()) {
            throw new BadRequestException("Mặt hàng này trong đơn đã được đánh giá!");
        }

        // Lưu đánh giá
        Review review = Review.builder()
                .user(user)
                .product(product)
                .rating(dto.getRating())
                .comment(dto.getComment())
                .createdAt(Instant.now())
                .orderItem(targetOrderItem)
                .build();

        // Thêm hình ảnh
        if (dto.getImageUrls() != null && !dto.getImageUrls().isEmpty()) {
            java.util.List<ReviewImage> images = dto.getImageUrls().stream()
                    .map(url -> ReviewImage.builder().imageUrl(url).review(review).build())
                    .toList();
            review.setImages(new java.util.ArrayList<>(images));
        }

        // Đánh dấu OrderItem là đã đánh giá
        targetOrderItem.setReviewed(true);
        orderItemRepository.save(targetOrderItem);

        reviewRepository.save(review);

        return mapToDTO(review);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductReviewListResponseDTO getReviewsByProduct(Long productId, Pageable pageable) {
        if (!productRepository.existsById(productId)) {
            throw new ResourceNotFoundException("Sản phẩm không tồn tại!");
        }

        long count = reviewRepository.countByProductId(productId);
        Double averageRating = 0.0;
        if (count > 0) {
            Double calculatedAvg = reviewRepository.getAverageRatingByProductId(productId);
            if (calculatedAvg != null) {
                averageRating = Math.round(calculatedAvg * 10.0) / 10.0;
            }
        }
        Page<ReviewResponseDTO> reviews = reviewRepository.findByProductId(productId, pageable).map(this::mapToDTO);

        return ProductReviewListResponseDTO.builder()
                .totalReviews(count)
                .averageRating(averageRating)
                .reviews(reviews)
                .build();
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
                .createdAt(
                        review.getCreatedAt() != null
                                ? DateTimeFormatter.ofPattern("dd/MM/yyyy").withZone(ZoneId.systemDefault())
                                        .format(review.getCreatedAt())
                                : "N/A")
                .imageUrls(review.getImages().stream().map(ReviewImage::getImageUrl).toList());

        // Bổ sung thông tin đơn hàng (Sử dụng cơ chế Fallback nếu thiếu liên kết trực
        // tiếp)
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
                builder.orderDate(DateTimeFormatter.ofPattern("dd/MM/yyyy").withZone(ZoneId.systemDefault())
                        .format(orderItem.getOrder().getOrderDate()));
            }
        }

        return builder.build();
    }

    private String formatImageUrl(String url) {
        if (url == null)
            return "/images/placeholder.png";
        if (url.startsWith("http") || url.startsWith("/"))
            return url;
        return "/" + url;
    }
}
