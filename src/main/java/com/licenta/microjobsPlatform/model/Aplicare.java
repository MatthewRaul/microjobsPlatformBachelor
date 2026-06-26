package com.licenta.microjobsPlatform.model;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "aplicari")
public class Aplicare {

    @Id
    private String id;
    private String jobId;
    private String applicantEmail;
    private String applicantFirstName;
    private String applicantLastName;
    private AplicareStatus status;
    private LocalDateTime appliedAt;
    private String jobTitle;

    public Aplicare() {
    }

    public Aplicare(String id, String applicantEmail, String applicantFirstName, String applicantLastName, LocalDateTime appliedAt, String jobId, AplicareStatus status, String jobTitle) {
        this.id = id;
        this.applicantEmail = applicantEmail;
        this.applicantFirstName = applicantFirstName;
        this.applicantLastName = applicantLastName;
        this.appliedAt = appliedAt;
        this.jobId = jobId;
        this.status = status;
        this.jobTitle = jobTitle;
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

    public String getApplicantEmail() {
        return applicantEmail;
    }

    public void setApplicantEmail(String applicantEmail) {
        this.applicantEmail = applicantEmail;
    }

    public String getApplicantFirstName() {
        return applicantFirstName;
    }

    public void setApplicantFirstName(String applicantFirstName) {
        this.applicantFirstName = applicantFirstName;
    }

    public String getApplicantLastName() {
        return applicantLastName;
    }

    public void setApplicantLastName(String applicantLastName) {
        this.applicantLastName = applicantLastName;
    }

    public AplicareStatus getStatus() {
        return status;
    }

    public void setStatus(AplicareStatus status) {
        this.status = status;
    }

    public LocalDateTime getAppliedAt() {
        return appliedAt;
    }

    public void setAppliedAt(LocalDateTime appliedAt) {
        this.appliedAt = appliedAt;
    }

    public String getJobTitle() {
        return jobTitle;
    }

    public void setJobTitle(String jobTitle) {
        this.jobTitle = jobTitle;
    }

}
