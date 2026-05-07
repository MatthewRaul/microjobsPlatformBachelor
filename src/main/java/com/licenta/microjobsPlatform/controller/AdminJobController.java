package com.licenta.microjobsPlatform.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.licenta.microjobsPlatform.dto.UpdateJobRequest;
import com.licenta.microjobsPlatform.model.Job;
import com.licenta.microjobsPlatform.service.JobService;

@RestController
@RequestMapping("/api/admin/jobs")
public class AdminJobController {

    private final JobService jobService;

    public AdminJobController(JobService jobService) {
        this.jobService = jobService;
    }

    // Lista completa de joburi pentru admin.
    // Daca exista query-ul "search", aplicam cautarea.
    @GetMapping
    public ResponseEntity<List<Job>> getAllJobsForAdmin(
            @RequestParam(required = false) String search) {

        if (search != null && !search.trim().isBlank()) {
            return ResponseEntity.ok(jobService.searchJobsForAdmin(search));
        }

        return ResponseEntity.ok(jobService.getAllJobsForAdmin());
    }

    // Detalii job pentru admin.
    @GetMapping("/{id}")
    public ResponseEntity<Job> getJobByIdForAdmin(@PathVariable String id) {
        return ResponseEntity.ok(jobService.getJobByIdForAdmin(id));
    }

    // Editare job de catre admin.
    @PatchMapping("/{id}")
    public ResponseEntity<Job> updateJobAsAdmin(
            @PathVariable String id,
            @RequestBody UpdateJobRequest request,
            Authentication authentication) {

        String adminEmail = authentication.getName();
        Job updatedJob = jobService.updateJobAsAdmin(id, request, adminEmail);
        return ResponseEntity.ok(updatedJob);
    }

    // Anulare job de catre admin.
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<Job> cancelJobAsAdmin(
            @PathVariable String id,
            Authentication authentication) {

        String adminEmail = authentication.getName();
        Job canceledJob = jobService.cancelJobAsAdmin(id, adminEmail);
        return ResponseEntity.ok(canceledJob);
    }

    // Finalizare job de catre admin.
    @PatchMapping("/{id}/complete")
    public ResponseEntity<Job> completeJobAsAdmin(
            @PathVariable String id,
            Authentication authentication) {

        String adminEmail = authentication.getName();
        Job completedJob = jobService.completeJobAsAdmin(id, adminEmail);
        return ResponseEntity.ok(completedJob);
    }

    // Stergere job de catre admin.
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteJobAsAdmin(
            @PathVariable String id,
            Authentication authentication) {

        String adminEmail = authentication.getName();
        jobService.deleteJobAsAdmin(id, adminEmail);
        return ResponseEntity.noContent().build();
    }
}