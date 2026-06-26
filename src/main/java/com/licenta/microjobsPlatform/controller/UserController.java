package com.licenta.microjobsPlatform.controller;

import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.licenta.microjobsPlatform.dto.LoginRequest;
import com.licenta.microjobsPlatform.dto.LoginResponse;
import com.licenta.microjobsPlatform.dto.PublicUserProfileResponse;
import com.licenta.microjobsPlatform.dto.UpdateProfileRequest;
import com.licenta.microjobsPlatform.dto.UserResponse;
import com.licenta.microjobsPlatform.model.User;
import com.licenta.microjobsPlatform.security.JwtService;
import com.licenta.microjobsPlatform.service.UserService;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final JwtService jwtService;

    public UserController(UserService userService, JwtService jwtService) {
        this.userService = userService;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        try {
            UserResponse savedUser = userService.registerUser(user);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedUser);
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).body(e.getReason());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody LoginRequest loginRequest) {
        try {
            LoginResponse response = userService.loginUser(loginRequest);
            return ResponseEntity.ok(response);
        } catch (org.springframework.security.core.AuthenticationException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Email sau parola incorecte.");
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
        response.put("id", user.getId());
        response.put("firstName", user.getFirstName());
        response.put("lastName", user.getLastName());
        response.put("email", user.getEmail());
        response.put("role", user.getRole());
        response.put("phoneNumber", user.getPhoneNumber());
        response.put("bio", user.getBio());
        response.put("profilePictureUrl", user.getProfilePictureUrl());
        response.put("createdAt", user.getCreatedAt());
        response.put("skills", user.getSkills());
        response.put("profileCompleted", user.isProfileCompleted());
        response.put("hasCv", user.getCvBase64() != null && !user.getCvBase64().isBlank());
        response.put("age", user.getAge());

        return ResponseEntity.ok(response);
    }

    @PatchMapping("/me")
    public ResponseEntity<UserResponse> updateProfile(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody UpdateProfileRequest request) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String token = authHeader.substring(7);
        String email = jwtService.extractUsername(token);
        return ResponseEntity.ok(userService.updateProfile(email, request));
    }

    @PostMapping("/me/cv")
    public ResponseEntity<?> uploadCv(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam("file") MultipartFile file) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Token lipsa");
        }

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("Fisierul este gol.");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.equals("application/pdf")) {
            return ResponseEntity.badRequest().body("Doar fisierele PDF sunt acceptate.");
        }

        if (file.getSize() > 5 * 1024 * 1024) {
            return ResponseEntity.badRequest().body("Fisierul depaseste limita de 5MB.");
        }

        try {
            String token = authHeader.substring(7);
            String email = jwtService.extractUsername(token);
            String base64 = Base64.getEncoder().encodeToString(file.getBytes());
            userService.uploadCv(email, base64, file.getOriginalFilename());
            return ResponseEntity.ok(Map.of("message", "CV incarcat cu succes."));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Eroare la incarcarea CV-ului: " + e.getMessage());
        }
    }

    @PostMapping("/me/avatar")
    public ResponseEntity<?> uploadAvatar(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam("file") MultipartFile file) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Token lipsa");
        }
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("Fisierul este gol.");
        }
        String contentType = file.getContentType();
        if (contentType == null || (!contentType.equals("image/jpeg") && !contentType.equals("image/png"))) {
            return ResponseEntity.badRequest().body("Doar JPG si PNG sunt acceptate.");
        }
        if (file.getSize() > 2 * 1024 * 1024) {
            return ResponseEntity.badRequest().body("Imaginea depaseste limita de 2MB.");
        }
        try {
            String token = authHeader.substring(7);
            String email = jwtService.extractUsername(token);
            String base64 = Base64.getEncoder().encodeToString(file.getBytes());
            String dataUrl = "data:" + contentType + ";base64," + base64;
            userService.updateAvatar(email, dataUrl);
            return ResponseEntity.ok(Map.of("profilePictureUrl", dataUrl));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Eroare la incarcarea pozei: " + e.getMessage());
        }
    }

    @DeleteMapping("/me/cv")
    public ResponseEntity<?> deleteCv(@RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Token lipsa");
        }
        String token = authHeader.substring(7);
        String email = jwtService.extractUsername(token);
        userService.deleteCv(email);
        return ResponseEntity.ok(Map.of("message", "CV sters cu succes."));
    }

    @GetMapping("/{userId}/cv")
    public ResponseEntity<?> getCv(@PathVariable String userId) {
        try {
            String base64 = userService.getCvBase64(userId);
            String fileName = userService.getCvFileName(userId);
            return ResponseEntity.ok(Map.of(
                    "cvBase64", base64,
                    "fileName", fileName
            ));
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).body(e.getReason());
        }
    }

    @GetMapping("/public/{id}")
    public ResponseEntity<PublicUserProfileResponse> getPublicUserProfile(@PathVariable("id") String email) {
        return ResponseEntity.ok(userService.getPublicUserProfile(email));
    }
}
