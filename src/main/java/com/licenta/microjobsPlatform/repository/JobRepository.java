package com.licenta.microjobsPlatform.repository;
import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import com.licenta.microjobsPlatform.model.Job;
import com.licenta.microjobsPlatform.model.JobStatus;

public interface JobRepository extends MongoRepository<Job,String> {

    @Query("{'status':{$in: ?0}}")
    List<Job> findByStatusIn(List<JobStatus> statuses);

    List<Job> findByPostedBy(String postedBy);
    
}
