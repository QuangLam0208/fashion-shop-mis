package com.fashion.dto.request;

import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RemoveWishlistRequestDTO {
    @NotEmpty(message = "Danh sach san pham khong duoc de trong")
    private List<Long> wishlists;
}
