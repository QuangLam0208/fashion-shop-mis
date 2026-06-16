package com.fashion.service.address;


import com.fashion.dto.request.AddressRequestDTO;
import com.fashion.dto.response.AddressResponseDTO;
import com.fashion.dto.response.MessageResponseDTO;

import java.util.List;

public interface AddressService {
    List<AddressResponseDTO> getUserAddresses(Long userId);
    AddressResponseDTO getUserAddress(Long userId, Long addressId);
    AddressResponseDTO createUserAddress(Long userId, AddressRequestDTO dto);
    AddressResponseDTO updateUserAddress(Long userId, Long addressId, AddressRequestDTO dto);
    MessageResponseDTO deleteAddress(Long userId, Long addressId);
    AddressResponseDTO setDefaultAddress(Long userId, Long addressId);
}
