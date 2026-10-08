package com.sushma.githubassistant.controller;

import com.sushma.githubassistant.model.StudyMaterial;
import com.sushma.githubassistant.repository.StudyMaterialRepository;
import com.sushma.githubassistant.service.TextChunkService;

import jakarta.servlet.http.HttpSession;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/materials")
public class StudyMaterialController {

    private final StudyMaterialRepository studyMaterialRepository;

    private final TextChunkService textChunkService;


    public StudyMaterialController(
            StudyMaterialRepository studyMaterialRepository,
            TextChunkService textChunkService) {

        this.studyMaterialRepository =
                studyMaterialRepository;

        this.textChunkService =
                textChunkService;
    }


    // =========================================================
    // GET ALL MATERIALS OF CURRENT USER
    // =========================================================

    @GetMapping
    public List<StudyMaterial> getMaterials(
            HttpSession session) {

        Long userId =
                getLoggedInUserId(session);

        return studyMaterialRepository
                .findByUserId(userId);
    }


    // =========================================================
    // GET ONE MATERIAL
    // =========================================================

    @GetMapping("/{id}")
    public StudyMaterial getMaterial(
            @PathVariable Long id,
            HttpSession session) {

        Long userId =
                getLoggedInUserId(session);

        return studyMaterialRepository
                .findByIdAndUserId(
                        id,
                        userId
                )
                .orElseThrow(() ->
                        new RuntimeException(
                                "Study material not found."
                        )
                );
    }


    // =========================================================
    // GET MATERIAL TEXT
    // =========================================================

    @GetMapping("/{id}/text")
    public String getMaterialText(
            @PathVariable Long id,
            HttpSession session) {

        Long userId =
                getLoggedInUserId(session);

        StudyMaterial material =
                studyMaterialRepository
                        .findByIdAndUserId(
                                id,
                                userId
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Study material not found."
                                )
                        );

        return material.getExtractedText();
    }


    // =========================================================
    // GET CHUNKS
    // =========================================================

    @GetMapping("/{id}/chunks")
    public Object getChunks(
            @PathVariable Long id,
            HttpSession session) {

        Long userId =
                getLoggedInUserId(session);

        studyMaterialRepository
                .findByIdAndUserId(
                        id,
                        userId
                )
                .orElseThrow(() ->
                        new RuntimeException(
                                "Study material not found."
                        )
                );

        return textChunkService
                .getChunks(id);
    }


    // =========================================================
    // RECREATE CHUNKS
    // =========================================================

    @PostMapping("/{id}/chunks")
    public String createChunks(
            @PathVariable Long id,
            HttpSession session) {

        Long userId =
                getLoggedInUserId(session);

        textChunkService.createChunks(
                id,
                userId
        );

        return "Chunks created successfully.";
    }


    // =========================================================
    // CHECK LOGIN
    // =========================================================

    private Long getLoggedInUserId(
            HttpSession session) {

        Object userIdObject =
                session.getAttribute("userId");

        if (userIdObject == null) {

            throw new RuntimeException(
                    "Please login first."
            );
        }

        return ((Number) userIdObject)
                .longValue();
    }
}