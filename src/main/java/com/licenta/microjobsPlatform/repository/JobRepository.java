package com.licenta.microjobsPlatform.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import com.licenta.microjobsPlatform.model.Job;
import com.licenta.microjobsPlatform.model.JobStatus;

public interface JobRepository extends MongoRepository<Job, String> {

    @Query("{'status':{$in: ?0}}")
    List<Job> findByStatusIn(List<JobStatus> statuses);

    List<Job> findByPostedBy(String postedBy);

    // Returneaza joburile vizibile care incep de la aceasta data incolo.
    List<Job> findByStatusInAndStartDateGreaterThanEqual(
            List<JobStatus> statuses,
            LocalDateTime startDate
    );

// Returneaza joburile vizibile care se termina pana la aceasta data.
    List<Job> findByStatusInAndEndDateLessThanEqual(
            List<JobStatus> statuses,
            LocalDateTime endDate
    );

// Returneaza joburile vizibile dintr-o anumita locatie.
    List<Job> findByStatusInAndLocationIgnoreCase(
            List<JobStatus> statuses,
            String location
    );

// Returneaza joburile vizibile care se incadreaza in intervalul dat.
    List<Job> findByStatusInAndStartDateGreaterThanEqualAndEndDateLessThanEqual(
            List<JobStatus> statuses,
            LocalDateTime startDate,
            LocalDateTime endDate
    );

// Returneaza joburile vizibile care incep de la data ceruta
// si sunt din locatia ceruta.
    List<Job> findByStatusInAndStartDateGreaterThanEqualAndLocationIgnoreCase(
            List<JobStatus> statuses,
            LocalDateTime startDate,
            String location
    );

// Returneaza joburile vizibile care se termina pana la data ceruta
// si sunt din locatia ceruta.
    List<Job> findByStatusInAndEndDateLessThanEqualAndLocationIgnoreCase(
            List<JobStatus> statuses,
            LocalDateTime endDate,
            String location
    );

// Returneaza joburile vizibile care respecta toate cele 3 filtre.
    List<Job> findByStatusInAndStartDateGreaterThanEqualAndEndDateLessThanEqualAndLocationIgnoreCase(
            List<JobStatus> statuses,
            LocalDateTime startDate,
            LocalDateTime endDate,
            String location
    );

    // Returneaza joburile vizibile care cer cel putin numarul dat de participanti.
    List<Job> findByStatusInAndNeededWorkersGreaterThanEqual(
            List<JobStatus> statuses,
            Integer neededWorkers
    );

}
