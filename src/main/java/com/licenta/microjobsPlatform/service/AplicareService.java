package com.licenta.microjobsPlatform.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.licenta.microjobsPlatform.exception.BadRequest;
import com.licenta.microjobsPlatform.exception.ForbiddenAction;
import com.licenta.microjobsPlatform.exception.ResourceNotFound;
import com.licenta.microjobsPlatform.model.Aplicare;
import com.licenta.microjobsPlatform.model.AplicareStatus;
import com.licenta.microjobsPlatform.model.Job;
import com.licenta.microjobsPlatform.model.JobStatus;
import com.licenta.microjobsPlatform.model.User;
import com.licenta.microjobsPlatform.repository.AplicareRepository;
import com.licenta.microjobsPlatform.repository.JobRepository;
import com.licenta.microjobsPlatform.repository.UserRepository;

@Service
public class AplicareService {
    private final AplicareRepository aplicareRepository;
    private final JobRepository jobRepository;
    private final UserRepository userRepository;

    public AplicareService(AplicareRepository aplicareRepository, JobRepository jobRepository, UserRepository userRepository) {
        this.aplicareRepository = aplicareRepository;
        this.jobRepository = jobRepository;
        this.userRepository = userRepository;
    }

    private void updateJobStatusIfFull(Job job){
        long acceptedCount= aplicareRepository.countByJobIdAndStatus(job.getId(),AplicareStatus.ACCEPTED);
        if(acceptedCount>=job.getNeededWorkers()){
            job.setStatus(JobStatus.COMPLETED);
            jobRepository.save(job);
        }
    }

    public Aplicare applyToJob(String jobId){
        Authentication authentication=SecurityContextHolder.getContext().getAuthentication();
        String applicantEmail= authentication.getName();

        Job job=jobRepository.findById(jobId)
                    .orElseThrow(()->new ResourceNotFound("Job-ul nu exista"));

        if (job.getStatus() == JobStatus.CANCELED || job.getStatus() == JobStatus.COMPLETED) {
            throw new BadRequest("Nu se poate aplica la un job inchis.");
        }

        if (java.util.Objects.equals(job.getPostedBy(),applicantEmail)) {
            throw new BadRequest("Nu poti aplica la propriul job.");//daca una dintre valori este null
        }

        boolean alreadyApplied = aplicareRepository
                .findByJobIdAndApplicantEmail(jobId, applicantEmail)
                .isPresent();

        if (alreadyApplied) {
            throw new BadRequest("Ai aplicat deja la acest job.");
        }

        User user = userRepository.findByEmail(applicantEmail)
                .orElseThrow(() -> new ResourceNotFound("Utilizatorul nu exista."));

        Aplicare aplicare = new Aplicare();
        aplicare.setJobId(jobId);
        aplicare.setApplicantEmail(applicantEmail);
        aplicare.setApplicantFirstName(user.getFirstName());
        aplicare.setApplicantLastName(user.getLastName());
        aplicare.setStatus(AplicareStatus.PENDING);
        aplicare.setAppliedAt(LocalDateTime.now());

        return aplicareRepository.save(aplicare);
        
    }

    public List<Aplicare> getAplicariForJob(String jobId){
        Authentication authentication= SecurityContextHolder.getContext().getAuthentication();
        String currentUserEmail= authentication.getName();

        Job job=jobRepository.findById(jobId)
                .orElseThrow(()->new ResourceNotFound("Jobul nu exista"));

        if (!java.util.Objects.equals(job.getPostedBy(), currentUserEmail)) {
        throw new ForbiddenAction("Nu ai voie sa vezi aplicarile acestui job.");
        }

         return aplicareRepository.findByJobId(jobId);
    }

    public Aplicare acceptAplicare(String aplicareId){
        
        Authentication authentication= SecurityContextHolder.getContext().getAuthentication();
        String currentUserEmail=authentication.getName();
        

        Aplicare aplicare= aplicareRepository.findById(aplicareId)
            .orElseThrow(()->new ResourceNotFound("Aplicarea nu exista"));
    
        Job job=jobRepository.findById(aplicare.getJobId())
            .orElseThrow(()-> new ResourceNotFound("Job-ul asociat nu exista"));
    

        if(!java.util.Objects.equals(job.getPostedBy(),currentUserEmail)){
            throw new ForbiddenAction("Nu ai voie sa accepti aplicarile acestui job.");
        }

        if(aplicare.getStatus()!=AplicareStatus.PENDING){
            throw new BadRequest("Doar aplicarile PENDING pot fi acceptate");
        }

        aplicare.setStatus(AplicareStatus.ACCEPTED);
        Aplicare savedAplicare=aplicareRepository.save(aplicare);

        updateJobStatusIfFull(job);
        return savedAplicare;
    }

    public Aplicare rejectAplicare(String aplicareId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserEmail = authentication.getName();

        Aplicare aplicare = aplicareRepository.findById(aplicareId)
                .orElseThrow(() -> new ResourceNotFound("Aplicarea nu exista."));

        Job job = jobRepository.findById(aplicare.getJobId())
                .orElseThrow(() -> new ResourceNotFound("Jobul asociat nu exista."));

        if (!java.util.Objects.equals(job.getPostedBy(), currentUserEmail)) {
            throw new ForbiddenAction("Nu ai voie sa respingi aplicarile acestui job.");
        }

        if (aplicare.getStatus() != AplicareStatus.PENDING) {
            throw new BadRequest("Doar aplicarile PENDING pot fi respinse.");
        }

        aplicare.setStatus(AplicareStatus.REJECTED);
        return aplicareRepository.save(aplicare);
    }

    public List<Aplicare> getMyAplicari(){
        Authentication authentication=SecurityContextHolder.getContext().getAuthentication();
        String email= authentication.getName();
        return aplicareRepository.findByApplicantEmail(email);
    }
    
    
}
