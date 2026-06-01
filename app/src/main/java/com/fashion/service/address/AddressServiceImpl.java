package com.fashion.service.address;

import com.fashion.dto.request.AddressRequestDTO;
import com.fashion.dto.response.AddressResponseDTO;
import com.fashion.dto.response.MessageResponseDTO;
import com.fashion.exception.BadRequestException;
import com.fashion.exception.ResourceNotFoundException;
import com.fashion.model.Address;
import com.fashion.model.User;
import com.fashion.repository.AddressRepository;
import com.fashion.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AddressServiceImpl implements AddressService{
    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    private AddressResponseDTO mapToDTO(Address address) {
        return AddressResponseDTO.builder()
                .id(address.getId())
                .receiverName(address.getReceiverName())
                .receiverPhone(address.getReceiverPhone())
                .fullAddress(address.getFullAddress())
                .isDefault(address.isDefault())
                .build();
    }

    @Override
    public List<AddressResponseDTO> getUserAddresses(Long userId) {
        return addressRepository.findByUserId(userId).stream()
                .map(this::mapToDTO)
                .toList();
    }

    @Override
    @Transactional
    public AddressResponseDTO createUserAddress(Long userId, AddressRequestDTO dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng!"));
        List<Address> existingAddress = addressRepository.findByUserId(userId);
        boolean isDefault = existingAddress.isEmpty() || dto.isDefault();
        if (isDefault && !existingAddress.isEmpty()) {
            existingAddress.forEach(a -> a.setDefault(false));
            addressRepository.saveAll(existingAddress);
        }
        Address address = Address.builder()
                .user(user)
                .fullAddress(dto.getFullAddress())
                .receiverName(dto.getReceiverName())
                .receiverPhone(dto.getReceiverPhone())
                .build();
        return mapToDTO(addressRepository.save(address));
    }

    @Override
    public AddressResponseDTO updateUserAddress(Long userId, Long addressId, AddressRequestDTO dto) {
        Address address = addressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Địa chỉ không tồn tại hoặc không thuộc quyền sở hữu!"));
        address.setFullAddress(dto.getFullAddress());
        address.setReceiverName(dto.getReceiverName());
        address.setReceiverPhone(dto.getReceiverPhone());
        if (dto.isDefault() && !address.isDefault()) {
            List<Address> existingAddresses = addressRepository.findByUserId(userId);
            existingAddresses.forEach(a -> {
                if (!a.getId().equals(addressId)) {
                    a.setDefault(false);
                }
            });
            addressRepository.saveAll(existingAddresses);
            address.setDefault(true);
        }
        return mapToDTO(addressRepository.save(address));
    }

    @Override
    @Transactional
    public MessageResponseDTO deleteAddress(Long userId, Long addressId) {
        Address address = addressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Địa chỉ không tồn tại hoặc không thuộc quyền sở hữu!"));

        if (address.isDefault()) {
            throw new BadRequestException("Không thể xóa địa chỉ mặc định. Vui lòng đặt địa chỉ khác làm mặc định trước!");
        }

        addressRepository.delete(address);
        return MessageResponseDTO.builder().message("Xóa địa chỉ thành công!").build();
    }

    @Override
    @Transactional
    public AddressResponseDTO setDefaultAddress(Long userId, Long addressId) {
        Address address = addressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Địa chỉ không tồn tại hoặc không thuộc quyền sở hữu!"));

        if (address.isDefault()) {
            return mapToDTO(address);
        }

        List<Address> existingAddresses = addressRepository.findByUserId(userId);
        existingAddresses.forEach(a -> {
            a.setDefault(a.getId().equals(addressId));
        });

        addressRepository.saveAll(existingAddresses);

        return mapToDTO(address);
    }
}
