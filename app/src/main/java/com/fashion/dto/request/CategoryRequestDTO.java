package com.fashion.dto.request;

import lombok.Data;

@Data
public class CategoryRequestDTO {
    private String name;
    private Long parentId;
}