package com.fashion.service.category;

import com.fashion.dto.request.CategoryRequestDTO;
import com.fashion.dto.response.CategoryResponseDTO;
import com.fashion.model.Category;
import com.fashion.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;
import com.fashion.exception.ResourceNotFoundException;
@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;

    private CategoryResponseDTO mapToDTO(Category category) {
        CategoryResponseDTO dto = new CategoryResponseDTO();
        dto.setId(category.getId());
        dto.setName(category.getName());

        if (category.getParent() != null) {
            dto.setParentId(category.getParent().getId());
            dto.setParentName(category.getParent().getName());
        }

        if (category.getChildren() != null && !category.getChildren().isEmpty()) {
            dto.setChildCount(category.getChildren().size());
            dto.setChildren(category.getChildren().stream()
                    .map(this::mapToDTO)
                    .collect(Collectors.toList()));
        }

        return dto;
    }

    @Override
    public List<CategoryResponseDTO> getCategoryTree() {
        return categoryRepository.findByParentIsNull()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public CategoryResponseDTO getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục với ID: " + id));
        return mapToDTO(category);
    }

    @Override
    public CategoryResponseDTO getCategoryByName(String name) {
        Category category = categoryRepository.findByName(name)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục với tên: " + name));
        return mapToDTO(category);
    }

    @Override
    @Transactional
    public CategoryResponseDTO createCategory(CategoryRequestDTO request) {
        Category category = new Category();
        category.setName(request.getName());

        if (request.getParentId() != null) {
            Category parent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy danh mục cha"));
            category.setParent(parent);
        }

        return mapToDTO(categoryRepository.save(category));
    }

    @Override
    @Transactional
    public CategoryResponseDTO updateCategory(Long id, CategoryRequestDTO request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục với ID: " + id));

        category.setName(request.getName());

        if (request.getParentId() != null) {

            if (id.equals(request.getParentId())) {
                throw new RuntimeException("Danh mục không thể tự làm cha của chính nó");
            }

            Category parent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục cha"));

            if (isInvalidParent(request.getParentId(), id)) {
                throw new RuntimeException("Không thể gán danh mục con/cháu làm danh mục cha");
            }

            category.setParent(parent);

        } else {
            category.setParent(null);
        }

        return mapToDTO(categoryRepository.save(category));
    }

    @Override
    @Transactional
    public void deleteCategory(Long id) {
        if (!categoryRepository.existsById(id)) {
            throw new RuntimeException("Không tìm thấy danh mục để xóa");
        }

        categoryRepository.deleteById(id);
    }
    private boolean isInvalidParent(Long newParentId, Long currentCategoryId) {
        Long parentId = newParentId;

        while (parentId != null) {
            if (parentId.equals(currentCategoryId)) {
                return true;
            }

            parentId = categoryRepository.findParentIdByCategoryId(parentId);
        }

        return false;
    }
    // Thêm đoạn code này vào trong CategoryServiceImpl.java

    @Override
    public List<CategoryResponseDTO> searchCategoriesByName(String keyword) {
        // Tìm các danh mục chứa từ khóa
        List<Category> categories = categoryRepository.findByNameContainingIgnoreCase(keyword);

        // Map sang DTO và trả về danh sách
        return categories.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
}