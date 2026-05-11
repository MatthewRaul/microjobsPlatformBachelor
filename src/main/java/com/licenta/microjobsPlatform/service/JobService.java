package com.licenta.microjobsPlatform.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.licenta.microjobsPlatform.dto.CreateJobRequest;
import com.licenta.microjobsPlatform.dto.UpdateJobRequest;
import com.licenta.microjobsPlatform.exception.BadRequest;
import com.licenta.microjobsPlatform.exception.ResourceNotFound;
import com.licenta.microjobsPlatform.model.Job;
import com.licenta.microjobsPlatform.model.JobStatus;
import com.licenta.microjobsPlatform.model.User;
import com.licenta.microjobsPlatform.repository.JobRepository;
import com.licenta.microjobsPlatform.repository.UserRepository;

@Service
public class JobService {

    private final JobRepository jobRepository;
    private final UserRepository userRepository;

    public JobService(JobRepository jobRepository, UserRepository userRepository) {
        this.jobRepository = jobRepository;
        this.userRepository = userRepository;
    }

    private boolean isAdmin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || authentication.getAuthorities() == null) {
            return false;
        }

        return authentication.getAuthorities().stream()
                .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()));
    }

    public String getOwnerIdForJob(String jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFound("Jobul nu exista"));

        String ownerEmail = job.getPostedBy();

        if (ownerEmail == null || ownerEmail.isBlank()) {
            throw new ResourceNotFound("Jobul nu are owner valid.");
        }

        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new ResourceNotFound("Ownerul jobului nu exista."));

        return owner.getId();
    }

    public Job createJob(CreateJobRequest request, String userEmail) {
        if (request.getSalary() == null || request.getSalary() < 0) {
            throw new BadRequest("Salariul trebuie sa fie minim 0 RON");
        }

        if (request.getNeededWorkers() == null || request.getNeededWorkers() <= 0) {
            throw new BadRequest("Numarul de locuri trebuie sa fie mai mare decat 0.");
        }

        if (request.getLocation() == null || request.getLocation().isBlank()) {
            throw new BadRequest("Locatia este obligatorie.");
        }

        Job job = new Job();
        job.setTitle(request.getTitle());
        job.setDescription(request.getDescription());
        job.setPostedBy(userEmail);
        job.setNeededWorkers(request.getNeededWorkers());
        job.setAcceptedWorkers(0);
        job.setStartDate(request.getStartDate());
        job.setEndDate(request.getEndDate());
        job.setStatus(JobStatus.OPEN);
        job.setCreatedAt(LocalDateTime.now());
        job.setSalary(request.getSalary());
        job.setLocation(request.getLocation());
        job.setCounty(request.getCounty());

        refreshStatusByTime(job);

        return jobRepository.save(job);
    }

    public List<Job> getVisibleJobs() {
        List<Job> jobs = jobRepository.findAll();

        for (Job job : jobs) {
            if (job.getAcceptedWorkers() == null) {
                job.setAcceptedWorkers(0);
            }

            JobStatus oldStatus = job.getStatus();
            refreshStatusByTime(job);

            if (oldStatus != job.getStatus()) {
                jobRepository.save(job);
            }
        }

        return jobs.stream()
                .filter(job -> job.getStatus() != JobStatus.COMPLETED)
                .filter(job -> job.getStatus() != JobStatus.CANCELED)
                .toList();
    }

    public Job getJobById(String id) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        if (job.getAcceptedWorkers() == null) {
            job.setAcceptedWorkers(0);
        }

        JobStatus oldStatus = job.getStatus();
        refreshStatusByTime(job);

        if (oldStatus != job.getStatus()) {
            jobRepository.save(job);
        }

        return job;
    }

    public Job cancelJob(String id, String userEmail) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        boolean isOwner = job.getPostedBy().equals(userEmail);

        if (!isOwner && !isAdmin()) {
            throw new RuntimeException("You are not allowed to cancel this job");
        }

        job.setStatus(JobStatus.CANCELED);
        return jobRepository.save(job);
    }

    public Job completeJob(String id, String userEmail) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        boolean isOwner = job.getPostedBy().equals(userEmail);

        if (!isOwner && !isAdmin()) {
            throw new RuntimeException("You are not allowed to complete this job");
        }

        job.setStatus(JobStatus.COMPLETED);
        return jobRepository.save(job);
    }

    public List<Job> getMyJobs(String userEmail) {
        List<Job> jobs = jobRepository.findByPostedBy(userEmail);

        for (Job job : jobs) {
            if (job.getAcceptedWorkers() == null) {
                job.setAcceptedWorkers(0);
            }

            JobStatus oldStatus = job.getStatus();
            refreshStatusByTime(job);

            if (oldStatus != job.getStatus()) {
                jobRepository.save(job);
            }
        }

        return jobs;
    }

    public Job updateJob(String id, UpdateJobRequest request, String userEmail) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        boolean isOwner = job.getPostedBy().equals(userEmail);

        if (!isOwner && !isAdmin()) {
            throw new RuntimeException("You are not allowed to edit this job");
        }

        if (job.getStatus() == JobStatus.CANCELED || job.getStatus() == JobStatus.COMPLETED) {
            throw new BadRequest("Nu poti edita un job inchis.");
        }

        if (job.getAcceptedWorkers() == null) {
            job.setAcceptedWorkers(0);
        }

        String title = request.getTitle() != null ? request.getTitle().trim() : "";
        String description = request.getDescription() != null ? request.getDescription().trim() : "";
        String location = request.getLocation() != null ? request.getLocation().trim() : "";
        String county = request.getCounty() != null ? request.getCounty().trim() : "";
        Integer neededWorkers = request.getNeededWorkers();
        Integer salary = request.getSalary();
        LocalDateTime startDate = request.getStartDate();
        LocalDateTime endDate = request.getEndDate();

        if (title.isBlank()) {
            throw new BadRequest("Titlul este obligatoriu.");
        }

        if (description.isBlank()) {
            throw new BadRequest("Descrierea este obligatorie.");
        }

        if (location.isBlank()) {
            throw new BadRequest("Locatia este obligatorie.");
        }

        if (salary == null || salary < 0) {
            throw new BadRequest("Salariul trebuie sa fie minim 0 RON");
        }

        if (neededWorkers == null || neededWorkers <= 0) {
            throw new BadRequest("Numarul de locuri trebuie sa fie mai mare decat 0.");
        }

        if (neededWorkers < job.getAcceptedWorkers()) {
            throw new BadRequest("Numarul de locuri nu poate fi mai mic decat numarul de aplicanti acceptati.");
        }

        if (startDate == null) {
            throw new BadRequest("Data de inceput este obligatorie.");
        }

        if (endDate == null) {
            throw new BadRequest("Data de sfarsit este obligatorie.");
        }

        if (endDate.isBefore(startDate)) {
            throw new BadRequest("Data de sfarsit trebuie sa fie dupa data de inceput.");
        }

        job.setTitle(title);
        job.setDescription(description);
        job.setNeededWorkers(neededWorkers);
        job.setStartDate(startDate);
        job.setEndDate(endDate);
        job.setSalary(salary);
        job.setLocation(location);
        job.setCounty(county);

        refreshStatusByTime(job);

        return jobRepository.save(job);
    }

    public void deleteJob(String id, String userEmail) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        boolean isOwner = job.getPostedBy().equals(userEmail);

        if (!isOwner && !isAdmin()) {
            throw new RuntimeException("You are not allowed to delete this job");
        }

        jobRepository.delete(job);
    }

    private Job refreshStatusByTime(Job job) {
        LocalDateTime now = LocalDateTime.now();

        if (job.getAcceptedWorkers() == null) {
            job.setAcceptedWorkers(0);
        }

        if (job.getStatus() == JobStatus.CANCELED || job.getStatus() == JobStatus.COMPLETED) {
            return job;
        }

        if (job.getEndDate() != null && !now.isBefore(job.getEndDate())) {
            job.setStatus(JobStatus.COMPLETED);
        } else if (job.getStartDate() != null && !now.isBefore(job.getStartDate())) {
            job.setStatus(JobStatus.IN_PROGRESS);
        } else if (job.getAcceptedWorkers() != null && job.getNeededWorkers() != null
                && job.getAcceptedWorkers() >= job.getNeededWorkers()) {
            job.setStatus(JobStatus.FILLED);
        } else {
            job.setStatus(JobStatus.OPEN);
        }

        return job;
    }

    public List<Job> getVisibleJobsFiltered(
            LocalDateTime startDate,
            LocalDateTime endDate,
            String location,
            Integer participants,
            JobStatus status
    ) {
        String normalizedLocation = location != null ? location.trim() : null;
        boolean hasStartDate = startDate != null;
        boolean hasEndDate = endDate != null;
        boolean hasLocation = normalizedLocation != null && !normalizedLocation.isBlank();
        boolean hasParticipants = participants != null;
        boolean hasStatus = status != null;

        if (hasStartDate && hasEndDate && endDate.isBefore(startDate)) {
            throw new BadRequest("Data de sfarsit trebuie sa fie dupa sau egala cu data de inceput.");
        }

        if (hasParticipants && participants < 1) {
            throw new BadRequest("Numarul de participanti trebuie sa fie cel putin 1.");
        }

        List<Job> jobs = jobRepository.findAll();

        for (Job job : jobs) {
            if (job.getAcceptedWorkers() == null) {
                job.setAcceptedWorkers(0);
            }

            JobStatus oldStatus = job.getStatus();
            refreshStatusByTime(job);

            if (oldStatus != job.getStatus()) {
                jobRepository.save(job);
            }
        }

        return jobs.stream()
                .filter(job -> {
                    if (hasStartDate && (job.getStartDate() == null || job.getStartDate().isBefore(startDate))) {
                        return false;
                    }

                    if (hasEndDate && (job.getEndDate() == null || job.getEndDate().isAfter(endDate))) {
                        return false;
                    }

                    if (hasLocation && (job.getLocation() == null || !job.getLocation().equalsIgnoreCase(normalizedLocation))) {
                        return false;
                    }

                    if (hasParticipants && (job.getNeededWorkers() == null || job.getNeededWorkers() < participants)) {
                        return false;
                    }

                    if (hasStatus && job.getStatus() != status) {
                        return false;
                    }

                    return true;
                })
                .toList();
    }

    public List<Job> getAllJobsForAdmin() {
        List<Job> jobs = jobRepository.findAll();

        for (Job job : jobs) {
            if (job.getAcceptedWorkers() == null) {
                job.setAcceptedWorkers(0);
            }

            JobStatus oldStatus = job.getStatus();
            refreshStatusByTime(job);

            if (oldStatus != job.getStatus()) {
                jobRepository.save(job);
            }
        }

        return jobs;
    }

    public List<Job> searchJobsForAdmin(String search) {
        List<Job> jobs = getAllJobsForAdmin();

        if (search == null || search.trim().isBlank()) {
            return jobs;
        }

        String normalizedSearch = search.trim().toLowerCase();

        return jobs.stream()
                .filter(job ->
                        containsIgnoreCase(job.getTitle(), normalizedSearch)
                                || containsIgnoreCase(job.getLocation(), normalizedSearch)
                                || containsIgnoreCase(job.getCounty(), normalizedSearch)
                                || containsIgnoreCase(job.getPostedBy(), normalizedSearch))
                .toList();
    }

    public Job getJobByIdForAdmin(String id) {
        return getJobById(id);
    }

    public Job updateJobAsAdmin(String id, UpdateJobRequest request, String adminEmail) {
        return updateJob(id, request, adminEmail);
    }

    public void deleteJobAsAdmin(String id, String adminEmail) {
        deleteJob(id, adminEmail);
    }

    public Job cancelJobAsAdmin(String id, String adminEmail) {
        return cancelJob(id, adminEmail);
    }

    public Job completeJobAsAdmin(String id, String adminEmail) {
        return completeJob(id, adminEmail);
    }

    private boolean containsIgnoreCase(String value, String search) {
        return value != null && value.toLowerCase().contains(search);
    }
}