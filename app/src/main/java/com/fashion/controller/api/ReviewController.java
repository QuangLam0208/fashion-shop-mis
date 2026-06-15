package com.fashion.controller.api;

import com.fashion.dto.request.SubmitReviewRequestDTO;
import com.fashion.dto.response.MessageResponseDTO;
import com.fashion.dto.response.ReviewResponseDTO;
import com.fashion.service.review.ReviewService;
import com.fashion.util.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.web.PageableDefault;
import org.springframework.data.domain.Sort;

import com.fashion.dto.response.ProductReviewListResponseDTO;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;
    private final com.fashion.repository.OrderRepository orderRepository;
    private final com.fashion.repository.OrderItemRepository orderItemRepository;

    // THÊM ĐÁNH GIÁ
    @PostMapping
    public ResponseEntity<ReviewResponseDTO> submitReview(
            @Valid @RequestBody SubmitReviewRequestDTO dto) {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(reviewService.submitReview(userId, dto));
    }

    @GetMapping("/my")
    public ResponseEntity<Page<ReviewResponseDTO>> getMyReviews(
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        return ResponseEntity.ok(reviewService.getReviewsByUser(userId, pageable));
    }

    // XEM ĐÁNH GIÁ CỦA SẢN PHẨM
    @GetMapping("/products/{productId}")
    public ResponseEntity<ProductReviewListResponseDTO> getReviewsByProduct(
            @PathVariable("productId") Long productId,
            Pageable pageable) {
        return ResponseEntity.ok(reviewService.getReviewsByProduct(productId, pageable));
    }

    // TEST ENDPOINT: Cập nhật đơn hàng đầu tiên của user thành DELIVERED
    @GetMapping("/test/make-delivered")
    public ResponseEntity<?> makeFirstOrderDelivered() {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        java.util.List<com.fashion.model.Order> orders = orderRepository.findByUserIdOrderByOrderDateDesc(userId);
        if (orders.isEmpty()) {
            return ResponseEntity.badRequest().body("Vui lòng đặt một đơn hàng bất kỳ trước (ví dụ PENDING), sau đó gọi lại API này.");
        }
        com.fashion.model.Order order = orders.get(0);
        order.setStatus(com.fashion.model.enums.OrderStatus.DELIVERED);
        orderRepository.save(order);
        
        java.util.List<com.fashion.model.OrderItem> items = orderItemRepository.findByOrderId(order.getId());
        for (com.fashion.model.OrderItem item : items) {
            item.setStatus(com.fashion.model.enums.OrderStatus.DELIVERED);
            orderItemRepository.save(item);
        }
        
        return ResponseEntity.ok(java.util.Map.of(
            "message", "Thành công! Đã chuyển đơn hàng mới nhất thành DELIVERED. Các sản phẩm trong đơn này đã có thể review.",
            "orderId", order.getId(),
            "orderItemIds", items.stream().map(com.fashion.model.OrderItem::getId).toList(),
            "productIds", items.stream().map(item -> item.getProductVariant().getProduct().getId()).toList()
        ));
    }
}
