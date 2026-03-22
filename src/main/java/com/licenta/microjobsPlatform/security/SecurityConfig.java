package com.licenta.microjobsPlatform.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception{
        http
            .csrf(csrf-> csrf.disable())//Cross-Site Request Forgery - un site rau intentionat pacaleste browserul unui user deja autentificat sa trimita o cerere pe alt site in numele lui
            //trebuie dezactivat pentru teste, in special in Postman
            .authorizeHttpRequests(auth->
                                auth.requestMatchers("/api/users/register").permitAll()//register este public
                                .anyRequest().permitAll());//restul raman protejate
                            
                                
            
            return http.build();
    }
    @Bean
    public PasswordEncoder passwordEncoder(){
        return new BCryptPasswordEncoder();
    }
}
