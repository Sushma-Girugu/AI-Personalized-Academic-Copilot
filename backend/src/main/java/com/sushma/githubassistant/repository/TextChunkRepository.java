package com.sushma.githubassistant.repository;

import com.sushma.githubassistant.model.TextChunk;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TextChunkRepository
        extends JpaRepository<TextChunk, Long> {

    List<TextChunk> findByStudyMaterialIdOrderByChunkIndex(Long studyMaterialId);
}