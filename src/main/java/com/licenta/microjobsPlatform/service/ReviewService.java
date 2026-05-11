package com.licenta.microjobsPlatform.service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.licenta.microjobsPlatform.dto.CreateReviewRequest;
import com.licenta.microjobsPlatform.dto.PublicUserRatingResponse;
import com.licenta.microjobsPlatform.dto.ReviewResponse;
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
        System.out.println("=== CREATE REVIEW ===");
        System.out.println("currentUserEmail = " + currentUserEmail);
        System.out.println("request.jobId = " + request.getJobId());
        System.out.println("request.reviewedUserId = " + request.getReviewedUserId());
        System.out.println("request.rating = " + request.getRating());
        System.out.println("request.message = " + request.getMessage());

        User reviewer = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new RuntimeException("Reviewer not found"));
        System.out.println("reviewer.id = " + reviewer.getId());

        User reviewedUser = userRepository.findById(request.getReviewedUserId())
                .orElseThrow(() -> new RuntimeException("Reviewed user not found"));
        System.out.println("reviewedUser.id = " + reviewedUser.getId());

        validateOnlyNormalUsers(reviewer);
        validateOnlyNormalUsers(reviewedUser);
        validateRating(request.getRating());

        if (reviewer.getId().equals(reviewedUser.getId())) {
            throw new RuntimeException("You cannot review yourself");
        }

        Job job = jobRepository.findById(request.getJobId())
                .orElseThrow(() -> new RuntimeException("Job not found"));
        System.out.println("job.id = " + job.getId());
        System.out.println("job.status = " + job.getStatus());
        System.out.println("job.postedBy = " + job.getPostedBy());

        if (job.getStatus() != JobStatus.COMPLETED) {
            throw new RuntimeException("Reviews can be added only for completed jobs");
        }

        if (reviewRepository.existsByJobIdAndReviewerIdAndReviewedUserId(
                request.getJobId(),
                reviewer.getId(),
                reviewedUser.getId()
        )) {
            throw new RuntimeException("You already reviewed this user for this job");
        }

        validateParticipation(job, reviewer, reviewedUser);

        String cleanMessage = normalizeMessage(request.getMessage());

        Review review = new Review(
                null,
                job.getId(),
                reviewer.getId(),
                reviewedUser.getId(),
                request.getRating(),
                cleanMessage
        );

        Review savedReview = reviewRepository.save(review);

        updateUserRating(reviewedUser.getId());

        return mapToResponse(savedReview, reviewer);
    }

    public PublicUserRatingResponse getPublicUserRating(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        validateOnlyNormalUsers(user);

        Double averageRating = user.getAverageRating() == null ? 0.0 : user.getAverageRating();
        Integer reviewCount = user.getReviewCount() == null ? 0 : user.getReviewCount();

        return new PublicUserRatingResponse(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                averageRating,
                reviewCount
        );
    }

    public List<ReviewResponse> getPublicReviewsForUser(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        validateOnlyNormalUsers(user);

        return reviewRepository.findByReviewedUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(review -> {
                    User reviewer = userRepository.findById(review.getReviewerId()).orElse(null);
                    return mapToResponse(review, reviewer);
                })
                .collect(Collectors.toList());
    }

    private void validateOnlyNormalUsers(User user) {
        if (user.getRole() != Role.USER) {
            throw new RuntimeException("Review functionality is available only for users with role USER");
        }
    }

    private void validateRating(Integer rating) {
        if (rating == null || rating < 1 || rating > 5) {
            throw new RuntimeException("Rating must be between 1 and 5");
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

        System.out.println("participantIds = " + participantIds);
        System.out.println("reviewer.id = " + reviewer.getId());
        System.out.println("reviewedUser.id = " + reviewedUser.getId());

        if (!participantIds.contains(reviewer.getId())) {
            throw new RuntimeException("You did not participate in this job");
        }

        if (!participantIds.contains(reviewedUser.getId())) {
            throw new RuntimeException("This user did not participate in this job");
        }
    }

    private Set<String> getParticipantIdsForJob(Job job) {
        Set<String> participantIds = new HashSet<>();

        String ownerEmail = normalizeEmail(job.getPostedBy());
        if (ownerEmail != null) {
            User owner = userRepository.findByEmail(ownerEmail)
                    .orElseThrow(() -> new RuntimeException("Job owner not found"));
            participantIds.add(owner.getId());
        }

        List<Aplicare> acceptedApplications = aplicareRepository.findByJobIdAndStatus(
                job.getId(),
                AplicareStatus.ACCEPTED
        );

        for (Aplicare aplicare : acceptedApplications) {
            String applicantEmail = normalizeEmail(aplicare.getApplicantEmail());

            if (applicantEmail == null) {
                continue;
            }

            User applicant = userRepository.findByEmail(applicantEmail)
                    .orElseThrow(() -> new RuntimeException("Applicant user not found for email: " + applicantEmail));

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
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Review> reviews = reviewRepository.findByReviewedUserId(userId);

        int count = reviews.size();
        double average = 0.0;

        if (count > 0) {
            int sum = reviews.stream()
                    .mapToInt(Review::getRating)
                    .sum();
            average = (double) sum / count;
        }

        user.setAverageRating(average);
        user.setReviewCount(count);

        userRepository.save(user);
    }

    private ReviewResponse mapToResponse(Review review, User reviewer) {
        String reviewerFirstName = reviewer != null ? reviewer.getFirstName() : null;
        String reviewerLastName = reviewer != null ? reviewer.getLastName() : null;

        return new ReviewResponse(
                review.getId(),
                review.getJobId(),
                review.getReviewerId(),
                reviewerFirstName,
                reviewerLastName,
                review.getReviewedUserId(),
                review.getRating(),
                review.getMessage(),
                review.getCreatedAt()
        );
    }
}
