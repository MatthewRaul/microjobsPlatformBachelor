package com.licenta.microjobsPlatform.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.licenta.microjobsPlatform.model.Aplicare;
import com.licenta.microjobsPlatform.model.AplicareStatus;

public interface AplicareRepository extends MongoRepository<Aplicare, String> {
    List<Aplicare> findByJobId(String jobId);
    List<Aplicare> findByApplicantEmail(String ApplicantEmail);
    Optional<Aplicare> findByJobIdAndApplicantEmail(String jobId,String applicantEmail);
    long countByJobIdAndStatus(String jobId, AplicareStatus status);
    

    
}
