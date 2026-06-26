package com.licenta.microjobsPlatform.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.licenta.microjobsPlatform.dto.AplicareResponse;
import com.licenta.microjobsPlatform.model.Aplicare;
import com.licenta.microjobsPlatform.service.AplicareService;

@RestController
@RequestMapping("/api/aplicari")
public class AplicareController {

    private final AplicareService aplicareService;

    public AplicareController(AplicareService aplicareService) {
        this.aplicareService = aplicareService;
    }

    @PatchMapping("/{aplicareId}/accept")
    public ResponseEntity<Aplicare> acceptAplicare(@PathVariable String aplicareId) {

        return ResponseEntity.ok(aplicareService.acceptAplicare(aplicareId));
    }

    @PatchMapping("/{aplicareId}/reject")
    public ResponseEntity<Aplicare> rejectAplicare(@PathVariable String aplicareId) {

        return ResponseEntity.ok(aplicareService.rejectAplicare(aplicareId));
    }

    @GetMapping("/me")
    public ResponseEntity<List<AplicareResponse>> getMyAplicari() {
        return ResponseEntity.ok(aplicareService.getMyAplicari());
    }

    @DeleteMapping("/{aplicareId}/withdraw")
    public ResponseEntity<Void> withdrawAplicare(@PathVariable String aplicareId) {
        aplicareService.withdrawAplicare(aplicareId);
        return ResponseEntity.noContent().build();
    }
}
