package com.licenta.microjobsPlatform.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.licenta.microjobsPlatform.dto.AplicareResponse;
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

    public AplicareService(AplicareRepository aplicareRepository,
                           JobRepository jobRepository,
                           UserRepository userRepository) {
        this.aplicareRepository = aplicareRepository;
        this.jobRepository = jobRepository;
        this.userRepository = userRepository;
    }

    // =========================
    // Helpers generale
    // =========================

    private Authentication getAuthentication() {
        return SecurityContextHolder.getContext().getAuthentication();
    }

    private String getCurrentUserEmail() {
        Authentication authentication = getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new ForbiddenAction("Utilizator neautentificat.");
        }
        return authentication.getName();
    }

    private boolean isAdmin() {
        Authentication authentication = getAuthentication();

        if (authentication == null || authentication.getAuthorities() == null) {
            return false;
        }

        return authentication.getAuthorities().stream()
                .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()));
    }

    private Job getJobOrThrow(String jobId) {
        return jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFound("Jobul nu exista"));
    }

    private Aplicare getAplicareOrThrow(String aplicareId) {
        return aplicareRepository.findById(aplicareId)
                .orElseThrow(() -> new ResourceNotFound("Aplicarea nu exista."));
    }

    private boolean isOwner(Job job, String userEmail) {
        return java.util.Objects.equals(job.getPostedBy(), userEmail);
    }

    private boolean isAcceptedParticipant(String jobId, String userEmail) {
        return aplicareRepository.findByJobIdAndApplicantEmail(jobId, userEmail)
                .map(aplicare -> aplicare.getStatus() == AplicareStatus.ACCEPTED)
                .orElse(false);
    }

    private boolean canViewParticipants(Job job, String userEmail) {
        if (isOwner(job, userEmail) || isAdmin()) {
            return true;
        }

        return isAcceptedParticipant(job.getId(), userEmail);
    }

    private AplicareResponse mapToAplicareResponse(Aplicare aplicare) {
        User user = userRepository.findByEmail(aplicare.getApplicantEmail()).orElse(null);

        String applicantUserId = user != null ? user.getId() : null;
        Double applicantAverageRating = user != null ? user.getAverageRating() : 0.0;
        Integer applicantReviewCount = user != null ? user.getReviewCount() : 0;

        return new AplicareResponse(
                aplicare.getId(),
                aplicare.getJobId(),
                applicantUserId,
                aplicare.getApplicantEmail(),
                aplicare.getApplicantFirstName(),
                aplicare.getApplicantLastName(),
                applicantAverageRating,
                applicantReviewCount,
                aplicare.getStatus(),
                aplicare.getAppliedAt(),
                aplicare.getJobTitle()
        );
    }

    // =========================
    // Zona utilizator / owner
    // =========================

    public Aplicare applyToJob(String jobId) {
        String applicantEmail = getCurrentUserEmail();

        Job job = getJobOrThrow(jobId);

        if (job.getAcceptedWorkers() == null) {
            job.setAcceptedWorkers(0);
        }

        LocalDateTime now = LocalDateTime.now();

        if (job.getEndDate() != null && !job.getEndDate().isAfter(now)) {
            job.setStatus(JobStatus.COMPLETED);
            jobRepository.save(job);
            throw new BadRequest("Jobul s-a incheiat.");
        }

        if (job.getStartDate() != null && !job.getStartDate().isAfter(now)) {
            job.setStatus(JobStatus.IN_PROGRESS);
            jobRepository.save(job);
            throw new BadRequest("Jobul este in desfasurare.");
        }

        if (job.getStatus() == JobStatus.CANCELED
                || job.getStatus() == JobStatus.COMPLETED
                || job.getStatus() == JobStatus.FILLED
                || job.getStatus() == JobStatus.IN_PROGRESS) {
            throw new BadRequest("Nu se poate aplica la un job inchis.");
        }

        if (isOwner(job, applicantEmail)) {
            throw new BadRequest("Nu poti aplica la propriul job.");
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
        aplicare.setJobTitle(job.getTitle());
        aplicare.setApplicantEmail(applicantEmail);
        aplicare.setApplicantFirstName(user.getFirstName());
        aplicare.setApplicantLastName(user.getLastName());
        aplicare.setStatus(AplicareStatus.PENDING);
        aplicare.setAppliedAt(LocalDateTime.now());

        return aplicareRepository.save(aplicare);
    }

    public List<Aplicare> getAplicariForJob(String jobId) {
        String currentUserEmail = getCurrentUserEmail();

        Job job = getJobOrThrow(jobId);

        if (!canViewParticipants(job, currentUserEmail)) {
            throw new ForbiddenAction("Nu ai voie sa vezi participantii acestui job.");
        }

        return aplicareRepository.findByJobId(jobId);
    }

    public List<AplicareResponse> getAplicariForJobResponse(String jobId) {
        return getAplicariForJob(jobId).stream()
                .map(this::mapToAplicareResponse)
                .collect(Collectors.toList());
    }

    public Aplicare acceptAplicare(String aplicareId) {
        String currentUserEmail = getCurrentUserEmail();

        Aplicare aplicare = getAplicareOrThrow(aplicareId);
        Job job = getJobOrThrow(aplicare.getJobId());

        if (!isOwner(job, currentUserEmail) && !isAdmin()) {
            throw new ForbiddenAction("Nu ai voie sa accepti aplicarile acestui job.");
        }

        if (aplicare.getStatus() != AplicareStatus.PENDING) {
            throw new BadRequest("Doar aplicarile PENDING pot fi acceptate.");
        }

        if (job.getStatus() == JobStatus.CANCELED || job.getStatus() == JobStatus.COMPLETED) {
            throw new BadRequest("Nu poti accepta aplicari pentru un job inchis.");
        }

        if (job.getAcceptedWorkers() == null) {
            job.setAcceptedWorkers(0);
        }

        if (job.getNeededWorkers() == null || job.getNeededWorkers() <= 0) {
            throw new BadRequest("Capacitatea jobului este invalida.");
        }

        if (job.getAcceptedWorkers() >= job.getNeededWorkers()) {
            job.setStatus(JobStatus.FILLED);
            jobRepository.save(job);
            throw new BadRequest("Jobul este deja plin.");
        }

        aplicare.setStatus(AplicareStatus.ACCEPTED);
        Aplicare savedAplicare = aplicareRepository.save(aplicare);

        job.setAcceptedWorkers(job.getAcceptedWorkers() + 1);

        if (job.getAcceptedWorkers() >= job.getNeededWorkers()) {
            job.setStatus(JobStatus.FILLED);
            jobRepository.save(job);

            List<Aplicare> aplicari = aplicareRepository.findByJobId(job.getId());
            for (Aplicare a : aplicari) {
                if (a.getStatus() == AplicareStatus.PENDING) {
                    a.setStatus(AplicareStatus.REJECTED);
                    aplicareRepository.save(a);
                }
            }
        } else {
            jobRepository.save(job);
        }

        return savedAplicare;
    }

    public Aplicare rejectAplicare(String aplicareId) {
        String currentUserEmail = getCurrentUserEmail();

        Aplicare aplicare = getAplicareOrThrow(aplicareId);
        Job job = getJobOrThrow(aplicare.getJobId());

        if (!isOwner(job, currentUserEmail) && !isAdmin()) {
            throw new ForbiddenAction("Nu ai voie sa respingi aplicarile acestui job.");
        }

        if (aplicare.getStatus() != AplicareStatus.PENDING) {
            throw new BadRequest("Doar aplicarile PENDING pot fi respinse.");
        }

        aplicare.setStatus(AplicareStatus.REJECTED);
        return aplicareRepository.save(aplicare);
    }

    public void withdrawAplicare(String aplicareId) {
        String currentUserEmail = getCurrentUserEmail();

        Aplicare aplicare = getAplicareOrThrow(aplicareId);

        if (!currentUserEmail.equals(aplicare.getApplicantEmail())) {
            throw new ForbiddenAction("Nu poti retrage aplicarea altcuiva.");
        }

        Job job = getJobOrThrow(aplicare.getJobId());

        if (job.getStatus() == JobStatus.COMPLETED || job.getStatus() == JobStatus.CANCELED) {
            throw new BadRequest("Nu poti retrage aplicarea la un job inchis.");
        }

        if (aplicare.getStatus() == AplicareStatus.ACCEPTED) {
            int current = job.getAcceptedWorkers() == null ? 0 : job.getAcceptedWorkers();
            job.setAcceptedWorkers(Math.max(0, current - 1));
            if (job.getStatus() == JobStatus.FILLED) {
                job.setStatus(JobStatus.OPEN);
            }
            jobRepository.save(job);
        }

        aplicareRepository.delete(aplicare);
    }

    public List<Aplicare> getMyAplicari() {
        String email = getCurrentUserEmail();
        return aplicareRepository.findByApplicantEmail(email);
    }

    // =========================
    // Zona admin
    // =========================

    public List<Aplicare> getAllAplicariForAdmin() {
        if (!isAdmin()) {
            throw new ForbiddenAction("Doar adminul poate vedea toate aplicarile.");
        }

        return aplicareRepository.findAll();
    }

    public List<Aplicare> searchAplicariForAdmin(String search) {
        if (!isAdmin()) {
            throw new ForbiddenAction("Doar adminul poate cauta in aplicari.");
        }

        List<Aplicare> aplicari = aplicareRepository.findAll();

        if (search == null || search.trim().isBlank()) {
            return aplicari;
        }

        String normalizedSearch = search.trim().toLowerCase();

        return aplicari.stream()
                .filter(aplicare ->
                        containsIgnoreCase(aplicare.getApplicantEmail(), normalizedSearch) ||
                        containsIgnoreCase(aplicare.getApplicantFirstName(), normalizedSearch) ||
                        containsIgnoreCase(aplicare.getApplicantLastName(), normalizedSearch) ||
                        containsIgnoreCase(aplicare.getJobId(), normalizedSearch) ||
                        containsIgnoreCase(
                                aplicare.getStatus() != null ? aplicare.getStatus().name() : null,
                                normalizedSearch))
                .toList();
    }

    public Aplicare getAplicareByIdForAdmin(String aplicareId) {
        if (!isAdmin()) {
            throw new ForbiddenAction("Doar adminul poate vedea aceasta aplicare.");
        }

        return getAplicareOrThrow(aplicareId);
    }

    public Aplicare acceptAplicareAsAdmin(String aplicareId) {
        if (!isAdmin()) {
            throw new ForbiddenAction("Doar adminul poate accepta aplicari din zona de administrare.");
        }

        return acceptAplicare(aplicareId);
    }

    public Aplicare rejectAplicareAsAdmin(String aplicareId) {
        if (!isAdmin()) {
            throw new ForbiddenAction("Doar adminul poate respinge aplicari din zona de administrare.");
        }

        return rejectAplicare(aplicareId);
    }

    public void deleteAplicareAsAdmin(String aplicareId) {
        if (!isAdmin()) {
            throw new ForbiddenAction("Doar adminul poate sterge aplicari.");
        }

        Aplicare aplicare = getAplicareOrThrow(aplicareId);
        aplicareRepository.delete(aplicare);
    }

    // =========================
    // Helper text
    // =========================

    private boolean containsIgnoreCase(String value, String search) {
        return value != null && value.toLowerCase().contains(search);
    }
}