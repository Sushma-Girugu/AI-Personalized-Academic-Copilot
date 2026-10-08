package com.sushma.githubassistant.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
public class TextChunk {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int chunkIndex;

    @Column(columnDefinition = "TEXT")
    private String content;

    @ManyToOne
    @JoinColumn(name = "study_material_id")
    @JsonIgnore
    private StudyMaterial studyMaterial;

    public TextChunk() {
    }

    public Long getId() {
        return id;
    }

    public int getChunkIndex() {
        return chunkIndex;
    }

    public void setChunkIndex(int chunkIndex) {
        this.chunkIndex = chunkIndex;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public StudyMaterial getStudyMaterial() {
        return studyMaterial;
    }

    public void setStudyMaterial(StudyMaterial studyMaterial) {
        this.studyMaterial = studyMaterial;
    }
}