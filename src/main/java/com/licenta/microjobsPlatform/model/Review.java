package com.licenta.microjobsPlatform.model;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection="reviews")
public class Review {
    @Id
    private String id;

    private String jobId;
    private String reviewerId;
    private String reviewedUserId;
    private Integer rating;
    private String message;
    private LocalDateTime createdAt;

    public Review(){
    }

    public Review(String id, String jobId, String reviewerId, String reviewedUserId, Integer rating, String message) {
        this.id = id;
        this.jobId = jobId;
        this.reviewerId = reviewerId;
        this.reviewedUserId = reviewedUserId;
        this.rating = rating;
        this.message = message;
        this.createdAt=LocalDateTime.now();
    }

    

    public Review(String id, String jobId, String reviewerId, String reviewedUserId, Integer rating) {
        this.id = id;
        this.jobId = jobId;
        this.reviewerId = reviewerId;
        this.reviewedUserId = reviewedUserId;
        this.rating = rating;
    }



    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getJobId() {
        return jobId;
    }

    public void setJobId(String jobId) {
        this.jobId = jobId;
    }

    public String getReviewerId() {
        return reviewerId;
    }

    public void setReviewerId(String reviewerId) {
        this.reviewerId = reviewerId;
    }

    public String getReviewedUserId() {
        return reviewedUserId;
    }

    public void setReviewedUserId(String reviewedUserId) {
        this.reviewedUserId = reviewedUserId;
    }

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    
    

}
