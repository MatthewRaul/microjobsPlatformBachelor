package com.licenta.microjobsPlatform.dto;

public class LocationSuggestionDto {

    private String location;
    private String county;

    public LocationSuggestionDto(String location, String county) {
        this.location = location;
        this.county = county;
    }

    public LocationSuggestionDto() {
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
