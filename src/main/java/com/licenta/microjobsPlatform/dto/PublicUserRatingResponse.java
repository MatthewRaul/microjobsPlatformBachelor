package com.licenta.microjobsPlatform.dto;

public class PublicUserRatingResponse {

    private String userId;
    private String firstName;
    private String lastName;
    private Double averageRating;
    private Integer reviewCount;

    public PublicUserRatingResponse(String userId, String firstName, String lastName, Double averageRating, Integer reviewCount) {
        this.userId = userId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.averageRating = averageRating;
        this.reviewCount = reviewCount;
    }

    public String getUserId() {
        return userId;
    }

    public String getFirstName() {
        return firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public Double getAverageRating() {
        return averageRating;
    }

    public Integer getReviewCount() {
        return reviewCount;
    }
}
