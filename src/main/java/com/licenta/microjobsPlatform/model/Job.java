package com.licenta.microjobsPlatform.model;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "jobs")
public class Job {
    @Id
    private String id;

    private String title;
    private String description;
    private String postedBy;
    private Integer neededWorkers;
    private Integer acceptedWorkers;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private JobStatus status;
    private LocalDateTime createdAt;
    private Integer salary;

    public Job(){

    }

    public Job(String id, String title, String description, String postedBy, Integer neededWorkers,
            Integer acceptedWorkers, LocalDateTime startDate, LocalDateTime endDate, JobStatus status,
            LocalDateTime createdAt,Integer salary) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.postedBy = postedBy;
        this.neededWorkers = neededWorkers;
        this.acceptedWorkers = acceptedWorkers;
        this.startDate = startDate;
        this.endDate = endDate;
        this.status = status;
        this.createdAt = createdAt;
        this.salary=salary;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getPostedBy() {
        return postedBy;
    }

    public void setPostedBy(String postedBy) {
        this.postedBy = postedBy;
    }

    public Integer getNeededWorkers() {
        return neededWorkers;
    }

    public void setNeededWorkers(Integer neededWorkers) {
        this.neededWorkers = neededWorkers;
    }

    public Integer getAcceptedWorkers() {
        return acceptedWorkers;
    }

    public void setAcceptedWorkers(Integer acceptedWorkers) {
        this.acceptedWorkers = acceptedWorkers;
    }

    public LocalDateTime getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDateTime startDate) {
        this.startDate = startDate;
    }

    public LocalDateTime getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDateTime endDate) {
        this.endDate = endDate;
    }

    public JobStatus getStatus() {
        return status;
    }

    public void setStatus(JobStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Integer getSalary() {
        return salary;
    }

    public void setSalary(Integer salary) {
        this.salary = salary;
    }

    

    
}
