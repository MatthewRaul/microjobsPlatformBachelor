package com.licenta.microjobsPlatform.service;

import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.licenta.microjobsPlatform.dto.LoginRequest;
import com.licenta.microjobsPlatform.dto.LoginResponse;
import com.licenta.microjobsPlatform.model.Role;
import com.licenta.microjobsPlatform.model.User;
import com.licenta.microjobsPlatform.repository.UserRepository;

/**
 * Aici verificam regulile care trebuie respectate inainte de a salva sau citi date.
 *
 * Pe scurt:
 * - controller-ul primeste cererea de la utilizator
 * - service-ul decide ce trebuie facut
 * - repository-ul comunica cu baza de date
 *
 * In acest service vom gestiona operatiile legate de utilizatori,
 * cum ar fi inregistrarea unui cont nou si cautarea unui utilizator dupa email.
 *
 * Exemplu simplu:
 * daca un utilizator incearca sa isi faca cont,
 * aici verificam daca emailul sau numarul de telefon exista deja,
 * iar abia dupa aceea salvam userul in baza de date.
 */


@Service
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository,PasswordEncoder passwordEncoder)
    {
        this.userRepository=userRepository;
        this.passwordEncoder=passwordEncoder;
    }

    public User registerUser(User user){
        if(userRepository.existsByEmail(user.getEmail())){
            throw new ResponseStatusException(HttpStatus.CONFLICT,"Exista deja un cont cu aceasta adresa de email");
        }
        if(userRepository.existsByPhoneNumber(user.getPhoneNumber())){
            throw new ResponseStatusException(HttpStatus.CONFLICT,"Exista deja un user cu acest numar de telefon");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRole(Role.USER);
        return userRepository.save(user);
    }
    public Optional<User> findByEmail(String email){
        return userRepository.findByEmail(email);
    }

    public LoginResponse loginUser(LoginRequest loginRequest){
        User user=userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(()-> new ResponseStatusException(HttpStatus.NOT_FOUND,"Email neinregistrat"));
        if(!passwordEncoder.matches(loginRequest.getPassword(),user.getPassword())){
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,"Parola incorecta.");
        }
        return new LoginResponse(
            user.getId(),
            user.getFirstName(),
            user.getLastName(),
            user.getEmail(),
            user.getRole()
        );
    }


}
