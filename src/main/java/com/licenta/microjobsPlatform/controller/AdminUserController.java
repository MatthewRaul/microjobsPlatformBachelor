package com.licenta.microjobsPlatform.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.licenta.microjobsPlatform.dto.UserResponse;
import com.licenta.microjobsPlatform.service.UserService;

@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {

    private final UserService userService;

    public AdminUserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<UserResponse>> getAllUsersForAdmin() {
        return ResponseEntity.ok(userService.getAllUsersForAdmin());
    }

    @PatchMapping("/{id}/role")
    public ResponseEntity<UserResponse> updateUserRoleAsAdmin(
            @PathVariable String id,
            @RequestBody Map<String, String> body) {

        String role = body.get("role");
        return ResponseEntity.ok(userService.updateUserRoleAsAdmin(id, role));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUserAsAdmin(@PathVariable String id) {
        userService.deleteUserAsAdmin(id);
        return ResponseEntity.noContent().build();
    }
}
