package com.licenta.microjobsPlatform.security;

import java.util.List;

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
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.licenta.microjobsPlatform.service.CustomUserDetailsService;

import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    private final CustomUserDetailsService customUserDetailsService;//serviciul care stie gasi userul dupa email
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;


    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception{
        http
            .csrf(csrf-> csrf.disable())//Cross-Site Request Forgery - un site rau intentionat pacaleste browserul unui user deja autentificat sa trimita o cerere pe alt site in numele lui
            //trebuie dezactivat pentru teste, in special in Postman
            .exceptionHandling(exception->exception.authenticationEntryPoint(jwtAuthenticationEntryPoint))
            .authorizeHttpRequests(auth->
                                auth.requestMatchers("/api/users/register","/api/users/login").permitAll().
                                    requestMatchers("/error").permitAll().
                                    requestMatchers(HttpMethod.GET,"/api/jobs").permitAll().
                                    requestMatchers(HttpMethod.GET,"/api/jobs/*").permitAll().
                                    requestMatchers(HttpMethod.GET,"/api/users/profile/**").permitAll().
                                    requestMatchers("/api/locations/**").permitAll().
                                    requestMatchers("/api/admin/**").hasRole("ADMIN")
                                    .anyRequest().authenticated()
                                 )
                                .sessionManagement(session->
                                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                                //serverul nu tine minte sesiuni pentru useri
                                //doar verifica tokenul de fiecare data
                                ).authenticationProvider(authenticationProvider())
                                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)//specifici ce provider de autentificare trebuie folosit
                                .cors(cors->{});//autroizare pentru frontend
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

    @Bean
    public CorsConfigurationSource corsConfigurationSource(){
        CorsConfiguration configuration=new CorsConfiguration();

        configuration.setAllowedOrigins(List.of("http://localhost:5173"));

        configuration.setAllowedMethods(List.of("GET","POST","PATCH","PUT","DELETE","OPTIONS"));

         // Header-ele permise
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type"));

        // Dacă vrei să permiți și trimiterea de credențiale/cookies
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}
    

