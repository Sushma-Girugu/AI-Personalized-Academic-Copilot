package com.sushma.githubassistant.repository;

import com.sushma.githubassistant.model.StudyMaterial;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StudyMaterialRepository
        extends JpaRepository<StudyMaterial, Long> {

    List<StudyMaterial> findByUserId(Long userId);

    Optional<StudyMaterial> findByIdAndUserId(
            Long id,
            Long userId
    );

    List<StudyMaterial> findBySubjectId(
            Long subjectId
    );
}