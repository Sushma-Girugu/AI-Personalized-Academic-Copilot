package com.sushma.githubassistant.controller;

import com.sushma.githubassistant.model.StudyMaterial;
import com.sushma.githubassistant.model.Subject;
import com.sushma.githubassistant.repository.StudyMaterialRepository;
import com.sushma.githubassistant.repository.SubjectRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/subjects")
public class SubjectController {

    private final SubjectRepository subjectRepository;
    private final StudyMaterialRepository studyMaterialRepository;

    public SubjectController(
            SubjectRepository subjectRepository,
            StudyMaterialRepository studyMaterialRepository) {

        this.subjectRepository = subjectRepository;
        this.studyMaterialRepository = studyMaterialRepository;
    }

    @PostMapping
    public Subject addSubject(@RequestBody Subject subject) {
        return subjectRepository.save(subject);
    }

    @GetMapping
    public List<Subject> getAllSubjects() {
        return subjectRepository.findAll();
    }

    @GetMapping("/{id}")
    public Subject getSubjectById(@PathVariable Long id) {

        return subjectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Subject not found"));
    }

    // Get all study materials belonging to a subject
    @GetMapping("/{subjectId}/materials")
    public List<StudyMaterial> getSubjectMaterials(
            @PathVariable Long subjectId) {

        if (!subjectRepository.existsById(subjectId)) {
            throw new RuntimeException("Subject not found");
        }

        return studyMaterialRepository.findBySubjectId(subjectId);
    }
}