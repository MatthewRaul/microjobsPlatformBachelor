package com.licenta.microjobsPlatform.service;

import com.licenta.microjobsPlatform.model.User;
import com.licenta.microjobsPlatform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Utilizator negasit cu emailul : " + email));
                //se cauta userul in Mongo dupa email, in cazul in care nu se gaseste se arunca exceptia
            

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))//se transforma rolul in ceva inteles de Spring Security ROLE_USER/ROLE_ADMIN
                //important ca mai tz sa se poata scrie reguli ge genul 
                // .requestMatchers("/admin/**").hasRole("ADMIN")
 
        );//se returneaza userul cu emailul,parola hashuita si rolul aferente
    }
}
