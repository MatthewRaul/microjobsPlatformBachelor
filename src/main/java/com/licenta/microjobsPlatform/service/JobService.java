package com.licenta.microjobsPlatform.service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.licenta.microjobsPlatform.dto.CreateJobRequest;
import com.licenta.microjobsPlatform.dto.UpdateJobRequest;
import com.licenta.microjobsPlatform.exception.BadRequest;
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
public class JobService {

    private final JobRepository jobRepository;
    private final UserRepository userRepository;
    private final AplicareRepository aplicareRepository;
    private final EmailService emailService;

    public JobService(JobRepository jobRepository, UserRepository userRepository,
            AplicareRepository aplicareRepository, EmailService emailService) {
        this.jobRepository = jobRepository;
        this.userRepository = userRepository;
        this.aplicareRepository = aplicareRepository;
        this.emailService = emailService;
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

        Job savedJob = jobRepository.save(job);
        return refreshStatusByTime(savedJob);
    }

    public Job getJobById(String id) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job negasit"));

        if (job.getAcceptedWorkers() == null) {
            job.setAcceptedWorkers(0);
        }

        refreshStatusByTime(job);

        return job;
    }

    public Job cancelJob(String id, String userEmail) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job negasit"));

        boolean isOwner = job.getPostedBy().equals(userEmail);

        if (!isOwner && !isAdmin()) {
            throw new RuntimeException("Nu ai permisiunea sa anulezi acest job.");
        }

        job.setStatus(JobStatus.CANCELED);
        Job savedJob = jobRepository.save(job);

        List<Aplicare> acceptedAplicari = aplicareRepository.findByJobIdAndStatus(id, AplicareStatus.ACCEPTED);

        return savedJob;
    }

    public Job completeJob(String id, String userEmail) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job negasit"));

        boolean isOwner = job.getPostedBy().equals(userEmail);

        if (!isOwner && !isAdmin()) {
            throw new RuntimeException("Nu ai permisiunea sa finalizezi acest job.");
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

            refreshStatusByTime(job);
        }

        return jobs;
    }

    public Job updateJob(String id, UpdateJobRequest request, String userEmail) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job negasit"));

        boolean isOwner = job.getPostedBy().equals(userEmail);

        if (!isOwner && !isAdmin()) {
            throw new RuntimeException("Nu poti modifica acest job.");
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
        Instant startDate = request.getStartDate();
        Instant endDate = request.getEndDate();

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
            throw new BadRequest("Salariul trebuie sa fie minim 0 RON.");
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
                .orElseThrow(() -> new RuntimeException("Job negasit"));

        boolean isOwner = job.getPostedBy().equals(userEmail);

        if (!isOwner && !isAdmin()) {
            throw new RuntimeException("Nu ai permisiunea sa stergi acest job.");
        }

        aplicareRepository.deleteAll(aplicareRepository.findByJobId(id));
        jobRepository.delete(job);
    }

    public Job refreshStatusByTime(Job job) {
        Instant now = Instant.now();
        JobStatus statusBeforeRefresh = job.getStatus();

        if (job.getAcceptedWorkers() == null) {
            job.setAcceptedWorkers(0);
        }

        if (statusBeforeRefresh == JobStatus.CANCELED || statusBeforeRefresh == JobStatus.COMPLETED) {
            rejectPendingAplicari(job);
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

        boolean becameUnavailable = job.getStatus() == JobStatus.IN_PROGRESS || job.getStatus() == JobStatus.COMPLETED;
        if (becameUnavailable) {
            rejectPendingAplicari(job);
        }

        if (statusBeforeRefresh != job.getStatus()) {
            jobRepository.save(job);
        }

        return job;
    }

    private void rejectPendingAplicari(Job job) {
        List<Aplicare> pendingAplicari = aplicareRepository.findByJobIdAndStatus(job.getId(), AplicareStatus.PENDING);
        for (Aplicare aplicare : pendingAplicari) {
            aplicare.setStatus(AplicareStatus.REJECTED);
            aplicareRepository.save(aplicare);
        }
    }

    public List<Job> getVisibleJobsFiltered(Instant startDate, Instant endDate, String location, Integer participants) {
        String normalizedLocation = location != null ? location.trim().toLowerCase() : null;
        boolean hasStartDate = startDate != null;
        boolean hasEndDate = endDate != null;
        boolean hasLocation = normalizedLocation != null && !normalizedLocation.isBlank();
        boolean hasParticipants = participants != null;
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
            refreshStatusByTime(job);
        }
        return jobs.stream()
                .filter(job -> job.getStatus() == JobStatus.OPEN)
                .filter(job -> {
                    if (hasStartDate && (job.getStartDate() == null || job.getStartDate().isBefore(startDate))) {
                        return false;
                    }
                    if (hasEndDate && (job.getEndDate() == null || job.getEndDate().isAfter(endDate))) {
                        return false;
                    }
                    if (hasLocation) {
                        boolean matchesLocation = containsIgnoreCase(job.getLocation(), normalizedLocation)
                                || containsIgnoreCase(job.getCounty(), normalizedLocation);
                        if (!matchesLocation) {
                            return false;
                        }
                    }
                    if (hasParticipants && (job.getNeededWorkers() == null || job.getNeededWorkers() < participants)) {
                        return false;
                    }
                    return true;
                }).toList();
    }

    public List<Job> getAllJobsForAdmin() {
        List<Job> jobs = jobRepository.findAll();

        for (Job job : jobs) {
            if (job.getAcceptedWorkers() == null) {
                job.setAcceptedWorkers(0);
            }

            refreshStatusByTime(job);
        }

        return jobs;
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
