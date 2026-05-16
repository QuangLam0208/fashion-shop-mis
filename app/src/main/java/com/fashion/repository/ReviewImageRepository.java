package com.fashion.repository;

import com.fashion.model.ReviewImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

@Repository
public interface ReviewImageRepository extends JpaRepository<ReviewImage, Long> {
    // Chỉ lấy ra ID để tránh Hibernate tải cột imageUrl (LONGTEXT Base64) làm nặng bộ nhớ
    @Query("SELECT ri.id FROM ReviewImage ri WHERE ri.review.id = :reviewId")
    List<Long> findIdsByReviewId(@Param("reviewId") Long reviewId);
}
