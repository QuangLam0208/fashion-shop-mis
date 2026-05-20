package com.fashion.service.return_request;

import com.fashion.dto.request.ProcessReturnRequestDTO;
import com.fashion.dto.request.SubmitReturnRequestDTO;
import com.fashion.dto.response.MessageResponseDTO;
import com.fashion.dto.response.ReturnRequestResponseDTO;
import com.fashion.model.Order;
import com.fashion.model.OrderItem;
import com.fashion.model.ReturnRequest;
import com.fashion.model.enums.ReturnStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ReturnRequestService {
    // Lấy danh sách đơn hàng đang có yêu cầu hoàn trả của khách hàng
    List<ReturnRequestResponseDTO> getReturnRequestsByCustomer(Long customerId);
    Order getOrderForReturn(Long orderId);
    List<OrderItem> validateReturnEligibility(Long orderId, List<Long> itemIds);
    ReturnRequest submitReturnRequest(SubmitReturnRequestDTO dto);

    // Admin
    Page<ReturnRequestResponseDTO> getAllReturnRequests(ReturnStatus status, Pageable pageable);
    ReturnRequestResponseDTO getReturnRequestDetail(Long requestId);
    MessageResponseDTO processReturnRequest(Long requestId, ProcessReturnRequestDTO dto);
}
