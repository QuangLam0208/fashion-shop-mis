package com.fashion.repository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public class ProductCleanupRepository {

    @PersistenceContext
    private EntityManager entityManager;

    /**
     * Thực hiện xóa sạch mọi dấu vết của một sản phẩm bằng SQL thuần.
     * Đây là cách duy nhất để vượt qua các ràng buộc khóa ngoại phức tạp.
     */
    @Transactional
    public void nuclearDelete(Long productId) {
        // Thứ tự xóa là CỰC KỲ QUAN TRỌNG
        
        // 1. Xóa trong các bảng phụ (Ràng buộc lỏng)
        entityManager.createNativeQuery("DELETE FROM wishlist_items WHERE product_id = ?").setParameter(1, productId).executeUpdate();
        entityManager.createNativeQuery("DELETE FROM reviews WHERE product_id = ?").setParameter(1, productId).executeUpdate();
        entityManager.createNativeQuery("DELETE FROM product_images WHERE product_id = ?").setParameter(1, productId).executeUpdate();
        
        // 2. Xóa cart_items liên quan đến các biến thể của sản phẩm này
        entityManager.createNativeQuery(
            "DELETE FROM cart_items WHERE variant_id IN (SELECT variant_id FROM product_variants WHERE product_id = ?)"
        ).setParameter(1, productId).executeUpdate();
        
        // 3. Xóa các biến thể
        entityManager.createNativeQuery("DELETE FROM product_variants WHERE product_id = ?").setParameter(1, productId).executeUpdate();
        
        // 4. Cuối cùng mới xóa sản phẩm chính
        entityManager.createNativeQuery("DELETE FROM products WHERE product_id = ?").setParameter(1, productId).executeUpdate();
    }
}
