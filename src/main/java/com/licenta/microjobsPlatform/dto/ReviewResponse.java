package com.licenta.microjobsPlatform.dto;

import java.time.LocalDateTime;

public class ReviewResponse {

    private String id;
    private String jobId;
    private String reviewerId;
    private String reviewerFirstName;
    private String reviewerLastName;
    private String reviewedUserId;
    private String reviewedUserFirstName;
    private String reviewedUserLastName;
    private Integer rating;
    private String message;
    private LocalDateTime createdAt;

    public ReviewResponse(String id, String jobId, String reviewerId, String reviewerFirstName,
                          String reviewerLastName, String reviewedUserId,
                          String reviewedUserFirstName, String reviewedUserLastName,
                          Integer rating, String message, LocalDateTime createdAt) {
        this.id = id;
        this.jobId = jobId;
        this.reviewerId = reviewerId;
        this.reviewerFirstName = reviewerFirstName;
        this.reviewerLastName = reviewerLastName;
        this.reviewedUserId = reviewedUserId;
        this.reviewedUserFirstName = reviewedUserFirstName;
        this.reviewedUserLastName = reviewedUserLastName;
        this.rating = rating;
        this.message = message;
        this.createdAt = createdAt;
    }

    public String getId() { return id; }
    public String getJobId() { return jobId; }
    public String getReviewerId() { return reviewerId; }
    public String getReviewerFirstName() { return reviewerFirstName; }
    public String getReviewerLastName() { return reviewerLastName; }
    public String getReviewedUserId() { return reviewedUserId; }
    public String getReviewedUserFirstName() { return reviewedUserFirstName; }
    public String getReviewedUserLastName() { return reviewedUserLastName; }
    public Integer getRating() { return rating; }
    public String getMessage() { return message; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}