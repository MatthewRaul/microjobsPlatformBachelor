package com.licenta.microjobsPlatform.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.licenta.microjobsPlatform.dto.CreateJobRequest;
import com.licenta.microjobsPlatform.dto.UpdateJobRequest;
import com.licenta.microjobsPlatform.model.Aplicare;
import com.licenta.microjobsPlatform.model.Job;
import com.licenta.microjobsPlatform.service.AplicareService;
import com.licenta.microjobsPlatform.service.JobService;


@RestController
@RequestMapping("/api/jobs")
public class JobController {
    private final AplicareService aplicareService;
    private final JobService jobService;
    public JobController(JobService jobService, AplicareService aplicareService){
        this.jobService=jobService;
        this.aplicareService = aplicareService;
    }

    @PostMapping
    public ResponseEntity<Job> createJob(@RequestBody CreateJobRequest request,Authentication authentication){
        String userEmail= authentication.getName();
        Job createdJob= jobService.createJob(request, userEmail);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdJob);
    }

    @GetMapping
    public ResponseEntity<List<Job>> getVisibleJobs(){
        return ResponseEntity.ok(jobService.getVisibleJobs());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Job> getJobById(@PathVariable String id){
        return ResponseEntity.ok(jobService.getJobById(id));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<Job> cancelJob(@PathVariable String id,Authentication authentication){
        String userEmail=authentication.getName();
        Job canceledJob=jobService.cancelJob(id, userEmail);
        return ResponseEntity.ok(canceledJob);
    }

     @PatchMapping("/{id}/complete")
    public ResponseEntity<Job> completeJob(@PathVariable String id,
                                           Authentication authentication) {
        String userEmail = authentication.getName();
        Job completedJob = jobService.completeJob(id, userEmail);
        return ResponseEntity.ok(completedJob);
    }

    @PostMapping("/{jobId}/apply")
    public ResponseEntity<Aplicare> applyToJob(@PathVariable String jobId){
        return ResponseEntity.status(HttpStatus.CREATED).body(aplicareService.applyToJob(jobId));
    }

    @GetMapping("/{jobId}/aplicari")
    public ResponseEntity<List<Aplicare>> getAplicariForJob(@PathVariable String jobId){
        return ResponseEntity.ok(aplicareService.getAplicariForJob(jobId));
    }

    @GetMapping("/me")
    public ResponseEntity<List<Job>> getMyJobs(Authentication authentication){
        String email=authentication.getName();
        return ResponseEntity.ok(jobService.getMyJobs(email));
    }
    
    @PatchMapping("/{id}")
    public ResponseEntity<Job> updateJob(
        @PathVariable String id,
        @RequestBody UpdateJobRequest request,
        Authentication authentication) {
    String userEmail = authentication.getName();
    Job updatedJob = jobService.updateJob(id, request, userEmail);
    return ResponseEntity.ok(updatedJob);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteJob(@PathVariable String id, Authentication authentication) {
    String userEmail = authentication.getName();
    jobService.deleteJob(id, userEmail);
    return ResponseEntity.noContent().build();
    }
    
}
