package com.licenta.microjobsPlatform.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.licenta.microjobsPlatform.dto.CreateReviewRequest;
import com.licenta.microjobsPlatform.dto.PublicUserRatingResponse;
import com.licenta.microjobsPlatform.dto.ReviewResponse;
import com.licenta.microjobsPlatform.service.ReviewService;

@RestController
@RequestMapping("/api")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping("/reviews")
    public ResponseEntity<ReviewResponse> createReview(
            @RequestBody CreateReviewRequest request,
            Authentication authentication
    ) {
        ReviewResponse response = reviewService.createReview(request, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/users/{userId}/rating")
    public ResponseEntity<PublicUserRatingResponse> getUserRating(@PathVariable String userId) {
        return ResponseEntity.ok(reviewService.getPublicUserRating(userId));
    }

    @GetMapping("/users/{userId}/reviews")
    public ResponseEntity<List<ReviewResponse>> getUserReviews(@PathVariable String userId) {
        return ResponseEntity.ok(reviewService.getPublicReviewsForUser(userId));
    }
}