package com.licenta.microjobsPlatform.repository;
import com.licenta.microjobsPlatform.model.Job;
import com.licenta.microjobsPlatform.model.JobStatus;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

import org.springframework.data.mongodb.repository.Query;

public interface JobRepository extends MongoRepository<Job,String> {

    @Query("{'status':{$in: ?0}}")
    List<Job> findByStatusIn(List<JobStatus> statuses);
    
}
