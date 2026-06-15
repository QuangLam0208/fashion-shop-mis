package com.fashion.service.user;

import com.fashion.dto.request.UpdateCustomerStatusRequestDTO;
import com.fashion.dto.response.*;
import com.fashion.exception.BadRequestException;
import com.fashion.model.*;
import com.fashion.model.enums.OrderStatus;
import com.fashion.model.enums.Role;
import com.fashion.model.enums.UserStatus;
import com.fashion.repository.TokenRepository;
import com.fashion.repository.UserRepository;
import com.fashion.service.order.OrderService;
import com.fashion.util.SecurityUtils;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private OrderService orderService;

    @Mock
    private TokenRepository tokenRepository;

    @InjectMocks
    private UserServiceImpl userService;

    // =========================================================================
    // TEST: getAllCustomers (Directory Fetching)
    // =========================================================================
    @Test
    void getAllCustomers_ShouldReturnPage_WithoutKeyword() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        User user = new User();
        user.setId(1L);
        user.setRole(Role.CUSTOMER);
        Page<User> mockPage = new PageImpl<>(List.of(user));

        when(userRepository.findByRole(Role.CUSTOMER, pageable)).thenReturn(mockPage);

        // Act
        Page<CustomerSummaryResponseDTO> result = userService.getAllCustomers(null, pageable);

        // Assert
        assertEquals(1, result.getTotalElements());
        assertEquals(1L, result.getContent().get(0).getUserId());
        verify(userRepository, times(1)).findByRole(Role.CUSTOMER, pageable);
    }

    @Test
    void getAllCustomers_ShouldReturnPage_WithKeywordAndLowerCaseIt() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        String keyword = "JoHn";
        User user = new User();
        user.setId(1L);
        user.setRole(Role.CUSTOMER);
        Page<User> mockPage = new PageImpl<>(List.of(user));

        // Phải đảm bảo Service đã gọi toLowerCase()
        when(userRepository.searchCustomers(Role.CUSTOMER, "john", pageable)).thenReturn(mockPage);

        // Act
        Page<CustomerSummaryResponseDTO> result = userService.getAllCustomers(keyword, pageable);

        // Assert
        assertEquals(1, result.getTotalElements());
        verify(userRepository, times(1)).searchCustomers(Role.CUSTOMER, "john", pageable);
    }

    // =========================================================================
    // TEST: getCustomerDetail (Deep mapping User -> Order -> OrderItem)
    // =========================================================================
    @Test
    void getCustomerDetail_ShouldMapMultiLevelEntitiesCorrectly() {
        // Arrange
        Long customerId = 100L;
        User customer = new User();
        customer.setId(customerId);
        customer.setRole(Role.CUSTOMER);
        customer.setFullName("Nguyen Van A");

        // Mock Address
        Address defaultAddress = new Address();
        defaultAddress.setFullAddress("123 Duong ABC");
        defaultAddress.setDefault(true);
        customer.setAddresses(List.of(defaultAddress));

        // Mock Product -> ProductImage -> ProductVariant
        Product product = new Product();
        product.setName("Áo thun Polo");

        ProductImage image = new ProductImage();
        image.setUrl("http://domain.com/image.jpg");
        product.setImages(List.of(image));

        ProductVariant variant = new ProductVariant();
        variant.setProduct(product);
        variant.setColor("Đen");
        variant.setSize("XL");

        // Mock OrderItem -> Order
        OrderItem item = new OrderItem();
        item.setProductVariant(variant);
        item.setQuantity(2L);
        item.setStatus(OrderStatus.DELIVERED);

        Order order = new Order();
        order.setId(500L);
        order.setOrderItems(List.of(item));
        customer.setOrders(List.of(order));

        when(userRepository.findById(customerId)).thenReturn(Optional.of(customer));

        // Act
        CustomerDetailResponseDTO response = userService.getCustomerDetail(customerId);

        // Assert
        assertNotNull(response);
        assertEquals("123 Duong ABC", response.getAddress()); // Kiểm tra lấy đúng địa chỉ mặc định
        assertEquals(1, response.getOrderHistory().size());

        OrderSummaryResponseDTO orderSummary = response.getOrderHistory().get(0);
        assertEquals(500L, orderSummary.getOrderId());
        assertEquals(1, orderSummary.getItems().size());

        OrderItemPreviewDTO itemPreview = orderSummary.getItems().get(0);
        // Xác minh thuật toán nối chuỗi tên sản phẩm và lấy ảnh URL
        assertEquals("Áo thun Polo - Đen - XL", itemPreview.getProductName());
        assertEquals("http://domain.com/image.jpg", itemPreview.getProductImage());
        assertEquals(2, itemPreview.getQuantity());
        assertEquals(OrderStatus.DELIVERED, itemPreview.getOrderItemStatus());
    }

    @Test
    void getCustomerDetail_ShouldThrowException_WhenTargetIsNotCustomer() {
        // Arrange
        Long adminId = 1L;
        User admin = new User();
        admin.setId(adminId);
        admin.setRole(Role.ADMIN);

        when(userRepository.findById(adminId)).thenReturn(Optional.of(admin));

        // Act & Assert
        BadRequestException exception = assertThrows(BadRequestException.class,
                () -> userService.getCustomerDetail(adminId));
        assertEquals("Tài khoản không phải là khách hàng!", exception.getMessage());
    }

    // =========================================================================
    // TEST: getCustomerOrderDetail
    // =========================================================================
    @Test
    void getCustomerOrderDetail_ShouldReturnOrderDetailResponse() {
        // Arrange
        Long customerId = 1L;
        Long orderId = 10L;
        OrderDetailResponseDTO mockOrderResponse = new OrderDetailResponseDTO();

        when(orderService.getMyOrderDetail(customerId, orderId)).thenReturn(mockOrderResponse);

        // Act
        OrderDetailResponseDTO result = userService.getCustomerOrderDetail(customerId, orderId);

        // Assert
        assertNotNull(result);
        verify(orderService, times(1)).getMyOrderDetail(customerId, orderId);
    }

    // =========================================================================
    // TEST: updateCustomerStatus (Self-Defense & Token Revocation)
    // =========================================================================
    @Test
    void updateCustomerStatus_ShouldThrowException_WhenAdminLocksHimself() {
        // Dùng try-with-resources để mock static method an toàn (không ảnh hưởng test khác)
        try (MockedStatic<SecurityUtils> mockedSecurityUtils = mockStatic(SecurityUtils.class)) {
            // Arrange
            Long currentAdminId = 99L;
            mockedSecurityUtils.when(SecurityUtils::getAuthenticatedUserId).thenReturn(currentAdminId);

            UpdateCustomerStatusRequestDTO dto = new UpdateCustomerStatusRequestDTO(UserStatus.BLOCKED);

            // Act & Assert
            BadRequestException exception = assertThrows(BadRequestException.class,
                    () -> userService.updateCustomerStatus(currentAdminId, dto)); // Target ID trùng Admin ID

            assertEquals("Nghiêm cấm hành vi tự khóa tài khoản chính mình!", exception.getMessage());
        }
    }

    @Test
    void updateCustomerStatus_ShouldThrowException_WhenTargetIsAdmin() {
        try (MockedStatic<SecurityUtils> mockedSecurityUtils = mockStatic(SecurityUtils.class)) {
            // Arrange
            Long currentAdminId = 99L;
            Long targetAdminId = 100L;
            mockedSecurityUtils.when(SecurityUtils::getAuthenticatedUserId).thenReturn(currentAdminId);

            User targetAdmin = new User();
            targetAdmin.setId(targetAdminId);
            targetAdmin.setRole(Role.ADMIN);

            when(userRepository.findById(targetAdminId)).thenReturn(Optional.of(targetAdmin));
            UpdateCustomerStatusRequestDTO dto = new UpdateCustomerStatusRequestDTO(UserStatus.BLOCKED);

            // Act & Assert
            BadRequestException exception = assertThrows(BadRequestException.class,
                    () -> userService.updateCustomerStatus(targetAdminId, dto));

            assertEquals("Chỉ có thể cập nhật trạng thái của khách hàng!", exception.getMessage());
        }
    }

    @Test
    void updateCustomerStatus_ShouldBlockUserAndRevokeTokens() {
        try (MockedStatic<SecurityUtils> mockedSecurityUtils = mockStatic(SecurityUtils.class)) {
            // Arrange
            Long currentAdminId = 99L;
            Long customerId = 5L;
            mockedSecurityUtils.when(SecurityUtils::getAuthenticatedUserId).thenReturn(currentAdminId);

            User customer = new User();
            customer.setId(customerId);
            customer.setRole(Role.CUSTOMER);
            customer.setStatus(UserStatus.ACTIVE);

            when(userRepository.findById(customerId)).thenReturn(Optional.of(customer));

            // Mock danh sách Token đang hợp lệ
            Token validToken1 = new Token();
            Token validToken2 = new Token();
            when(tokenRepository.findAllValidTokensByUser(customerId))
                    .thenReturn(List.of(validToken1, validToken2));

            UpdateCustomerStatusRequestDTO dto = new UpdateCustomerStatusRequestDTO(UserStatus.BLOCKED);

            // Act
            MessageResponseDTO response = userService.updateCustomerStatus(customerId, dto);

            // Assert
            assertEquals("Cập nhật trạng thái khách hàng thành công!", response.getMessage());
            assertEquals(UserStatus.BLOCKED, customer.getStatus());

            // Xác nhận token đã bị thu hồi
            assertTrue(validToken1.isExpired());
            assertTrue(validToken1.isRevoked());
            assertTrue(validToken2.isExpired());
            assertTrue(validToken2.isRevoked());

            verify(userRepository, times(1)).save(customer);
            verify(tokenRepository, times(1)).saveAll(any());
        }
    }
}