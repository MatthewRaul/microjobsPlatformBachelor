package com.licenta.microjobsPlatform.dto;

import java.time.LocalDateTime;

import com.licenta.microjobsPlatform.model.AplicareStatus;

public class AplicareResponse {

    private String id;
    private String jobId;

    private String applicantUserId;
    private String applicantEmail;
    private String applicantFirstName;
    private String applicantLastName;

    private Double applicantAverageRating;
    private Integer applicantReviewCount;
    private String jobOwnerEmail;
    private AplicareStatus status;
    private LocalDateTime appliedAt;
    private String jobTitle;

    public AplicareResponse(String id, String jobId, String applicantUserId,
            String applicantEmail, String applicantFirstName,
            String applicantLastName, Double applicantAverageRating,
            Integer applicantReviewCount, AplicareStatus status,
            LocalDateTime appliedAt, String jobTitle, String jobOwnerEmail) {
        this.id = id;
        this.jobId = jobId;
        this.applicantUserId = applicantUserId;
        this.applicantEmail = applicantEmail;
        this.applicantFirstName = applicantFirstName;
        this.applicantLastName = applicantLastName;
        this.applicantAverageRating = applicantAverageRating;
        this.applicantReviewCount = applicantReviewCount;
        this.status = status;
        this.appliedAt = appliedAt;
        this.jobTitle = jobTitle;
        this.jobOwnerEmail = jobOwnerEmail;
    }

    public String getId() {
        return id;
    }

    public String getJobId() {
        return jobId;
    }

    public String getApplicantUserId() {
        return applicantUserId;
    }

    public String getApplicantEmail() {
        return applicantEmail;
    }

    public String getApplicantFirstName() {
        return applicantFirstName;
    }

    public String getApplicantLastName() {
        return applicantLastName;
    }

    public Double getApplicantAverageRating() {
        return applicantAverageRating;
    }

    public Integer getApplicantReviewCount() {
        return applicantReviewCount;
    }

    public AplicareStatus getStatus() {
        return status;
    }

    public LocalDateTime getAppliedAt() {
        return appliedAt;
    }

    public String getJobTitle() {
        return jobTitle;
    }

    public String getJobOwnerEmail() {
        return jobOwnerEmail;
    }

    public void setJobOwnerEmail(String jobOwnerEmail) {
        this.jobOwnerEmail = jobOwnerEmail;
    }

}
