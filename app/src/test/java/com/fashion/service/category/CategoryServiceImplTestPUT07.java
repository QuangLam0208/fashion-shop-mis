package com.fashion.service.category;

import com.fashion.dto.request.CategoryRequestDTO;
import com.fashion.dto.response.CategoryResponseDTO;
import com.fashion.exception.BadRequestException;
import com.fashion.exception.ResourceNotFoundException;
import com.fashion.model.Category;
import com.fashion.repository.CategoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CategoryServiceImplTestPUT07 {

    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private CategoryServiceImpl categoryService;

    private Category categoryA;
    private Category categoryB;
    private CategoryRequestDTO requestDTO;

    @BeforeEach
    void setUp() {
        categoryA = new Category();
        categoryA.setId(1L);
        categoryA.setName("Category A");

        categoryB = new Category();
        categoryB.setId(2L);
        categoryB.setName("Category B");

        requestDTO = new CategoryRequestDTO();
    }

    @Test
    void testUpdateCategory_RenameOnly_Success() {
        requestDTO.setName("New Name");
        requestDTO.setParentId(null);

        when(categoryRepository.findById(1L)).thenReturn(Optional.of(categoryA));
        when(categoryRepository.save(any(Category.class))).thenReturn(categoryA);

        CategoryResponseDTO response = categoryService.updateCategory(1L, requestDTO);

        assertEquals("New Name", categoryA.getName());
        verify(categoryRepository).save(categoryA);
    }

    @Test
    void testUpdateCategory_ChangeParent_Success() {
        requestDTO.setName("Category A");
        requestDTO.setParentId(2L);

        when(categoryRepository.findById(1L)).thenReturn(Optional.of(categoryA));
        when(categoryRepository.findById(2L)).thenReturn(Optional.of(categoryB));
        when(categoryRepository.findParentIdByCategoryId(2L)).thenReturn(null); // Không có vòng lặp
        when(categoryRepository.save(any(Category.class))).thenReturn(categoryA);

        categoryService.updateCategory(1L, requestDTO);

        assertEquals(2L, categoryA.getParent().getId());
        verify(categoryRepository).save(categoryA);
    }

    @Test
    void testUpdateCategory_ParentNotFound_Throws404() {
        requestDTO.setName("Name");
        requestDTO.setParentId(99L); // ID không tồn tại

        when(categoryRepository.findById(1L)).thenReturn(Optional.of(categoryA));
        when(categoryRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> categoryService.updateCategory(1L, requestDTO));
    }

    @Test
    void testUpdateCategory_SelfParenting_Throws400() {
        requestDTO.setName("Name");
        requestDTO.setParentId(1L); // Cố tình gán cha là chính nó

        when(categoryRepository.findById(1L)).thenReturn(Optional.of(categoryA));

        assertThrows(BadRequestException.class, () -> categoryService.updateCategory(1L, requestDTO));
    }

    @Test
    void testUpdateCategory_CyclicParenting_Throws400() {
        // Mô phỏng cấu trúc: A muốn nhận B làm cha. Nhưng cha của B hiện tại lại chính là A (A -> B -> A).
        requestDTO.setName("Name");
        requestDTO.setParentId(2L);

        when(categoryRepository.findById(1L)).thenReturn(Optional.of(categoryA));
        when(categoryRepository.findById(2L)).thenReturn(Optional.of(categoryB));

        // Mô phỏng việc DB trả về cha của 2L là 1L
        when(categoryRepository.findParentIdByCategoryId(2L)).thenReturn(1L);

        assertThrows(BadRequestException.class, () -> categoryService.updateCategory(1L, requestDTO));
    }
}