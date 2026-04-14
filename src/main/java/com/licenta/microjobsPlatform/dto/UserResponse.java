package com.licenta.microjobsPlatform.dto;

import java.time.LocalDateTime;

public class UserResponse {
    private String id;
    private String firstName;
    private String lastName;
    private String email;
    private String bio;
    private String profilePictureUrl;
    private LocalDateTime createdAt;
    private String phoneNumber;

    public UserResponse(){
    }

    public UserResponse(String bio, LocalDateTime createdAt, String email, String firstName, String id, String lastName, String phoneNumber, String profilePictureUrl) {
        this.bio = bio;
        this.createdAt = createdAt;
        this.email = email;
        this.firstName = firstName;
        this.id = id;
        this.lastName = lastName;
        this.phoneNumber = phoneNumber;
        this.profilePictureUrl = profilePictureUrl;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public String getProfilePictureUrl() {
        return profilePictureUrl;
    }

    public void setProfilePictureUrl(String profilePictureUrl) {
        this.profilePictureUrl = profilePictureUrl;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }


}
