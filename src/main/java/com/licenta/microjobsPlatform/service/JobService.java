package com.licenta.microjobsPlatform.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.licenta.microjobsPlatform.dto.CreateJobRequest;
import com.licenta.microjobsPlatform.exception.BadRequest;
import com.licenta.microjobsPlatform.model.Job;
import com.licenta.microjobsPlatform.model.JobStatus;
import com.licenta.microjobsPlatform.repository.JobRepository;

@Service
public class JobService {
    private final JobRepository jobRepository;

    public JobService(JobRepository jobRepository) {
        this.jobRepository = jobRepository;
    }

    public Job createJob(CreateJobRequest request, String userEmail){
        Job job=new Job();
        job.setTitle(request.getTitle());
        job.setDescription(request.getDescription());
        job.setPostedBy(userEmail);
        job.setNeededWorkers(request.getNeededWorkers());
        job.setAcceptedWorkers(request.getAcceptedWorkers());
        job.setStartDate(request.getStartDate());
        job.setEndDate(request.getEndDate());
        job.setStatus(JobStatus.OPEN);
        job.setCreatedAt(LocalDateTime.now());
        
        if(request.getSalary()==null || request.getSalary()<0){
            throw new BadRequest("Salariul trebuie sa fie minim 0 RON");
        }
        job.setSalary(request.getSalary());
        return jobRepository.save(job);

    }

    public List<Job> getVisibleJobs(){
        return jobRepository.findByStatusIn(List.of(JobStatus.OPEN,JobStatus.FILLED));
    }

    public Job getJobById(String id){
        return jobRepository.findById(id)
            .orElseThrow(()->new RuntimeException("Job not found"));
    }

    public Job cancelJob(String id, String userEmail){
        Job job= jobRepository.findById(id)
            .orElseThrow(()->new RuntimeException("Job not found"));
        
        if(!job.getPostedBy().equals(userEmail)){
            throw new RuntimeException("You are not allowed to cancel this job");
        }
        job.setStatus(JobStatus.CANCELED);
        return jobRepository.save(job);
    }

    public Job completeJob(String id, String userEmail){
        Job job=jobRepository.findById(id)
            .orElseThrow(()->new RuntimeException("Job not found"));
        
        if(!job.getPostedBy().equals(userEmail)){
            throw new RuntimeException("You are not allowed to complete this job");
        }

        job.setStatus(JobStatus.COMPLETED);
        return jobRepository.save(job);
    }

}
