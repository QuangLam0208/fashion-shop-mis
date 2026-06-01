package com.fashion.service.product;

import com.fashion.dto.response.ProductSummaryResponseDTO;
import com.fashion.model.Product;
import com.fashion.repository.ProductRepository;
import com.fashion.service.category.CategoryService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceImplTestGET {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private CategoryService categoryService;

    @InjectMocks
    private ProductServiceImpl productService;

    @Test
    void testGetProducts_WithKeywordOnly_CategoryIdIsNull() {
        // Arrange
        String keyword = "áo sơ mi";
        Pageable pageable = PageRequest.of(0, 12);
        Page<Product> emptyPage = new PageImpl<>(new ArrayList<>());

        when(productRepository.findFiltered(eq(keyword), eq(List.of(-1L)), eq(false), eq(pageable)))
                .thenReturn(emptyPage);

        // Act
        Page<ProductSummaryResponseDTO> result = productService.getProducts(keyword, null, pageable);

        // Assert
        assertNotNull(result);
        verify(categoryService, never()).getDescendantIds(anyLong());
        verify(productRepository, times(1)).findFiltered(eq(keyword), eq(List.of(-1L)), eq(false), eq(pageable));
    }

    @Test
    void testGetProducts_WithCategoryId_IncludeDescendants() {
        // Arrange
        Long categoryId = 1L;
        String keyword = null;
        Pageable pageable = PageRequest.of(0, 12);
        List<Long> mockDescendantIds = List.of(1L, 2L, 3L);
        Page<Product> emptyPage = new PageImpl<>(new ArrayList<>());

        when(categoryService.getDescendantIds(categoryId)).thenReturn(mockDescendantIds);
        when(productRepository.findFiltered(eq(null), eq(mockDescendantIds), eq(true), eq(pageable)))
                .thenReturn(emptyPage);

        // Act
        Page<ProductSummaryResponseDTO> result = productService.getProducts(keyword, categoryId, pageable);

        // Assert
        assertNotNull(result);
        verify(categoryService, times(1)).getDescendantIds(categoryId);
        verify(productRepository, times(1)).findFiltered(eq(null), eq(mockDescendantIds), eq(true), eq(pageable));
    }
}