package com.fashion.model;
import com.fashion.model.enums.ReturnStatus;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Entity
@Table(name = "return_requests")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
public class ReturnRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "return_request_id")
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReturnStatus status;

    @Column(nullable = false)
    private String reason;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private Date requestDate;

    @Column
    private Date processedAt;

    @Column(columnDefinition = "TEXT")
    private String rejectionReason;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "processed_by")
    private User processedBy;

    // Linking to the original order
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    // Linking to the user who requested
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // List of items returned. No orphanRemoval=true because deleting a return request should NOT delete the actual order items!
    @Builder.Default
    @OneToMany(mappedBy = "returnRequest", cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    private List<OrderItem> returnItems = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "return_request_images", joinColumns = @JoinColumn(name = "return_request_id"))
    @Column(name = "image_url", columnDefinition = "TEXT")
    private List<String> imageUrls = new ArrayList<>();
}
