package com.fashion.dto.response;

import lombok.Data;
import java.util.List;

@Data
public class CategoryResponseDTO {
    private Long id;
    private String name;
    private Long parentId;
    private List<CategoryResponseDTO> children;
}