package com.licenta.microjobsPlatform.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.licenta.microjobsPlatform.dto.LoginRequest;
import com.licenta.microjobsPlatform.dto.LoginResponse;
import com.licenta.microjobsPlatform.dto.UpdateProfileRequest;
import com.licenta.microjobsPlatform.dto.UserResponse;
import com.licenta.microjobsPlatform.model.User;
import com.licenta.microjobsPlatform.security.JwtService;
import com.licenta.microjobsPlatform.service.UserService;


@RestController //clasa primeste cereri HTTP, raspunde cu obiecte transformate in JSON
@RequestMapping("/api/users") //pune baza URL-ului
@CrossOrigin(origins="*")//acceptare cereri din alte origini, cum ar fi porturi diferite
public class UserController {
    private final UserService userService;
    private final JwtService jwtService;
    
    public UserController(UserService userService,JwtService jwtService)
    {
        this.userService=userService;
        this.jwtService=jwtService;
    }

    @PostMapping("/register")//creeaza endpointul POST /api/users/register
    public ResponseEntity<?> registerUser(@RequestBody User user) {
    try {
        User savedUser = userService.registerUser(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedUser);
    } catch (ResponseStatusException e) {
        return ResponseEntity.status(e.getStatusCode()).body(e.getReason());
        }
    }


    @PostMapping("/login")// /api/users/login
    public ResponseEntity<?> loginUser(@RequestBody LoginRequest loginRequest) {
    try {
        LoginResponse response = userService.loginUser(loginRequest);
        return ResponseEntity.ok(response);
    } catch (Exception e) {
        e.printStackTrace();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Eroare login: " + e.getMessage());
    }
}

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader("Authorization") String authHeader) {
    if (authHeader == null || !authHeader.startsWith("Bearer ")) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Token lipsa");
    }

    String token = authHeader.substring(7);
    String email = jwtService.extractUsername(token);

    User user = userService.findByEmail(email)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User negasit"));

    Map<String, Object> response = new HashMap<>();
    response.put("id",user.getId());
    response.put("firstName", user.getFirstName());
    response.put("lastName",user.getLastName());
    response.put("email", user.getEmail());
    response.put("role", user.getRole());
    response.put("phoneNumber",user.getPhoneNumber());
    response.put("bio",user.getBio());
    response.put("profilePictureUrl",user.getProfilePictureUrl());
    response.put("createdAt",user.getCreatedAt());

    return ResponseEntity.ok(response);
    }

    @PatchMapping("/me")
    public ResponseEntity<UserResponse> updateProfile(
        @RequestHeader("Authorization") String authHeader,
        @RequestBody UpdateProfileRequest request){
        if(authHeader==null || !authHeader.startsWith("Bearer ")){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String token= authHeader.substring(7);
        String email= jwtService.extractUsername(token);
        return ResponseEntity.ok(userService.updateProfile(email, request));
    }

    @GetMapping("/profile/{id}")
    public ResponseEntity<UserResponse> getUserProfile(@PathVariable String id) {
        return ResponseEntity.ok(userService.getUserProfileById(id));
    }


    
    
    
}