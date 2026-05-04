package com.licenta.microjobsPlatform.service;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.licenta.microjobsPlatform.dto.LoginRequest;
import com.licenta.microjobsPlatform.dto.LoginResponse;
import com.licenta.microjobsPlatform.dto.PublicUserProfileResponse;
import com.licenta.microjobsPlatform.dto.UpdateProfileRequest;
import com.licenta.microjobsPlatform.dto.UserResponse;
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
        if(user.getBio()==null) user.setBio("");
        if(user.getProfilePictureUrl()==null) user.setProfilePictureUrl("");
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

    public UserResponse getUserProfileById(String id){
        User user = userRepository.findById(id)
                .orElseThrow(()-> new ResponseStatusException(HttpStatus.NOT_FOUND,"Utilizator negasit"));
        
        UserResponse response= new UserResponse();
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

    public UserResponse updateProfile(String email,UpdateProfileRequest request){
        User user= userRepository.findByEmail(email)
                .orElseThrow(()-> new ResponseStatusException(HttpStatus.NOT_FOUND,"Utilizator negasit"));

        if(request.getFirstName()!=null){
                user.setFirstName(request.getFirstName());
        }

        if(request.getLastName()!=null){
                user.setLastName(request.getLastName());
        }

        if(request.getPhoneNumber()!=null){
                boolean phoneUsedAlready=userRepository.existsByPhoneNumber(request.getPhoneNumber())&&
                !request.getPhoneNumber().equals(user.getPhoneNumber());
                if(phoneUsedAlready){
                        throw new ResponseStatusException(HttpStatus.CONFLICT,"Exista deja un utilizator cu acest numar de telefon");
                }

        user.setPhoneNumber(request.getPhoneNumber());
        }
        if(request.getBio()!=null){
                user.setBio(request.getBio());
        }

        if(request.getProfilePictureUrl()!=null){
                user.setProfilePictureUrl(request.getProfilePictureUrl());
        }

        userRepository.save(user);

        UserResponse response=new UserResponse();
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
   
}
