package com.fashion.service.return_request;

import com.fashion.dto.request.ProcessReturnRequestDTO;
import com.fashion.dto.request.SubmitReturnRequestDTO;
import com.fashion.dto.response.MessageResponseDTO;
import com.fashion.dto.response.ReturnItemDTO;
import com.fashion.dto.response.ReturnRequestResponseDTO;
import com.fashion.exception.BadRequestException;
import com.fashion.model.*;
import com.fashion.model.enums.OrderStatus;
import com.fashion.model.enums.RefundStatus;
import com.fashion.model.enums.ReturnStatus;
import com.fashion.repository.OrderRepository;
import com.fashion.repository.ReturnRequestRepository;
import com.fashion.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
public class ReturnRequestServiceImpl implements ReturnRequestService {

    private final OrderRepository orderRepository;
    private final ReturnRequestRepository returnRepository;

    @Override
    public List<ReturnRequestResponseDTO> getReturnRequestsByCustomer(Long customerId) {
        return returnRepository.findByUserIdOrderByRequestDateDesc(customerId)
                .stream().map(this::mapToDTO).toList();
    }

    @Override
    public Order getOrderForReturn(Long orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new BadRequestException("Đơn hàng không tồn tại!"));
    }

    @Override
    public List<OrderItem> validateReturnEligibility(Long orderId, List<Long> itemIds) {
        Order order = getOrderForReturn(orderId);

        Long authenticatedUserId = SecurityUtils.getAuthenticatedUserId();
        if (!order.getUser().getId().equals(authenticatedUserId)) {
            throw new BadRequestException("Bạn không có quyền yêu cầu hoàn trả cho đơn hàng này!");
        }

        List<OrderItem> selectedItems = order.getOrderItems().stream()
                .filter(item -> itemIds.contains(item.getId()))
                .toList();

        if (selectedItems.isEmpty()) {
            throw new BadRequestException("Không tìm thấy sản phẩm hợp lệ để hoàn trả!");
        }

        Set<Long> uniqueItemIds = new HashSet<>(itemIds);
        if (selectedItems.size() != uniqueItemIds.size()) {
            throw new BadRequestException(
                    "Một hoặc nhiều sản phẩm không thuộc đơn hàng này!");
        }

        for (OrderItem item : selectedItems) {
            if (item.getStatus() != OrderStatus.DELIVERED && item.getStatus() != OrderStatus.COMPLETED) {
                throw new BadRequestException("Sản phẩm '" + item.getProductName()
                        + "' chưa được giao thành công, không thể hoàn trả!");
            }
        }

        List<ReturnStatus> activeStatuses = List.of(ReturnStatus.PENDING, ReturnStatus.APPROVED);
        boolean hasActiveReturn = returnRepository.existsByItemIdsAndStatuses(itemIds, activeStatuses);

        if (hasActiveReturn) {
            throw new BadRequestException("Một hoặc nhiều sản phẩm đã có yêu cầu hoàn trả đang được xử lý!");
        }

        return selectedItems;
    }

    @Override
    @Transactional
    public ReturnRequest submitReturnRequest(SubmitReturnRequestDTO dto) {
        List<OrderItem> returnItems = validateReturnEligibility(dto.getOrderId(), dto.getItemIds());
        Order order = returnItems.get(0).getOrder();

        ReturnRequest returnRequest = new ReturnRequest();
        returnRequest.setOrder(order);
        returnRequest.setUser(order.getUser());
        returnRequest.setReturnItems(new ArrayList<>(returnItems));
        returnRequest.setStatus(ReturnStatus.PENDING);
        returnRequest.setReason(dto.getReason());
        returnRequest.setDescription(dto.getDescription());
        returnRequest.setRequestDate(new Date());
        returnRequest.setImageUrls(dto.getImageUrls());

        // Mark items as PENDING refund and link to request
        for (OrderItem item : returnItems) {
            item.setRefundStatus(RefundStatus.PENDING);
            item.setReturnRequest(returnRequest);
        }

        return returnRepository.save(returnRequest);
    }

    @Override
    public Page<ReturnRequestResponseDTO> getAllReturnRequests(ReturnStatus status, Pageable pageable) {
        if (status != null) {
            return returnRepository.findByStatusOrderByRequestDateAsc(status, pageable).map(this::mapToDTO);
        }
        return returnRepository.findAll(pageable).map(this::mapToDTO);
    }

    @Override
    public ReturnRequestResponseDTO getReturnRequestDetail(Long requestId) {
        ReturnRequest rr = returnRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Yêu cầu hoàn trả không tồn tại!"));
        return mapToDTO(rr);
    }

    @Override
    @Transactional
    public MessageResponseDTO processReturnRequest(Long requestId, ProcessReturnRequestDTO dto) {
        ReturnRequest rr = returnRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Yêu cầu hoàn trả không tồn tại!"));

        ReturnStatus currentStatus = rr.getStatus();
        ReturnStatus nextStatus = dto.getNewStatus();

        // Validation for workflow transitions
        if (currentStatus == ReturnStatus.PENDING) {
            if (nextStatus != ReturnStatus.APPROVED
                    && nextStatus != ReturnStatus.REJECTED) {
                throw new RuntimeException(
                        "Chỉ có thể duyệt hoặc từ chối yêu cầu đang chờ!");
            }
        } else {
            throw new RuntimeException(
                    "Yêu cầu đã được xử lý, không thể thao tác thêm!");
        }

        rr.setStatus(nextStatus);
        rr.setProcessedAt(new Date());

        if (nextStatus == ReturnStatus.REJECTED) {
            rr.setRejectionReason(dto.getRejectionReason());
            for (OrderItem item : rr.getReturnItems()) {
                item.setRefundStatus(RefundStatus.NONE);
            }
        } else if (nextStatus == ReturnStatus.APPROVED) {
            for (OrderItem item : rr.getReturnItems()) {
                item.setRefundStatus(RefundStatus.PENDING);
            }
        }

        returnRepository.save(rr);

        return MessageResponseDTO.builder()
                .message("Xử lý yêu cầu hoàn trả thành công!")
                .build();
    }

    private ReturnRequestResponseDTO mapToDTO(ReturnRequest rr) {
        return ReturnRequestResponseDTO.builder()
                .requestId(rr.getId())
                .orderId(rr.getOrder().getId())
                .customerName(rr.getUser().getFullName())
                .customerEmail(rr.getUser().getEmail())
                .status(rr.getStatus())
                .reason(rr.getReason())
                .description(rr.getDescription())
                .imageUrls(rr.getImageUrls())
                .requestDate(rr.getRequestDate())
                .rejectionReason(rr.getRejectionReason())
                .paymentMethod(rr.getOrder().getPaymentMethod().name())
                .items(rr.getReturnItems().stream()
                        .map(item -> ReturnItemDTO.builder()
                                .productName(item.getProductName())
                                .productImage(getProductImageUrl(item.getProductVariant()))
                                .size(item.getProductVariant() != null ? item.getProductVariant().getSize() : null)
                                .color(item.getProductVariant() != null ? item.getProductVariant().getColor() : null)
                                .quantity(item.getQuantity())
                                .price(item.getPrice())
                                .build())
                        .toList())
                .build();
    }

    private String getProductImageUrl(ProductVariant variant) {
        if (variant == null || variant.getProduct() == null || variant.getProduct().getImages() == null || variant.getProduct().getImages().isEmpty()) {
            return null;
        }

        String targetUrl = variant.getProduct().getImages().stream()
                .filter(img -> img.getColor() != null && img.getColor().equalsIgnoreCase(variant.getColor()))
                .map(ProductImage::getUrl)
                .findFirst()
                .orElse(variant.getProduct().getImages().get(0).getUrl());

        if (targetUrl == null) return null;

        if (!targetUrl.startsWith("/") && !targetUrl.startsWith("http")) {
            targetUrl = "/" + targetUrl;
        }

        return targetUrl;
    }
}
