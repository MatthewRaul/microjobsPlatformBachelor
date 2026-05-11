package com.licenta.microjobsPlatform.dto;

public class CreateReviewRequest {
    private String jobId;
    private String reviewedUserId;
    private Integer rating;
    private String message;

    public CreateReviewRequest(){

    }

    public CreateReviewRequest(String jobId, String reviewedUserId, Integer rating, String message) {
        this.jobId = jobId;
        this.reviewedUserId = reviewedUserId;
        this.rating = rating;
        this.message = message;
    }

    public String getJobId() {
        return jobId;
    }

    public void setJobId(String jobId) {
        this.jobId = jobId;
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

    
}
