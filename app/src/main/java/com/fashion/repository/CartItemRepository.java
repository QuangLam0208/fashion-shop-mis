package com.fashion.repository;
import com.fashion.model.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    // Tải toàn bộ giỏ hàng của khách
    List<CartItem> findByUser_Id(Long userId);

    // Kiểm tra loại hàng này đã có trong giỏ chưa (để cộng dồn số lượng)
    Optional<CartItem> findByUser_IdAndProductVariant_Id(Long userId, Long variantId);

    // Cho tính năng Mua 1 vài món trong giỏ
    void deleteByUser_IdAndProductVariant_IdIn(Long userId, List<Long> variantIds);
}