package com.licenta.microjobsPlatform.repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.licenta.microjobsPlatform.model.User;

/**
 * REPOSITORY VA FI FOLOSIT PENTRU A GESTIONA DATE DIN MONGO, FARA A SCRIE COD SPECIFIC MONGO.
 * Am folosit atributele phoneNumber si email pt ca acestea garanteaza unicitatea unui utilizator.
 * Verificam daca exista sau nu userul in baza de date.
 */
public interface UserRepository extends MongoRepository<User,String> {
    Optional<User> findByEmail(String email);
    Optional<User> findByPhoneNumber(String PhoneNumber);
    boolean existsByEmail(String Email);
    boolean existsByPhoneNumber(String phoneNumber);
    
}
