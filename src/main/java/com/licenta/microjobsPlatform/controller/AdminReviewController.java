package com.licenta.microjobsPlatform.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.licenta.microjobsPlatform.dto.ReviewResponse;
import com.licenta.microjobsPlatform.service.ReviewService;

@RestController
@RequestMapping("/api/admin/reviews")
public class AdminReviewController {

    private final ReviewService reviewService;

    public AdminReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    // Returneaza toate recenziile din sistem
    @GetMapping
    public ResponseEntity<List<ReviewResponse>> getAllReviews() {
        return ResponseEntity.ok(reviewService.getAllReviewsForAdmin());
    }

    // Sterge o recenzie dupa ID
    @DeleteMapping("/{reviewId}")
    public ResponseEntity<?> deleteReview(@PathVariable String reviewId) {
        reviewService.deleteReviewAsAdmin(reviewId);
        return ResponseEntity.ok("Recenzia a fost stearsa.");
    }
}