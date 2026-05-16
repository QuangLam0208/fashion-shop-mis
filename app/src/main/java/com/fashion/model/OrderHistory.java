package com.fashion.model;
import com.fashion.model.enums.OrderStatus;
import jakarta.persistence.*;
import lombok.*;

import java.util.Date;

@Entity
@Table(name = "order_histories")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
public class OrderHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_history")
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(length = 50)
    private OrderStatus previousStatus;

    @Enumerated(EnumType.STRING)
    @Column(length = 50)
    private OrderStatus newStatus;

    @Column
    private Date changeDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_item_id")
    private OrderItem orderItem;
}
