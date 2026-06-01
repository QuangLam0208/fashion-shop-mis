package com.fashion.service.category;

import com.fashion.model.Category;
import com.fashion.repository.CategoryRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CategoryServiceImplTestGET {

    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private CategoryServiceImpl categoryService;

    @Test
    void testGetDescendantIds_NullCategoryId_ReturnsEmptyList() {
        // Act
        List<Long> result = categoryService.getDescendantIds(null);

        // Assert
        assertTrue(result.isEmpty());
        verify(categoryRepository, never()).findByParentId(anyLong());
    }

    @Test
    void testGetDescendantIds_NoChildren_ReturnsOnlySelf() {
        // Arrange
        Long categoryId = 1L;
        when(categoryRepository.findByParentId(categoryId)).thenReturn(Collections.emptyList());

        // Act
        List<Long> result = categoryService.getDescendantIds(categoryId);

        // Assert
        assertEquals(1, result.size());
        assertTrue(result.contains(1L));
        verify(categoryRepository, times(1)).findByParentId(categoryId);
    }

    @Test
    void testGetDescendantIds_WithChildrenAndGrandchildren_ReturnsAllIds() {
        // Arrange
        // Giả lập cây danh mục: P(1) -> C1(2), C2(3) và C1(2) -> C1-1(4)
        Category c1 = new Category(); c1.setId(2L);
        Category c2 = new Category(); c2.setId(3L);
        Category c1_1 = new Category(); c1_1.setId(4L);

        when(categoryRepository.findByParentId(1L)).thenReturn(List.of(c1, c2));
        when(categoryRepository.findByParentId(2L)).thenReturn(List.of(c1_1));
        when(categoryRepository.findByParentId(3L)).thenReturn(Collections.emptyList());
        when(categoryRepository.findByParentId(4L)).thenReturn(Collections.emptyList());

        // Act
        List<Long> result = categoryService.getDescendantIds(1L);

        // Assert
        assertEquals(4, result.size());
        assertTrue(result.containsAll(List.of(1L, 2L, 3L, 4L)));

        verify(categoryRepository, times(1)).findByParentId(1L);
        verify(categoryRepository, times(1)).findByParentId(2L);
        verify(categoryRepository, times(1)).findByParentId(3L);
        verify(categoryRepository, times(1)).findByParentId(4L);
    }
}