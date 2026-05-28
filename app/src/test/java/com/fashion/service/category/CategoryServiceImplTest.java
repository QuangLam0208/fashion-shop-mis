package com.fashion.service.category;

import com.fashion.exception.ResourceNotFoundException;
import com.fashion.model.Category;
import com.fashion.model.Product;
import com.fashion.repository.CategoryRepository;
import com.fashion.service.product.ProductService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CategoryServiceImplTest {

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private ProductService productService;

    @InjectMocks
    private CategoryServiceImpl categoryService;

    private Category category;
    private Product product;

    @BeforeEach
    void setUp() {
        product = new Product();
        product.setId(100L);

        category = new Category();
        category.setId(1L);
        category.setName("Quần Áo");
        category.setProducts(new ArrayList<>(List.of(product)));
        category.setChildren(new ArrayList<>());
    }

    @Test
    void deleteCategory_Success_DeletesCategoryAndLinkedProducts() {
        // Arrange
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));

        // Act
        categoryService.deleteCategory(1L);

        // Assert
        // Đảm bảo ProductService đã thực thi xóa sản phẩm (Cascade Delete AC-02)
        verify(productService, times(1)).deleteProduct(100L);
        // Đảm bảo Repository xóa danh mục
        verify(categoryRepository, times(1)).delete(category);
    }

    @Test
    void deleteCategory_NotFound_ThrowsResourceNotFoundException() {
        // Arrange
        when(categoryRepository.findById(99L)).thenReturn(Optional.empty());

        // Act & Assert (Lỗi 404 AC-04)
        assertThrows(ResourceNotFoundException.class, () -> categoryService.deleteCategory(99L));

        verify(productService, never()).deleteProduct(anyLong());
        verify(categoryRepository, never()).delete(any(Category.class));
    }

    @Test
    void deleteCategory_Success_CascadeDeletesChildCategoriesProducts() {
        // Arrange (AC-03)
        Category childCategory = new Category();
        childCategory.setId(2L);
        Product childProduct = new Product();
        childProduct.setId(101L);
        childCategory.setProducts(new ArrayList<>(List.of(childProduct)));
        childCategory.setChildren(new ArrayList<>());

        category.getChildren().add(childCategory);

        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));

        // Act
        categoryService.deleteCategory(1L);

        // Assert
        verify(productService, times(1)).deleteProduct(101L); // Xóa sản phẩm ở mục con
        verify(productService, times(1)).deleteProduct(100L); // Xóa sản phẩm ở mục cha
        verify(categoryRepository, times(1)).delete(category);
    }
}