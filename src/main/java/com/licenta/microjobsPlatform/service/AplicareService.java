package com.licenta.microjobsPlatform.service;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
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
    private final EmailService emailService;
    private final JobService jobService;

    public AplicareService(AplicareRepository aplicareRepository,
            JobRepository jobRepository,
            UserRepository userRepository,
            EmailService emailService,
            JobService jobService) {
        this.aplicareRepository = aplicareRepository;
        this.jobRepository = jobRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.jobService = jobService;
    }

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
        String jobOwnerEmail = null;
        Job job = jobRepository.findById(aplicare.getJobId()).orElse(null);
        if (job != null) {
            jobOwnerEmail = job.getPostedBy();
        }
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
                aplicare.getJobTitle(),
                jobOwnerEmail
        );
    }

    public Aplicare applyToJob(String jobId) {
        String applicantEmail = getCurrentUserEmail();

        Job job = getJobOrThrow(jobId);

        if (job.getAcceptedWorkers() == null) {
            job.setAcceptedWorkers(0);
        }

        jobService.refreshStatusByTime(job);

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

        Aplicare savedAplicare = aplicareRepository.save(aplicare);

        User owner = userRepository.findByEmail(job.getPostedBy()).orElse(null);
        if (owner != null) {
            emailService.sendNewApplicationNotificationEmail(
                    owner.getEmail(),
                    owner.getFirstName(),
                    user.getFirstName(),
                    user.getLastName(),
                    job.getTitle()
            );
        }

        return savedAplicare;
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

        User applicant = userRepository.findByEmail(aplicare.getApplicantEmail()).orElse(null);
        if (applicant != null) {
            emailService.sendApplicationAcceptedEmail(
                    applicant.getEmail(),
                    applicant.getFirstName(),
                    job.getTitle()
            );
        }

        job.setAcceptedWorkers(job.getAcceptedWorkers() + 1);

        if (job.getAcceptedWorkers() >= job.getNeededWorkers()) {
            job.setStatus(JobStatus.FILLED);
            jobRepository.save(job);

            List<Aplicare> aplicari = aplicareRepository.findByJobId(job.getId());
            for (Aplicare a : aplicari) {
                if (a.getStatus() == AplicareStatus.PENDING) {
                    a.setStatus(AplicareStatus.REJECTED);
                    aplicareRepository.save(a);

                    User rejectedApplicant = userRepository.findByEmail(a.getApplicantEmail()).orElse(null);
                    if (rejectedApplicant != null) {
                        emailService.sendApplicationRejectedEmail(
                                rejectedApplicant.getEmail(),
                                rejectedApplicant.getFirstName(),
                                job.getTitle()
                        );
                    }
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
        Aplicare savedAplicare = aplicareRepository.save(aplicare);

        User applicant = userRepository.findByEmail(aplicare.getApplicantEmail()).orElse(null);
        if (applicant != null) {
            emailService.sendApplicationRejectedEmail(
                    applicant.getEmail(),
                    applicant.getFirstName(),
                    job.getTitle()
            );
        }

        return savedAplicare;
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

        User owner = userRepository.findByEmail(job.getPostedBy()).orElse(null);
        if (owner != null) {
            emailService.sendApplicationWithdrawnEmail(owner.getEmail(), owner.getFirstName(), aplicare.getApplicantFirstName(),
                    aplicare.getApplicantLastName(), job.getTitle());
        }

        aplicareRepository.delete(aplicare);
    }

    public List<AplicareResponse> getMyAplicari() {
        String email = getCurrentUserEmail();
        List<Aplicare> aplicari = aplicareRepository.findByApplicantEmail(email);

        Set<String> jobIdsDejaVerificate = new HashSet<>();
        for (Aplicare aplicare : aplicari) {
            String jobId = aplicare.getJobId();
            if (jobId != null && jobIdsDejaVerificate.add(jobId)) {
                jobRepository.findById(jobId).ifPresent(jobService::refreshStatusByTime);
            }
        }

        return aplicareRepository.findByApplicantEmail(email)
                .stream()
                .map(this::mapToAplicareResponse)
                .collect(Collectors.toList());
    }

    public List<Aplicare> getAllAplicariForAdmin() {
        if (!isAdmin()) {
            throw new ForbiddenAction("Doar adminul poate vedea toate aplicarile.");
        }

        return aplicareRepository.findAll();
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

}
