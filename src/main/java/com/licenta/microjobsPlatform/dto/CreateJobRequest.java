package com.licenta.microjobsPlatform.dto;

import java.time.Instant;

public class CreateJobRequest {

    private String title;
    private String description;
    private Integer neededWorkers;
    private Instant startDate;
    private Instant endDate;
    private Integer salary;
    private String location;
    private String county;

    public CreateJobRequest() {
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

    public Instant getStartDate() {
        return startDate;
    }

    public void setStartDate(Instant startDate) {
        this.startDate = startDate;
    }

    public Instant getEndDate() {
        return endDate;
    }

    public void setEndDate(Instant endDate) {
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

    public String getCounty() {
        return county;
    }

    public void setCounty(String county) {
        this.county = county;
    }

}
