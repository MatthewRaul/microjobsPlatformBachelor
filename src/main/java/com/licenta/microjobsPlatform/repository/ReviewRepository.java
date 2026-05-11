package com.licenta.microjobsPlatform.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.licenta.microjobsPlatform.model.Review;

public interface ReviewRepository extends MongoRepository<Review, String> {

    boolean existsByJobIdAndReviewerIdAndReviewedUserId(
            String jobId,
            String reviewerId,
            String reviewedUserId
    );

    List<Review> findByReviewedUserId(String reviewedUserId);

    List<Review> findByReviewedUserIdOrderByCreatedAtDesc(String reviewedUserId);
}