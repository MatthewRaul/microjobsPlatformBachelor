package com.licenta.microjobsPlatform.repository;
import com.licenta.microjobsPlatform.model.Job;
import com.licenta.microjobsPlatform.model.JobStatus;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface JobRepository extends MongoRepository<Job,String> {
    List<Job> findByStatusIn(List<JobStatus> statuses);
    
}
