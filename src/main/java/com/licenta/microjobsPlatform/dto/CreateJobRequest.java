package com.licenta.microjobsPlatform.dto;

import java.time.LocalDateTime;

public class CreateJobRequest {
    
    private String title;
    private String description;
    private Integer neededWorkers;
    private Integer acceptedWorkers;
    private LocalDateTime startDate;
    private LocalDateTime endDate;

    public CreateJobRequest(){
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

    
}
