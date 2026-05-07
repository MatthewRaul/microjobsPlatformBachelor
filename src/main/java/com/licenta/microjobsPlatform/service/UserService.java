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

    public UserService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    // Verifica daca utilizatorul curent are rol de admin.
    private boolean isAdmin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || authentication.getAuthorities() == null) {
            return false;
        }

        return authentication.getAuthorities().stream()
                .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()));
    }

    public User registerUser(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Exista deja un cont cu aceasta adresa de email");
        }

        if (userRepository.existsByPhoneNumber(user.getPhoneNumber())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Exista deja un utilizator cu acest numar de telefon");
        }

        user.setCreatedAt(LocalDateTime.now());
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRole(Role.USER);

        if (user.getBio() == null) {
            user.setBio("");
        }

        if (user.getProfilePictureUrl() == null) {
            user.setProfilePictureUrl("");
        }

        return userRepository.save(user);
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

        return new LoginResponse(
                token,
                user.getFirstName(),
                user.getEmail(),
                user.getRole()
        );
    }

    public UserResponse getUserProfileById(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilizator negasit"));

        return mapToUserResponse(user);
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
            boolean phoneUsedAlready = userRepository.existsByPhoneNumber(request.getPhoneNumber()) &&
                    !request.getPhoneNumber().equals(user.getPhoneNumber());

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

        userRepository.save(user);

        return mapToUserResponse(user);
    }

    public PublicUserProfileResponse getPublicUserProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFound("Utilizatorul nu exista."));

        return new PublicUserProfileResponse(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getBio(),
                user.getProfilePictureUrl(),
                user.getPhoneNumber(),
                user.getEmail()
        );
    }

    // =========================
    // Zona admin
    // =========================

    // Returneaza toti userii din sistem.
    public List<UserResponse> getAllUsersForAdmin() {
        if (!isAdmin()) {
            throw new ForbiddenAction("Doar adminul poate vedea toti utilizatorii.");
        }

        return userRepository.findAll()
                .stream()
                .map(this::mapToUserResponse)
                .toList();
    }

    // Cautare simpla pentru admin dupa nume, email, telefon sau rol.
    public List<UserResponse> searchUsersForAdmin(String search) {
        if (!isAdmin()) {
            throw new ForbiddenAction("Doar adminul poate cauta utilizatori.");
        }

        List<User> users = userRepository.findAll();

        if (search == null || search.trim().isBlank()) {
            return users.stream().map(this::mapToUserResponse).toList();
        }

        String normalizedSearch = search.trim().toLowerCase();

        return users.stream()
                .filter(user ->
                        containsIgnoreCase(user.getFirstName(), normalizedSearch) ||
                        containsIgnoreCase(user.getLastName(), normalizedSearch) ||
                        containsIgnoreCase(user.getEmail(), normalizedSearch) ||
                        containsIgnoreCase(user.getPhoneNumber(), normalizedSearch) ||
                        containsIgnoreCase(user.getRole() != null ? user.getRole().name() : null, normalizedSearch))
                .map(this::mapToUserResponse)
                .toList();
    }

    // Returneaza un user dupa id pentru admin.
    public UserResponse getUserByIdForAdmin(String id) {
        if (!isAdmin()) {
            throw new ForbiddenAction("Doar adminul poate vedea acest utilizator.");
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFound("Utilizatorul nu exista."));

        return mapToUserResponse(user);
    }

    // Schimba rolul unui utilizator.
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

    // Sterge un utilizator din sistem.
    public void deleteUserAsAdmin(String id) {
        if (!isAdmin()) {
            throw new ForbiddenAction("Doar adminul poate sterge utilizatori.");
        }

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentEmail = authentication.getName();

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFound("Utilizatorul nu exista."));

        // Prevenim situatia in care adminul se sterge singur din greseala.
        if (user.getEmail().equals(currentEmail)) {
            throw new BadRequest("Nu te poti sterge singur din contul de admin.");
        }

        userRepository.delete(user);
    }

    // Helper pentru transformarea User -> UserResponse.
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
        return response;
    }

    // Helper pentru cautare text fara probleme de null.
    private boolean containsIgnoreCase(String value, String search) {
        return value != null && value.toLowerCase().contains(search);
    }
}