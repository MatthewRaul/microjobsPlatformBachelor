package com.licenta.microjobsPlatform.dto;

import com.licenta.microjobsPlatform.model.Role;

public class LoginResponse {
    private String token;
    private String firstName;
    private String email;
    private Role role;
    
    public LoginResponse(){
        
    }

    public LoginResponse(String token, String firstName, String email, Role role) {
        this.token = token;
        this.firstName = firstName;
        this.email = email;
        this.role = role;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }
    
    
}
