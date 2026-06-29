package com.licenta.microjobsPlatform.repository;

import java.time.Instant;
import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import com.licenta.microjobsPlatform.model.Job;
import com.licenta.microjobsPlatform.model.JobStatus;

public interface JobRepository extends MongoRepository<Job, String> {

    @Query("{'status':{$in: ?0}}")
    List<Job> findByStatusIn(List<JobStatus> statuses);

    List<Job> findByPostedBy(String postedBy);
 
    List<Job> findByStatusInAndStartDateGreaterThanEqual(
            List<JobStatus> statuses,
            Instant startDate
    );

    List<Job> findByStatusInAndEndDateLessThanEqual(
            List<JobStatus> statuses,
            Instant endDate
    );

    List<Job> findByStatusInAndLocationIgnoreCase(
            List<JobStatus> statuses,
            String location
    );

    List<Job> findByStatusInAndStartDateGreaterThanEqualAndEndDateLessThanEqual(
            List<JobStatus> statuses,
            Instant startDate,
            Instant endDate
    );

    List<Job> findByStatusInAndStartDateGreaterThanEqualAndLocationIgnoreCase(
            List<JobStatus> statuses,
            Instant startDate,
            String location
    );

    List<Job> findByStatusInAndEndDateLessThanEqualAndLocationIgnoreCase(
            List<JobStatus> statuses,
            Instant endDate,
            String location
    );

    List<Job> findByStatusInAndStartDateGreaterThanEqualAndEndDateLessThanEqualAndLocationIgnoreCase(
            List<JobStatus> statuses,
            Instant startDate,
            Instant endDate,
            String location
    );

    List<Job> findByStatusInAndNeededWorkersGreaterThanEqual(
            List<JobStatus> statuses,
            Integer neededWorkers
    );

}
