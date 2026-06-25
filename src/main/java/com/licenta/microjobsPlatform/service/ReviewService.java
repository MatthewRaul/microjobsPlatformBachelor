package com.licenta.microjobsPlatform.service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.licenta.microjobsPlatform.dto.CreateReviewRequest;
import com.licenta.microjobsPlatform.dto.PublicUserRatingResponse;
import com.licenta.microjobsPlatform.dto.ReviewResponse;
import com.licenta.microjobsPlatform.exception.ForbiddenAction;
import com.licenta.microjobsPlatform.model.Aplicare;
import com.licenta.microjobsPlatform.model.AplicareStatus;
import com.licenta.microjobsPlatform.model.Job;
import com.licenta.microjobsPlatform.model.JobStatus;
import com.licenta.microjobsPlatform.model.Review;
import com.licenta.microjobsPlatform.model.Role;
import com.licenta.microjobsPlatform.model.User;
import com.licenta.microjobsPlatform.repository.AplicareRepository;
import com.licenta.microjobsPlatform.repository.JobRepository;
import com.licenta.microjobsPlatform.repository.ReviewRepository;
import com.licenta.microjobsPlatform.repository.UserRepository;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final AplicareRepository aplicareRepository;

    public ReviewService(ReviewRepository reviewRepository,
            UserRepository userRepository,
            JobRepository jobRepository,
            AplicareRepository aplicareRepository) {
        this.reviewRepository = reviewRepository;
        this.userRepository = userRepository;
        this.jobRepository = jobRepository;
        this.aplicareRepository = aplicareRepository;
    }

    public ReviewResponse createReview(CreateReviewRequest request, String currentUserEmail) {
        User reviewer = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new RuntimeException("Reviewer negasit."));

        User reviewedUser = userRepository.findById(request.getReviewedUserId())
                .orElseThrow(() -> new RuntimeException("User recenzat negasit."));

        validateOnlyNormalUsers(reviewer);
        validateOnlyNormalUsers(reviewedUser);
        validateRating(request.getRating());

        if (reviewer.getId().equals(reviewedUser.getId())) {
            throw new RuntimeException("Nu te poti evalua singur.");
        }

        Job job = jobRepository.findById(request.getJobId())
                .orElseThrow(() -> new RuntimeException("Job negasit."));

        if (job.getStatus() != JobStatus.COMPLETED) {
            throw new RuntimeException("Review-urile pot fi adaugate doar la joburi finalizate.");
        }

        if (reviewRepository.existsByJobIdAndReviewerIdAndReviewedUserId(
                request.getJobId(), reviewer.getId(), reviewedUser.getId())) {
            throw new RuntimeException("Ai evaluat deja acest user pentru acest job.");
        }

        validateParticipation(job, reviewer, reviewedUser);

        String cleanMessage = normalizeMessage(request.getMessage());

        Review review = new Review(null, job.getId(), reviewer.getId(),
                reviewedUser.getId(), request.getRating(), cleanMessage);

        Review savedReview = reviewRepository.save(review);
        updateUserRating(reviewedUser.getId());

        return mapToResponse(savedReview, reviewer, reviewedUser);
    }

    public PublicUserRatingResponse getPublicUserRating(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User negasit."));

        Double averageRating = user.getAverageRating() == null ? 0.0 : user.getAverageRating();
        Integer reviewCount = user.getReviewCount() == null ? 0 : user.getReviewCount();

        return new PublicUserRatingResponse(user.getId(), user.getFirstName(),
                user.getLastName(), averageRating, reviewCount);
    }

    public List<ReviewResponse> getPublicReviewsForUser(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User negasit."));

        return reviewRepository.findByReviewedUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(review -> {
                    User reviewer = userRepository.findById(review.getReviewerId()).orElse(null);
                    return mapToResponse(review, reviewer, user);
                })
                .collect(Collectors.toList());
    }

    // =========================
    // Zona admin
    // =========================
    public List<ReviewResponse> getAllReviewsForAdmin() {
        if (!isAdmin()) {
            throw new ForbiddenAction("Doar adminul poate vedea recenziile");
        }
        return reviewRepository.findAll()
                .stream()
                .map(review -> {
                    User reviewer = userRepository.findById(review.getReviewerId()).orElse(null);
                    User reviewedUser = userRepository.findById(review.getReviewedUserId()).orElse(null);
                    return mapToResponse(review, reviewer, reviewedUser);
                })
                .collect(Collectors.toList());
    }

    public void deleteReviewAsAdmin(String reviewId) {
        if (!isAdmin()) {
            throw new ForbiddenAction("Doar adminul poate vedea recenziile");
        }
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Recenzia nu exista."));

        // Recalculam ratingul userului evaluat dupa stergere
        String reviewedUserId = review.getReviewedUserId();
        reviewRepository.delete(review);
        updateUserRating(reviewedUserId);
    }

    // =========================
    // Helpers private
    // =========================
    private boolean isAdmin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getAuthorities() == null) {
            return false;
        }
        return authentication.getAuthorities().stream()
                .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()));
    }

    private void validateOnlyNormalUsers(User user) {
        if (user.getRole() != Role.USER) {
            throw new RuntimeException("Aceasta functionalitate de review este valabila doar pentru utilizatorii cu rol USER");
        }
    }

    private void validateRating(Integer rating) {
        if (rating == null || rating < 1 || rating > 5) {
            throw new RuntimeException("Rating trebuie sa fie intre 1 si 5");
        }
    }

    private String normalizeMessage(String message) {
        if (message == null || message.trim().isEmpty()) {
            return null;
        }
        return message.trim();
    }

    private void validateParticipation(Job job, User reviewer, User reviewedUser) {
        Set<String> participantIds = getParticipantIdsForJob(job);

        if (!participantIds.contains(reviewer.getId())) {
            throw new RuntimeException("Nu ai participat la acest job");
        }
        if (!participantIds.contains(reviewedUser.getId())) {
            throw new RuntimeException("Acest utlizator nu a participat la acest job");
        }
    }

    private Set<String> getParticipantIdsForJob(Job job) {
        Set<String> participantIds = new HashSet<>();

        String ownerEmail = normalizeEmail(job.getPostedBy());
        if (ownerEmail != null) {
            User owner = userRepository.findByEmail(ownerEmail)
                    .orElseThrow(() -> new RuntimeException("Angajator negasit"));
            participantIds.add(owner.getId());
        }

        List<Aplicare> acceptedApplications = aplicareRepository.findByJobIdAndStatus(
                job.getId(), AplicareStatus.ACCEPTED);

        for (Aplicare aplicare : acceptedApplications) {
            String applicantEmail = normalizeEmail(aplicare.getApplicantEmail());
            if (applicantEmail == null) {
                continue;
            }
            User applicant = userRepository.findByEmail(applicantEmail)
                    .orElseThrow(() -> new RuntimeException("Aplicant negasit " + applicantEmail));
            participantIds.add(applicant.getId());
        }

        return participantIds;
    }

    private String normalizeEmail(String email) {
        if (email == null || email.trim().isEmpty()) {
            return null;
        }
        return email.trim().toLowerCase();
    }

    private void updateUserRating(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilizator negasit"));

        List<Review> reviews = reviewRepository.findByReviewedUserId(userId);
        int count = reviews.size();
        double average = 0.0;

        if (count > 0) {
            int sum = reviews.stream().mapToInt(Review::getRating).sum();
            average = (double) sum / count;
        }

        user.setAverageRating(average);
        user.setReviewCount(count);
        userRepository.save(user);
    }

    private ReviewResponse mapToResponse(Review review, User reviewer, User reviewedUser) {
        return new ReviewResponse(
                review.getId(),
                review.getJobId(),
                review.getReviewerId(),
                reviewer != null ? reviewer.getFirstName() : null,
                reviewer != null ? reviewer.getLastName() : null,
                review.getReviewedUserId(),
                reviewedUser != null ? reviewedUser.getFirstName() : null,
                reviewedUser != null ? reviewedUser.getLastName() : null,
                review.getRating(),
                review.getMessage(),
                review.getCreatedAt()
        );
    }
}
