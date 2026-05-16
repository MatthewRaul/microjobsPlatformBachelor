package com.licenta.microjobsPlatform.dto;

import java.util.List;

public class PublicUserProfileResponse {

    private String id;
    private String firstName;
    private String lastName;
    private String bio;
    private String profilePictureUrl;
    private String phoneNumber;
    private String email;
    private List<String> skills;
    private boolean hasCv;
    private Integer age;

    public PublicUserProfileResponse() {}

    public PublicUserProfileResponse(String id, String firstName, String lastName, String bio,
                                     String profilePictureUrl, String phoneNumber, String email,
                                     List<String> skills, boolean hasCv) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.bio = bio;
        this.profilePictureUrl = profilePictureUrl;
        this.phoneNumber = phoneNumber;
        this.email = email;
        this.skills = skills;
        this.hasCv = hasCv;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public String getProfilePictureUrl() { return profilePictureUrl; }
    public void setProfilePictureUrl(String profilePictureUrl) { this.profilePictureUrl = profilePictureUrl; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public List<String> getSkills() { return skills; }
    public void setSkills(List<String> skills) { this.skills = skills; }

    public boolean isHasCv() { return hasCv; }
    public void setHasCv(boolean hasCv) { this.hasCv = hasCv; }

    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }
}