package com.licenta.microjobsPlatform.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.licenta.microjobsPlatform.dto.LoginRequest;
import com.licenta.microjobsPlatform.dto.LoginResponse;
import com.licenta.microjobsPlatform.dto.PublicUserProfileResponse;
import com.licenta.microjobsPlatform.dto.UpdateProfileRequest;
import com.licenta.microjobsPlatform.dto.UserResponse;
import com.licenta.microjobsPlatform.exception.BadRequest;
import com.licenta.microjobsPlatform.exception.ForbiddenAction;
import com.licenta.microjobsPlatform.exception.ResourceNotFound;
import com.licenta.microjobsPlatform.model.Role;
import com.licenta.microjobsPlatform.model.User;
import com.licenta.microjobsPlatform.repository.UserRepository;
import com.licenta.microjobsPlatform.security.JwtService;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final EmailService emailService;

    public UserService(UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtService jwtService,
            EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.emailService = emailService;
    }

    private boolean isAuthenticated() {
        Authentication a = SecurityContextHolder.getContext().getAuthentication();
        return a != null && a.isAuthenticated()
                && !(a instanceof org.springframework.security.authentication.AnonymousAuthenticationToken);
    }

    private boolean isAdmin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getAuthorities() == null) {
            return false;
        }
        return authentication.getAuthorities().stream()
                .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()));
    }

    public UserResponse registerUser(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Exista deja un cont cu aceasta adresa de email");
        }

        if (userRepository.existsByPhoneNumber(user.getPhoneNumber())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Exista deja un utilizator cu acest numar de telefon");
        }

        if (user.getAge() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Varsta este obligatorie.");
        }

        if (user.getAge() < 16 || user.getAge() > 100) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Varsta trebuie sa fie intre 16 si 100 de ani.");
        }

        user.setCreatedAt(LocalDateTime.now());
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRole(Role.USER);

        user.setAverageRating(0.0);
        user.setReviewCount(0);
        user.setCvBase64(null);
        user.setCvFileName(null);

        if (user.getBio() == null) {
            user.setBio("");
        }
        if (user.getProfilePictureUrl() == null) {
            user.setProfilePictureUrl("");
        }
        user.setProfileCompleted(false);
        user.setHasCv(false);

        emailService.sendWelcomeEmail(user.getEmail(), user.getFirstName());
        User saved = userRepository.save(user);
        return mapToUserResponse(saved);
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public LoginResponse loginUser(LoginRequest loginRequest) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail(),
                        loginRequest.getPassword()
                )
        );

        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Email neinregistrat"));

        String token = jwtService.generateToken(
                new org.springframework.security.core.userdetails.User(
                        user.getEmail(),
                        user.getPassword(),
                        java.util.List.of(
                                new org.springframework.security.core.authority.SimpleGrantedAuthority(
                                        "ROLE_" + user.getRole().name()
                                )
                        )
                )
        );

        return new LoginResponse(token, user.getFirstName(), user.getEmail(), user.getRole());
    }

    public UserResponse updateProfile(String email, UpdateProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilizator negasit"));

        if (request.getFirstName() != null) {
            user.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            user.setLastName(request.getLastName());
        }

        if (request.getPhoneNumber() != null) {
            boolean phoneUsedAlready = userRepository.existsByPhoneNumber(request.getPhoneNumber())
                    && !request.getPhoneNumber().equals(user.getPhoneNumber());
            if (phoneUsedAlready) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Exista deja un utilizator cu acest numar de telefon");
            }
            user.setPhoneNumber(request.getPhoneNumber());
        }

        if (request.getBio() != null) {
            user.setBio(request.getBio());
        }
        if (request.getProfilePictureUrl() != null) {
            user.setProfilePictureUrl(request.getProfilePictureUrl());
        }
        if (request.getSkills() != null) {
            user.setSkills(request.getSkills());
        }

        if (request.getAge() != null) {
            if (request.getAge() < 16 || request.getAge() > 100) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Varsta trebuie sa fie intre 16 si 100 de ani.");
            }
            user.setAge(request.getAge());
        }

        userRepository.save(user);
        return mapToUserResponse(user);
    }

    public PublicUserProfileResponse getPublicUserProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFound("Utilizatorul nu exista."));

        boolean autentificat = isAuthenticated();

        return new PublicUserProfileResponse(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getBio(),
                user.getProfilePictureUrl(),
                autentificat ? user.getPhoneNumber() : null,
                autentificat ? user.getEmail() : null,
                user.getSkills(),
                user.getHasCv()
        );
    }

    public void uploadCv(String email, String base64, String fileName) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilizator negasit"));
        user.setCvBase64(base64);
        user.setCvFileName(fileName);
        user.setHasCv(true);
        userRepository.save(user);
    }

    public void deleteCv(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilizator negasit"));
        user.setCvBase64(null);
        user.setCvFileName(null);
        user.setHasCv(false);
        userRepository.save(user);
    }

    public String getCvBase64(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilizator negasit"));
        if (user.getCvBase64() == null || user.getCvBase64().isBlank()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Acest utilizator nu are un CV incarcat.");
        }
        return user.getCvBase64();
    }

    public String getCvFileName(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilizator negasit"));
        return user.getCvFileName() != null ? user.getCvFileName() : "cv.pdf";
    }

    public void updateAvatar(String email, String dataUrl) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilizator negasit"));
        user.setProfilePictureUrl(dataUrl);
        userRepository.save(user);
    }

    public List<UserResponse> getAllUsersForAdmin() {
        if (!isAdmin()) {
            throw new ForbiddenAction("Doar adminul poate vedea toti utilizatorii.");
        }
        return userRepository.findAll().stream().map(this::mapToUserResponse).toList();
    }

    public UserResponse getUserByIdForAdmin(String id) {
        if (!isAdmin()) {
            throw new ForbiddenAction("Doar adminul poate vedea acest utilizator.");
        }
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFound("Utilizatorul nu exista."));
        return mapToUserResponse(user);
    }

    public UserResponse updateUserRoleAsAdmin(String id, String role) {
        if (!isAdmin()) {
            throw new ForbiddenAction("Doar adminul poate modifica rolul utilizatorilor.");
        }
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFound("Utilizatorul nu exista."));
        if (role == null || role.isBlank()) {
            throw new BadRequest("Rolul este obligatoriu.");
        }
        String normalizedRole = role.trim().toUpperCase();
        try {
            user.setRole(Role.valueOf(normalizedRole));
        } catch (IllegalArgumentException e) {
            throw new BadRequest("Rol invalid. Valorile permise sunt USER sau ADMIN.");
        }
        userRepository.save(user);
        return mapToUserResponse(user);
    }

    public void deleteUserAsAdmin(String id) {
        if (!isAdmin()) {
            throw new ForbiddenAction("Doar adminul poate sterge utilizatori.");
        }
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentEmail = authentication.getName();
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFound("Utilizatorul nu exista."));
        if (user.getEmail().equals(currentEmail)) {
            throw new BadRequest("Nu te poti sterge singur din contul de admin.");
        }
        userRepository.delete(user);
    }

    private UserResponse mapToUserResponse(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setFirstName(user.getFirstName());
        response.setLastName(user.getLastName());
        response.setEmail(user.getEmail());
        response.setBio(user.getBio());
        response.setProfilePictureUrl(user.getProfilePictureUrl());
        response.setCreatedAt(user.getCreatedAt());
        response.setPhoneNumber(user.getPhoneNumber());
        response.setRole(user.getRole().name());
        response.setAge(user.getAge());
        return response;
    }

}
