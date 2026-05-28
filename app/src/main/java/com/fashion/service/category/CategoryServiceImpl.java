package com.fashion.service.category;

import com.fashion.dto.request.CategoryRequestDTO;
import com.fashion.dto.response.CategoryResponseDTO;
import com.fashion.exception.BadRequestException;
import com.fashion.exception.ResourceNotFoundException;
import com.fashion.model.Category;
import com.fashion.model.Product;
import com.fashion.repository.CategoryRepository;
import com.fashion.service.product.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductService productService; // Sử dụng ProductService để xóa sản phẩm

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
    @Transactional(readOnly = true)
    public List<CategoryResponseDTO> getCategoryTree() {
        return categoryRepository.findByParentIsNull()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public CategoryResponseDTO getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy danh mục với ID: " + id));
        return mapToDTO(category);
    }

    @Override
    public CategoryResponseDTO getCategoryByName(String name) {
        Category category = categoryRepository.findByName(name)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy danh mục với tên: " + name));
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
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy danh mục với ID: " + id));

        category.setName(request.getName());

        if (request.getParentId() != null) {

            if (id.equals(request.getParentId())) {
                throw new BadRequestException("Danh mục không thể tự làm cha của chính nó");
            }

            Category parent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy danh mục cha"));

            if (isInvalidParent(request.getParentId(), id)) {
                throw new BadRequestException("Không thể gán danh mục con/cháu làm danh mục cha");
            }

            category.setParent(parent);

        } else {
            category.setParent(null);
        }

        return mapToDTO(categoryRepository.save(category));
    }

    // --- LOGIC XÓA MỚI (AC-BE-DEL-01, 02, 03, 04) ---
    @Override
    @Transactional
    public void deleteCategory(Long id) {
        // Nếu không có, ném ra ResourceNotFoundException để trả về HTTP 404
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy danh mục để xóa"));

        // Dọn dẹp an toàn các sản phẩm để không vi phạm khóa ngoại
        deleteProductsRecursively(category);

        // Khi sản phẩm đã sạch, tiến hành xóa Category (JPA tự động cascade xóa category con)
        categoryRepository.delete(category);
    }

    /**
     * Hàm đệ quy xóa mọi sản phẩm trong cây danh mục
     */
    private void deleteProductsRecursively(Category category) {
        // Duyệt xóa ở các danh mục con trước
        if (category.getChildren() != null && !category.getChildren().isEmpty()) {
            for (Category child : category.getChildren()) {
                deleteProductsRecursively(child);
            }
        }

        // Xóa sản phẩm ở danh mục hiện tại thông qua ProductService
        if (category.getProducts() != null && !category.getProducts().isEmpty()) {
            // Lấy ID ra list riêng để tránh lỗi ConcurrentModificationException
            List<Long> productIds = category.getProducts().stream()
                    .map(Product::getId)
                    .toList();

            for (Long productId : productIds) {
                productService.deleteProduct(productId);
            }
            // Clear list để JPA không cố gắng cascade xóa những phần tử đã bị xóa
            category.getProducts().clear();
        }
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