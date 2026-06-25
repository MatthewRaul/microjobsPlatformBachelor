package com.licenta.microjobsPlatform.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.licenta.microjobsPlatform.model.Aplicare;
import com.licenta.microjobsPlatform.service.AplicareService;

@RestController
@RequestMapping("/api/admin/aplicari")
public class AdminAplicareController {

    private final AplicareService aplicareService;

    public AdminAplicareController(AplicareService aplicareService) {
        this.aplicareService = aplicareService;
    }

    // Lista completa de aplicari pentru admin.
    // Daca exista search, aplicam cautarea.
    @GetMapping
    public ResponseEntity<List<Aplicare>> getAllAplicariForAdmin() {
        return ResponseEntity.ok(aplicareService.getAllAplicariForAdmin());
    }

    // Detalii pentru o aplicare.
    @GetMapping("/{id}")
    public ResponseEntity<Aplicare> getAplicareByIdForAdmin(@PathVariable String id) {
        return ResponseEntity.ok(aplicareService.getAplicareByIdForAdmin(id));
    }

    // Acceptare aplicare de catre admin.
    @PatchMapping("/{id}/accept")
    public ResponseEntity<Aplicare> acceptAplicareAsAdmin(@PathVariable String id) {
        return ResponseEntity.ok(aplicareService.acceptAplicareAsAdmin(id));
    }

    // Respingere aplicare de catre admin.
    @PatchMapping("/{id}/reject")
    public ResponseEntity<Aplicare> rejectAplicareAsAdmin(@PathVariable String id) {
        return ResponseEntity.ok(aplicareService.rejectAplicareAsAdmin(id));
    }

    // Stergere aplicare de catre admin.
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAplicareAsAdmin(@PathVariable String id) {
        aplicareService.deleteAplicareAsAdmin(id);
        return ResponseEntity.noContent().build();
    }
}
