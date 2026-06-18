package com.fashion.service.offline_sale;

import com.fashion.dto.request.OfflineSaleItemDTO;
import com.fashion.dto.request.RecordOfflineSaleRequestDTO;
import com.fashion.dto.response.PlaceOrderResponseDTO;
import com.fashion.exception.BadRequestException;
import com.fashion.exception.ResourceNotFoundException;
import com.fashion.model.*;
import com.fashion.model.enums.OrderStatus;
import com.fashion.model.enums.OrderType;
import com.fashion.model.enums.PaymentMethod;
import com.fashion.repository.OrderItemRepository;
import com.fashion.repository.OrderRepository;
import com.fashion.repository.ProductVariantRepository;
import com.fashion.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OfflineSaleServiceImplTest {

    @Mock
    private ProductVariantRepository productVariantRepository;

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private OrderItemRepository orderItemRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private OfflineSaleServiceImpl offlineSaleService;

    private RecordOfflineSaleRequestDTO requestDTO;
    private ProductVariant variant;
    private Product product;
    private User user;

    @BeforeEach
    void setUp() {
        product = Product.builder().name("Áo thun").build();
        variant = ProductVariant.builder()
                .id(1L)
                .product(product)
                .stockQuantity(10L)
                .price(100000.0)
                .build();
        user = User.builder().id(1L).phone("0123456789").build();

        requestDTO = RecordOfflineSaleRequestDTO.builder()
                .paymentMethod(PaymentMethod.COD)
                .customerPhone("0123456789")
                .items(List.of(
                        OfflineSaleItemDTO.builder().productVariantId(1L).quantity(2).build()
                ))
                .build();
    }

    @Test
    void recordOfflineSale_Success_WithPhone() {
        // Arrange
        when(productVariantRepository.findById(1L)).thenReturn(Optional.of(variant));
        when(userRepository.findByPhone("0123456789")).thenReturn(Optional.of(user));
        
        Order savedOrder = Order.builder().id(100L).totalAmount(200000.0).type(OrderType.OFFLINE).status(OrderStatus.COMPLETED).build();
        when(orderRepository.save(any(Order.class))).thenReturn(savedOrder);

        // Act
        PlaceOrderResponseDTO response = offlineSaleService.recordOfflineSale(requestDTO);

        // Assert
        assertNotNull(response);
        assertEquals(100L, response.getOrderId());
        assertEquals(200000.0, response.getTotalAmount());
        assertEquals(OrderStatus.COMPLETED, response.getStatus());

        verify(orderRepository).save(argThat(order -> 
            order.getType() == OrderType.OFFLINE &&
            order.getStatus() == OrderStatus.COMPLETED &&
            order.getUser() != null &&
            order.getUser().getId().equals(1L)
        ));
        
        verify(orderItemRepository, times(1)).save(any(OrderItem.class));
        verify(productVariantRepository, times(1)).save(argThat(v -> v.getStockQuantity() == 8L));
    }

    @Test
    void recordOfflineSale_StockOut_ThrowsBadRequest() {
        // Arrange
        requestDTO.getItems().get(0).setQuantity(15); // > 10
        when(productVariantRepository.findById(1L)).thenReturn(Optional.of(variant));

        // Act & Assert
        BadRequestException exception = assertThrows(BadRequestException.class, () -> {
            offlineSaleService.recordOfflineSale(requestDTO);
        });

        assertTrue(exception.getMessage().contains("không đủ số lượng trong kho"));
        verify(orderRepository, never()).save(any());
    }

    @Test
    void recordOfflineSale_ProductNotFound_ThrowsResourceNotFound() {
        // Arrange
        when(productVariantRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> {
            offlineSaleService.recordOfflineSale(requestDTO);
        });
    }

    @Test
    void recordOfflineSale_MissingItems_ThrowsBadRequest() {
        // Arrange
        requestDTO.setItems(null);

        // Act & Assert
        assertThrows(BadRequestException.class, () -> {
            offlineSaleService.recordOfflineSale(requestDTO);
        });
    }
}
