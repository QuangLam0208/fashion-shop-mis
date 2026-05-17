package com.fashion.service;

import com.fashion.dto.CategoryRequestDTO;
import com.fashion.dto.CategoryResponseDTO;
import com.fashion.model.Category;
import com.fashion.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    // Hàm chuyển đổi từ Entity sang DTO (Hỗ trợ đệ quy cho cây danh mục)
    private CategoryResponseDTO mapToDTO(Category category) {
        CategoryResponseDTO dto = new CategoryResponseDTO();
        dto.setId(category.getId());
        dto.setName(category.getName());

        if (category.getParent() != null) {
            dto.setParentId(category.getParent().getId());
        }

        if (category.getChildren() != null && !category.getChildren().isEmpty()) {
            dto.setChildren(category.getChildren().stream()
                    .map(this::mapToDTO)
                    .collect(Collectors.toList()));
        }
        return dto;
    }

    // 1. Lấy toàn bộ cây danh mục (chỉ lấy các danh mục gốc, children sẽ tự động được map)
    public List<CategoryResponseDTO> getCategoryTree() {
        List<Category> rootCategories = categoryRepository.findByParentIsNull();
        return rootCategories.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    // 2. Tìm kiếm danh mục theo ID
    public CategoryResponseDTO getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục với ID: " + id));
        return mapToDTO(category);
    }

    // 3. Tìm kiếm danh mục theo Tên
    public CategoryResponseDTO getCategoryByName(String name) {
        Category category = categoryRepository.findByName(name)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục với tên: " + name));
        return mapToDTO(category);
    }

    // 4. Thêm mới danh mục
    @Transactional
    public CategoryResponseDTO createCategory(CategoryRequestDTO request) {
        Category category = new Category();
        category.setName(request.getName());

        if (request.getParentId() != null) {
            Category parent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục cha"));
            category.setParent(parent);
        }

        return mapToDTO(categoryRepository.save(category));
    }

    // 5. Cập nhật danh mục
    @Transactional
    public CategoryResponseDTO updateCategory(Long id, CategoryRequestDTO request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục với ID: " + id));

        category.setName(request.getName());

        if (request.getParentId() != null) {
            // Kiểm tra tránh việc tự gán bản thân làm danh mục cha
            if (id.equals(request.getParentId())) {
                throw new RuntimeException("Danh mục không thể tự làm cha của chính nó");
            }
            Category parent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục cha"));
            category.setParent(parent);
        } else {
            category.setParent(null); // Gỡ danh mục cha để thành danh mục gốc
        }

        return mapToDTO(categoryRepository.save(category));
    }

    // 6. Xóa danh mục
    @Transactional
    public void deleteCategory(Long id) {
        if (!categoryRepository.existsById(id)) {
            throw new RuntimeException("Không tìm thấy danh mục để xóa");
        }
        categoryRepository.deleteById(id);
    }
}