package com.fashion.repository;

import com.fashion.model.Product;
import com.fashion.model.enums.ProductStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    // Lấy các sản phẩm có trạng thái còn bán
    List<Product> findByStatus(ProductStatus status);

    // Tìm sản phẩm theo từ khóa (Keyword)
    @Query("SELECT DISTINCT p FROM Product p " +
           "LEFT JOIN FETCH p.images i " +
           "LEFT JOIN p.category c " +
           "WHERE (:keyword IS NULL OR :keyword = '' OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(c.name) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "AND p.status = 'ACTIVE'")
    Page<Product> findFiltered(@Param("keyword") String keyword, Pageable pageable);

    // Tìm sản phẩm theo danh sách category IDs (bao gồm danh mục cha + con)
    @Query("SELECT DISTINCT p FROM Product p LEFT JOIN FETCH p.images i WHERE p.category.id IN :categoryIds AND p.status = 'ACTIVE'")
    Page<Product> findByCategoryIds(@Param("categoryIds") List<Long> categoryIds, Pageable pageable);

    // Tìm theo keyword + lọc trạng thái + phân trang
    Page<Product> findByNameContainingIgnoreCaseAndStatus(String keyword, ProductStatus status, Pageable pageable);

    // Admin tìm kiếm sản phẩm theo từ khóa (tên hoặc danh mục) và trạng thái (tùy chọn)
    @Query("SELECT DISTINCT p FROM Product p LEFT JOIN FETCH p.images i LEFT JOIN p.category c WHERE " +
           "(:keyword IS NULL OR :keyword = '' OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(c.name) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "AND (:status IS NULL OR p.status = :status)")
    Page<Product> findForAdmin(@Param("keyword") String keyword, @Param("status") ProductStatus status, Pageable pageable);

    // Lấy danh sách các danh mục duy nhất (giữ tương thích cũ)
    @Query("SELECT DISTINCT c.name FROM Product p JOIN p.category c")
    List<String> findDistinctCategories();
}

