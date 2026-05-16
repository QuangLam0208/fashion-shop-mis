package com.fashion.repository;

import com.fashion.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    // Lấy tất cả danh mục gốc (không có cha)
    List<Category> findByParentIsNull();

    // Lấy tất cả danh mục con của một danh mục cha
    List<Category> findByParentId(Long parentId);

    // Tìm danh mục theo tên
    Optional<Category> findByName(String name);
}
