package com.fashion.service.user.address;

import com.fashion.dto.request.AddressRequestDTO;
import com.fashion.dto.response.AddressResponseDTO;
import com.fashion.model.Address;
import com.fashion.model.User;
import com.fashion.repository.AddressRepository;
import com.fashion.repository.UserRepository;
import com.fashion.service.address.AddressServiceImpl;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserAddressServiceTest {

    @Mock private AddressRepository addressRepository;
    @Mock private UserRepository userRepository;

    @InjectMocks private AddressServiceImpl addressService;

    // TEST CASE: Tạo địa chỉ đầu tiên -> Bắt buộc là mặc định dù truyền false
    @Test
    void createUserAddress_FirstAddress_ForcesToBeDefault() {
        User user = User.builder().id(1L).build();
        AddressRequestDTO dto = new AddressRequestDTO("Minh", "0123", "HCM", false); // Không yêu cầu mặc định

        when(userRepository.findById(anyLong())).thenReturn(Optional.of(user));
        when(addressRepository.findByUserId(anyLong())).thenReturn(new ArrayList<>());
        when(addressRepository.save(any(Address.class))).thenAnswer(i -> i.getArgument(0));
        AddressResponseDTO response = addressService.createUserAddress(1L, dto);

        assertTrue(response.isDefault(), "Địa chỉ đầu tiên phải là mặc định!");
    }

    // TEST CASE: Sửa một địa chỉ thành mặc định -> Tự động gỡ mặc định các địa chỉ cũ
    @Test
    void updateUserAddress_SetDefault_RemovesOldDefault() {
        Address oldDefault = Address.builder().id(10L).isDefault(true).build();
        Address targetAddress = Address.builder().id(11L).isDefault(false).build();

        AddressRequestDTO dto = new AddressRequestDTO("Minh", "0123", "Hà Nội", true); // Yêu cầu gán mặc định

        when(addressRepository.findByIdAndUserId(anyLong(), anyLong())).thenReturn(Optional.of(targetAddress));
        when(addressRepository.findByUserId(anyLong())).thenReturn(List.of(oldDefault, targetAddress));
        when(addressRepository.save(any(Address.class))).thenAnswer(i -> i.getArgument(0));

        // Gọi hàm từ AddressServiceImpl
        AddressResponseDTO response = addressService.updateUserAddress(1L, 11L, dto);

        assertFalse(oldDefault.isDefault(), "Địa chỉ cũ phải bị gỡ mặc định!");
        assertTrue(response.isDefault(), "Địa chỉ mới phải được gán mặc định!");
        verify(addressRepository, times(1)).saveAll(any());
    }
}