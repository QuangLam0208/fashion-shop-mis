package com.fashion.repository;

import com.fashion.model.RecentlyViewedItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface RecentlyViewedItemRepository extends JpaRepository<RecentlyViewedItem, Long> {
    
    List<RecentlyViewedItem> findTop10ByUserIdOrderByViewedAtDesc(Long userId);
    
    Optional<RecentlyViewedItem> findByUserIdAndProductId(Long userId, Long productId);
    
    void deleteByUserId(Long userId);

    @Transactional
    void deleteByUserIdAndProductIdIn(Long userId, List<Long> productIds);
}
