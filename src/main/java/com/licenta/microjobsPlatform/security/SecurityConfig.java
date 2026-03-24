package com.licenta.microjobsPlatform.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.licenta.microjobsPlatform.service.CustomUserDetailsService;

import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    private final CustomUserDetailsService customUserDetailsService;//serviciul care stie gasi userul dupa email
    private final JwtAuthenticationFilter jwtAuthenticationFilter;


    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception{
        http
            .csrf(csrf-> csrf.disable())//Cross-Site Request Forgery - un site rau intentionat pacaleste browserul unui user deja autentificat sa trimita o cerere pe alt site in numele lui
            //trebuie dezactivat pentru teste, in special in Postman
            .authorizeHttpRequests(auth->
                                auth.requestMatchers("/api/users/register"
                                    ,"/api/users/login").permitAll().
                                    requestMatchers(HttpMethod.GET,"/api/jobs/**").permitAll()//register si login sunt publice
                                    .anyRequest().authenticated()
                                 )
                                .sessionManagement(session->
                                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                                //serverul nu tine minte sesiuni pentru useri
                                //doar verifica tokenul de fiecare data
                                ).authenticationProvider(authenticationProvider())
                                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);//specifici ce provider de autentificare trebuie folosit
            return http.build();//se termina configuratia si se transforma intr un obiect de tip
            //SecurityFilterChain gata de folosit
    }

    @Bean
    public AuthenticationProvider authenticationProvider(){
        DaoAuthenticationProvider provider= new DaoAuthenticationProvider(passwordEncoder());
        //implementare standard folosita cand useri is luati dintr o sursa de date
        //si parolele sunt verificate cu un encoder
        provider.setUserDetailsService(customUserDetailsService);
        //de unde se iau userii
        return provider;
        //return provider configurat
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception{
        //componenta apelata in login pentru a verifica email++parola
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder(){
        return new BCryptPasswordEncoder();
    }
}
    

