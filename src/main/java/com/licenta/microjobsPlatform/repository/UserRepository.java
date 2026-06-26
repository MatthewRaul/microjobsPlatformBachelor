package com.licenta.microjobsPlatform.repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.licenta.microjobsPlatform.model.User;

public interface UserRepository extends MongoRepository<User, String> {

    Optional<User> findByEmail(String email);

    Optional<User> findByPhoneNumber(String PhoneNumber);

    boolean existsByEmail(String Email);

    boolean existsByPhoneNumber(String phoneNumber);

}
