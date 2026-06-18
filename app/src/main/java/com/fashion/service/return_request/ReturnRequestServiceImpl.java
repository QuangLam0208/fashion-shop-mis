package com.fashion.service.return_request;

import com.fashion.dto.request.ProcessReturnRequestDTO;
import com.fashion.dto.request.SubmitReturnRequestDTO;
import com.fashion.dto.response.MessageResponseDTO;
import com.fashion.dto.response.ReturnItemDTO;
import com.fashion.dto.response.ReturnRequestDetailResponseDTO;
import com.fashion.dto.response.ReturnRequestListItemResponseDTO;
import com.fashion.exception.BadRequestException;
import com.fashion.exception.ForbiddenException;
import com.fashion.exception.ResourceNotFoundException;
import com.fashion.model.*;
import com.fashion.model.enums.OrderStatus;
import com.fashion.model.enums.RefundStatus;
import com.fashion.model.enums.ReturnStatus;
import com.fashion.repository.OrderRepository;
import com.fashion.repository.ReturnRequestRepository;
import com.fashion.service.email_log.EmailService;
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
    private final EmailService emailService;

    @Override
    public List<ReturnRequestListItemResponseDTO> getReturnRequestsByCustomer(Long customerId) {
        return returnRepository.findByUserIdOrderByRequestDateDesc(customerId)
                .stream().map(this::mapToListItemDTO).toList();
    }

    @Override
    public ReturnRequestDetailResponseDTO getCustomerReturnRequestDetail(Long requestId) {
        ReturnRequest rr = returnRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Yêu cầu hoàn trả không tồn tại!"));

        Long currentUserId = SecurityUtils.getAuthenticatedUserId();
        if (!rr.getUser().getId().equals(currentUserId)) {
            throw new ForbiddenException("Bạn không có quyền truy cập yêu cầu hoàn trả này!");
        }

        return mapToDTO(rr);
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
    public Page<ReturnRequestListItemResponseDTO> getAllReturnRequests(ReturnStatus status, Pageable pageable) {
        if (status != null) {
            return returnRepository.findByStatusOrderByRequestDateAsc(status, pageable).map(this::mapToListItemDTO);
        }
        return returnRepository.findAll(pageable).map(this::mapToListItemDTO);
    }

    @Override
    public ReturnRequestDetailResponseDTO getReturnRequestDetail(Long requestId) {
        ReturnRequest rr = returnRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Yêu cầu hoàn trả không tồn tại!"));
        return mapToDTO(rr);
    }

    @Override
    @Transactional
    public MessageResponseDTO processReturnRequest(Long requestId, ProcessReturnRequestDTO dto) {
        ReturnRequest rr = returnRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Yêu cầu hoàn trả không tồn tại!"));

        ReturnStatus currentStatus = rr.getStatus();
        ReturnStatus nextStatus = dto.getNewStatus();

        // 1. Validation for workflow transitions
        if (currentStatus != ReturnStatus.PENDING) {
            throw new BadRequestException("Yêu cầu đã được xử lý, không thể thao tác thêm!");
        }

        if (nextStatus != ReturnStatus.APPROVED && nextStatus != ReturnStatus.REJECTED) {
            throw new BadRequestException("Chỉ có thể duyệt hoặc từ chối yêu cầu đang chờ!");
        }

        // 2. Logic on Rejection- Bắt buộc nhập lý do
        if (nextStatus == ReturnStatus.REJECTED) {
            if (dto.getRejectionReason() == null || dto.getRejectionReason().trim().isEmpty()) {
                throw new BadRequestException("A rejection reason is required when rejecting a return request.");
            }
            rr.setRejectionReason(dto.getRejectionReason());
            for (OrderItem item : rr.getReturnItems()) {
                item.setRefundStatus(RefundStatus.NONE);
            }
        }
        // 3. Approval
        else {
            for (OrderItem item : rr.getReturnItems()) {
                item.setRefundStatus(RefundStatus.PENDING);
            }
        }
        rr.setStatus(nextStatus);
        rr.setProcessedAt(new Date());

        returnRepository.save(rr);

        String userEmail = rr.getUser().getEmail();
        String customerName = rr.getUser().getFullName();
        Long orderId = rr.getOrder().getId();

        if (nextStatus == ReturnStatus.REJECTED) {
            emailService.sendReturnRejectedEmail(userEmail, customerName, orderId, dto.getRejectionReason());
        } else {
            emailService.sendReturnApprovedEmail(userEmail, customerName, orderId);
        }

        return MessageResponseDTO.builder()
                .message("Xử lý yêu cầu hoàn trả thành công!")
                .build();
    }

    // Mapper riêng cho Danh Sách
    private ReturnRequestListItemResponseDTO mapToListItemDTO(ReturnRequest rr) {
        return ReturnRequestListItemResponseDTO.builder()
                .requestId(rr.getId())
                .orderId(rr.getOrder() != null ? rr.getOrder().getId() : null)
                .customerName(rr.getUser() != null ? rr.getUser().getFullName() : null)
                .customerPhone(rr.getUser() != null ? rr.getUser().getPhone() : null)
                .reason(rr.getReason())
                .requestDate(rr.getRequestDate() != null ? rr.getRequestDate().toInstant() : null)
                .status(rr.getStatus())
                .totalItems(rr.getReturnItems() != null ? rr.getReturnItems().size() : 0)
                .build();
    }

    // Mapper cho Chi Tiết
    private ReturnRequestDetailResponseDTO mapToDTO(ReturnRequest rr) {
        return ReturnRequestDetailResponseDTO.builder()
                .requestId(rr.getId())
                .status(rr.getStatus())
                .reason(rr.getReason())
                .description(rr.getDescription())
                .imageUrls(rr.getImageUrls())
                .requestDate(rr.getRequestDate() != null ? rr.getRequestDate().toInstant() : null)
                .processedAt(rr.getProcessedAt() != null ? rr.getProcessedAt().toInstant() : null)
                .rejectionReason(rr.getRejectionReason())
                .customerId(rr.getUser() != null ? rr.getUser().getId() : null)
                .customerName(rr.getUser() != null ? rr.getUser().getFullName() : null)
                .customerEmail(rr.getUser() != null ? rr.getUser().getEmail() : null)
                .customerPhone(rr.getUser() != null ? rr.getUser().getPhone() : null)
                .orderId(rr.getOrder() != null ? rr.getOrder().getId() : null)
                .paymentMethod(rr.getOrder() != null ? rr.getOrder().getPaymentMethod() : null)
                .items(rr.getReturnItems().stream()
                        .map(item -> ReturnItemDTO.builder()
                                .orderItemId(item.getId())
                                .productName(item.getProductName())
                                .productImage(getProductImageUrl(item.getProductVariant()))
                                .size(item.getProductVariant() != null ? item.getProductVariant().getSize() : null)
                                .color(item.getProductVariant() != null ? item.getProductVariant().getColor() : null)
                                .quantity(item.getQuantity())
                                .price(item.getPrice())
                                .refundStatus(item.getRefundStatus())
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