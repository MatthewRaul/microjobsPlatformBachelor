package com.licenta.microjobsPlatform.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.licenta.microjobsPlatform.model.User;
import com.licenta.microjobsPlatform.service.UserService;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import com.licenta.microjobsPlatform.dto.LoginRequest;
import com.licenta.microjobsPlatform.dto.LoginResponse;


@RestController //clasa primeste cereri HTTP, raspunde cu obiecte transformate in JSON
@RequestMapping("/api/users") //pune baza URL-ului
@CrossOrigin(origins="*")//acceptare cereri din alte origini, cum ar fi porturi diferite
public class UserController {
    private final UserService userService;
    
    public UserController(UserService userService)
    {
        this.userService=userService;
    }

    @PostMapping("/register")//creeaza endpointul POST /api/users/register
    public User registUser(@RequestBody User user){ //datele venite in JSON trebuie transformate intr un obiect de tip USER
        return userService.registerUser(user);
    
    }

    @PostMapping("/login")// /api/users/login
    public LoginResponse loginUser(@RequestBody LoginRequest loginRequest){
        return userService.loginUser(loginRequest);
    }
    
    
    
}
