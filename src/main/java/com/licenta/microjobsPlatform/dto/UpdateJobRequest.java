package com.licenta.microjobsPlatform.dto;

import java.time.LocalDateTime;

public class UpdateJobRequest {

    private String title;
    private String description;
    private Integer neededWorkers;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Integer salary;
    private String location;

    public UpdateJobRequest() {
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

    public Integer getNeededWorkers() {
        return neededWorkers;
    }

    public void setNeededWorkers(Integer neededWorkers) {
        this.neededWorkers = neededWorkers;
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

    public Integer getSalary() {
        return salary;
    }

    public void setSalary(Integer salary) {
        this.salary = salary;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }
}