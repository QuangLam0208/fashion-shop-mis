package com.fashion.service.product;

import com.fashion.dto.request.CreateProductRequestDTO;
import com.fashion.dto.request.UpdateProductRequestDTO;
import com.fashion.dto.response.CategoryResponseDTO;
import com.fashion.dto.response.ProductDetailResponseDTO;
import com.fashion.dto.response.ProductSummaryResponseDTO;
import com.fashion.exception.BadRequestException;
import com.fashion.model.Category;
import com.fashion.model.Product;
import com.fashion.model.ProductImage;
import com.fashion.model.ProductVariant;
import com.fashion.model.enums.ProductStatus;
import com.fashion.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAccessor;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductCleanupRepository cleanupRepository;
    private final ReviewRepository reviewRepository;
    private final OrderItemRepository orderItemRepository;

    // Helper: Lấy tên danh mục an toàn (null-safe)
    private String getCategoryName(Product product) {
        return product.getCategory() != null ? product.getCategory().getName() : "Uncategorized";
    }

    // Helper: Lấy tên danh mục cha an toàn
    private String getParentCategoryName(Product product) {
        if (product.getCategory() != null && product.getCategory().getParent() != null) {
            return product.getCategory().getParent().getName();
        }
        return getCategoryName(product);
    }

    private String formatImageUrl(String url) {
        if (url == null)
            return "/images/placeholder.png";
        if (url.startsWith("http") || url.startsWith("/"))
            return url;
        return "/" + url;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductSummaryResponseDTO> getProducts(String keyword, Pageable pageable) {
        Page<Product> productsPage = productRepository.findFiltered(
                (keyword != null && !keyword.trim().isEmpty()) ? keyword.trim() : null, pageable);

        // Map Entity sang DTO
        return productsPage.map(product -> ProductSummaryResponseDTO.builder()
                .productId(product.getId())
                .name(product.getName())
                .price(product.getVariants().isEmpty() ? 0.0 : product.getVariants().get(0).getPrice())
                .category(getParentCategoryName(product))
                .subcategory(getCategoryName(product))
                .status(product.getStatus())
                .primaryImageUrl(formatImageUrl(product.getImages().isEmpty() ? "/images/placeholder.png"
                        : product.getImages().get(0).getUrl()))
                .hoverImageUrl(formatImageUrl(product.getImages().size() > 1 ? product.getImages().get(1).getUrl()
                        : (product.getImages().isEmpty() ? "/images/placeholder.png"
                        : product.getImages().get(0).getUrl())))
                .totalStock(product.getVariants().stream()
                        .mapToLong(v -> v.getStockQuantity() == null ? 0L : v.getStockQuantity()).sum())
                .variantCount(product.getVariants().size())
                .build());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductSummaryResponseDTO> getAdminProducts(String keyword, ProductStatus status, Pageable pageable) {
        Page<Product> productsPage = productRepository.findForAdmin(
                (keyword != null && !keyword.trim().isEmpty() ? keyword : null), status, pageable);

        // Map Entity sang DTO
        return productsPage.map(product -> ProductSummaryResponseDTO.builder()
                .productId(product.getId())
                .name(product.getName())
                .price(product.getVariants().isEmpty() ? 0.0 : product.getVariants().get(0).getPrice())
                .category(getParentCategoryName(product))
                .subcategory(getCategoryName(product))
                .status(product.getStatus())
                .primaryImageUrl(formatImageUrl(product.getImages().isEmpty() ? "/images/placeholder.png"
                        : product.getImages().get(0).getUrl()))
                .hoverImageUrl(formatImageUrl(product.getImages().size() > 1 ? product.getImages().get(1).getUrl()
                        : (product.getImages().isEmpty() ? "/images/placeholder.png"
                        : product.getImages().get(0).getUrl())))
                .totalStock(product.getVariants().stream()
                        .mapToLong(v -> v.getStockQuantity() == null ? 0L : v.getStockQuantity()).sum())
                .variantCount(product.getVariants().size())
                .build());
    }

    @Override
    @Transactional(readOnly = true)
    public ProductDetailResponseDTO getProductDetail(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại hoặc đã bị ngừng kinh doanh!"));

        Double avgRating = reviewRepository.getAverageRatingByProductId(productId);
        long reviewCount = reviewRepository.countByProductId(productId);

        // Map chi tiết Entity (gồm cả các list phụ) sang DTO
        return ProductDetailResponseDTO.builder()
                .productId(product.getId())
                .name(product.getName())
                .price(product.getVariants().isEmpty() ? 0.0 : product.getVariants().get(0).getPrice())
                .minPrice(product.getVariants().isEmpty() ? 0.0
                        : product.getVariants().stream().mapToDouble(ProductVariant::getPrice).min().orElse(0.0))
                .category(getParentCategoryName(product))
                .categoryName(getCategoryName(product))
                .categoryId(product.getCategory() != null ? product.getCategory().getId() : null)
                .description(product.getDescription())
                .status(product.getStatus())
                .averageRating(avgRating != null ? avgRating : 0.0)
                .reviewCount(reviewCount)
                .mainImage(formatImageUrl(product.getImages().isEmpty() ? "/images/placeholder.png"
                        : product.getImages().get(0).getUrl()))
                .hoverImage(formatImageUrl(product.getImages().size() > 1 ? product.getImages().get(1).getUrl()
                        : (product.getImages().isEmpty() ? "/images/placeholder.png"
                        : product.getImages().get(0).getUrl())))
                .images(product.getImages().stream()
                        .map(img -> ProductDetailResponseDTO.ProductImageDTO.builder()
                                .imageId(img.getId())
                                .url(formatImageUrl(img.getUrl()))
                                .color(img.getColor())
                                .build())
                        .collect(Collectors.toList()))
                .variants(product.getVariants().stream()
                        .map(v -> ProductDetailResponseDTO.ProductVariantDTO.builder()
                                .variantId(v.getId())
                                .size(v.getSize())
                                .color(v.getColor())
                                .stockQuantity(v.getStockQuantity())
                                .price(v.getPrice())
                                .build())
                        .collect(Collectors.toList()))
                .reviews(reviewRepository.findByProductId(productId, PageRequest.of(0, 10)).stream()
                        .map(r -> ProductDetailResponseDTO.ReviewDTO.builder()
                                .reviewId(r.getId())
                                .rating(r.getRating())
                                .comment(r.getComment())
                                .reviewerName(r.getUser() != null ? r.getUser().getFullName() : "Khách hàng H&Y")
                                .size(r.getOrderItem() != null && r.getOrderItem().getProductVariant() != null ? r.getOrderItem().getProductVariant().getSize() : "Freesize")
                                .color(r.getOrderItem() != null && r.getOrderItem().getProductVariant() != null ? r.getOrderItem().getProductVariant().getColor() : "Mặc định")
                                .createdAt(r.getCreatedAt() != null ? DateTimeFormatter.ofPattern("dd/MM/yyyy").withZone(ZoneId.systemDefault()).format(r.getCreatedAt()) : "N/A")
                                .build())
                        .collect(Collectors.toList()))
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductSummaryResponseDTO> getRelatedProducts(Long productId, int limit) {
        Product currentProduct = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại!"));

        if (currentProduct.getCategory() == null) {
            return List.of();
        }

        // Tìm các sản phẩm cùng danh mục
        Pageable pageable = PageRequest.of(0, limit + 1);
        Page<Product> relatedProducts = productRepository.findByCategoryIds(
                List.of(currentProduct.getCategory().getId()),
                pageable);

        return relatedProducts.stream()
                .filter(p -> !p.getId().equals(productId))
                .limit(limit)
                .map(this::mapToSummaryDTO)
                .collect(Collectors.toList());
    }

    private ProductSummaryResponseDTO mapToSummaryDTO(Product p) {
        return ProductSummaryResponseDTO.builder()
                .productId(p.getId())
                .name(p.getName())
                .price(p.getVariants().isEmpty() ? 0.0 : p.getVariants().get(0).getPrice())
                .minPrice(p.getVariants().isEmpty() ? 0.0
                        : p.getVariants().stream()
                        .mapToDouble(ProductVariant::getPrice)
                        .min().orElse(0.0))
                .category(getCategoryName(p))
                .primaryImageUrl(formatImageUrl(
                        p.getImages().isEmpty() ? "/images/placeholder.png" : p.getImages().get(0).getUrl()))
                .hoverImageUrl(formatImageUrl(p.getImages().size() > 1 ? p.getImages().get(1).getUrl()
                        : (p.getImages().isEmpty() ? "/images/placeholder.png" : p.getImages().get(0).getUrl())))
                .averageRating(reviewRepository.getAverageRatingByProductId(p.getId()) != null
                        ? reviewRepository.getAverageRatingByProductId(p.getId())
                        : 0.0)
                .reviewCount(reviewRepository.countByProductId(p.getId()))
                .totalStock(p.getVariants().stream()
                        .mapToLong(v -> v.getStockQuantity() == null ? 0L : v.getStockQuantity()).sum())
                .variantCount(p.getVariants().size())
                .build();
    }

    @Override
    @Transactional
    public ProductDetailResponseDTO createProduct(CreateProductRequestDTO dto) {
        if (dto.getPrice() == null || dto.getPrice() < 0) {
            throw new RuntimeException("Giá sản phẩm không hợp lệ");
        }

        // Tìm Category từ ID
        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Danh mục không tồn tại!"));

        Product product = Product.builder()
                .name(dto.getName())
                .category(category)
                .description(dto.getDescription())
                .status(ProductStatus.ACTIVE)
                .build();

        if (dto.getImageUrls() != null) {
            for (String url : dto.getImageUrls()) {
                ProductImage img = ProductImage.builder()
                        .url(url)
                        .product(product)
                        .build();
                product.getImages().add(img);
            }
        }

        if (dto.getVariants() != null) {
            for (CreateProductRequestDTO.ProductVariantRequestDTO vDto : dto.getVariants()) {
                if (vDto.getStockQuantity() == null || vDto.getStockQuantity() < 0) {
                    throw new RuntimeException("Số lượng tồn kho không hợp lệ");
                }
                ProductVariant variant = ProductVariant.builder()
                        .size(vDto.getSize())
                        .color(vDto.getColor())
                        .stockQuantity(vDto.getStockQuantity())
                        .price(dto.getPrice())
                        .product(product)
                        .build();
                product.getVariants().add(variant);
            }
        }

        productRepository.save(product);
        return getProductDetail(product.getId());
    }

    @Override
    @Transactional
    public ProductDetailResponseDTO updateProduct(Long productId, UpdateProductRequestDTO dto) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại!"));

        if (dto.getName() != null)
            product.setName(dto.getName());

        if (dto.getCategoryId() != null) {
            Category category = categoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Danh mục không tồn tại!"));
            product.setCategory(category);
        }

        if (dto.getDescription() != null)
            product.setDescription(dto.getDescription());

        if (dto.getStatus() != null)
            product.setStatus(dto.getStatus());

        if (dto.getImageUrls() != null) {
            if (dto.getImageUrls().isEmpty()) {
                throw new BadRequestException("Phải có ít nhất một ảnh sản phẩm");
            }
            product.getImages().clear();
            for (String url : dto.getImageUrls()) {
                ProductImage img = ProductImage.builder()
                        .url(url)
                        .product(product)
                        .build();
                product.getImages().add(img);
            }
        }

        if (dto.getVariants() != null) {
            // Lọc ra danh sách các ID biến thể được gửi lên (để giữ lại hoặc cập nhật)
            List<Long> updatedVariantIds = dto.getVariants().stream()
                    .map(UpdateProductRequestDTO.ProductVariantRequestDTO::getVariantId)
                    .filter(Objects::nonNull)
                    .toList();

            // Tìm các biến thể cũ đang có trong DB nhưng KHÔNG CÓ mặt trong payload (nghĩa là yêu cầu xóa)
            List<ProductVariant> variantsToRemove = new ArrayList<>();
            for (ProductVariant existingVariant : product.getVariants()) {
                if (existingVariant.getId() != null && !updatedVariantIds.contains(existingVariant.getId())) {

                    // KIỂM TRA RÀNG BUỘC: Biến thể này đã có người mua chưa?
                    boolean isOrdered = orderItemRepository.existsByProductVariantId(existingVariant.getId());

                    if (isOrdered) {
                        // Nếu đã có giao dịch -> Bắn lỗi ngay lập tức
                        throw new RuntimeException("Không thể xóa biến thể (Size: " + existingVariant.getSize()
                                + " - Màu: " + existingVariant.getColor() + ") vì đã phát sinh giao dịch mua hàng!");
                    }

                    // Nếu an toàn -> Đưa vào danh sách chờ xóa
                    variantsToRemove.add(existingVariant);
                }
            }

            product.getVariants().removeAll(variantsToRemove);

            for (UpdateProductRequestDTO.ProductVariantRequestDTO vDto : dto.getVariants()) {
                if (vDto.getVariantId() != null) {
                    ProductVariant targetVariant = product.getVariants().stream()
                            .filter(v -> v.getId().equals(vDto.getVariantId()))
                            .findFirst()
                            .orElseThrow(() -> new BadRequestException("Biến thể với ID " + vDto.getVariantId() + " không tồn tại hoặc không thuộc về sản phẩm này!"));

                    // Cập nhật giá trị
                    if (vDto.getSize() != null) targetVariant.setSize(vDto.getSize());
                    if (vDto.getColor() != null) targetVariant.setColor(vDto.getColor());
                    targetVariant.setStockQuantity(vDto.getStockQuantity());
                    if (dto.getPrice() != null) targetVariant.setPrice(dto.getPrice());
                } else {
                    ProductVariant variant = ProductVariant.builder()
                            .size(vDto.getSize())
                            .color(vDto.getColor())
                            .stockQuantity(vDto.getStockQuantity())
                            .price(dto.getPrice() != null
                                    ? dto.getPrice()
                                    : (product.getVariants().isEmpty()
                                    ? 0.0
                                    : product.getVariants().get(0).getPrice()))
                            .product(product)
                            .build();
                    product.getVariants().add(variant);
                }
            }
        }

        productRepository.save(product);
        return getProductDetail(product.getId());
    }

    @Override
    @Transactional
    public void deleteProduct(Long productId) {
        if (!productRepository.existsById(productId)) {
            throw new RuntimeException("Sản phẩm không tồn tại!");
        }

        try {
            // High-fidelity cleanup using a dedicated repository (SOLID)
            cleanupRepository.nuclearDelete(productId);
        } catch (Exception e) {
            throw new RuntimeException("Lỗi hệ thống: Không thể xóa sản phẩm. Chi tiết: " + e.getMessage());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponseDTO> getAllCategories() {
        // Trả về DTO của các danh mục gốc (không có cha)
        List<Category> roots = categoryRepository.findByParentIsNull();
        return roots.stream()
                .map(cat -> CategoryResponseDTO.builder()
                        .id(cat.getId())
                        .name(cat.getName())
                        .childCount(cat.getChildren() != null ? cat.getChildren().size() : 0)
                        .build())
                .collect(Collectors.toList());
    }
}
