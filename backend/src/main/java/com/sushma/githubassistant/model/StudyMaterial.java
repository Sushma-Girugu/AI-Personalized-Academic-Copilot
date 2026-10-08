package com.sushma.githubassistant.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
public class StudyMaterial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    private String fileName;

    private String fileType;

    private String uploadDate;

    private String filePath;

    @Column(columnDefinition = "TEXT")
    private String extractedText;


    // =========================================================
    // SUBJECT
    // =========================================================

    @ManyToOne
    @JoinColumn(name = "subject_id")
    private Subject subject;


    // =========================================================
    // OWNER
    // =========================================================

    /*
     * Each study material belongs to one user.
     *
     * We are keeping nullable=true for now because
     * older materials were created before user ownership
     * was added to the application.
     *
     * New uploads MUST have a user.
     */

    @ManyToOne
    @JoinColumn(
            name = "user_id",
            nullable = true
    )
    @JsonIgnore
    private User user;


    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public StudyMaterial() {
    }


    // =========================================================
    // GETTERS / SETTERS
    // =========================================================

    public Long getId() {
        return id;
    }


    public String getTitle() {
        return title;
    }


    public void setTitle(String title) {
        this.title = title;
    }


    public String getFileName() {
        return fileName;
    }


    public void setFileName(String fileName) {
        this.fileName = fileName;
    }


    public String getFileType() {
        return fileType;
    }


    public void setFileType(String fileType) {
        this.fileType = fileType;
    }


    public String getUploadDate() {
        return uploadDate;
    }


    public void setUploadDate(String uploadDate) {
        this.uploadDate = uploadDate;
    }


    public String getFilePath() {
        return filePath;
    }


    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }


    public String getExtractedText() {
        return extractedText;
    }


    public void setExtractedText(String extractedText) {
        this.extractedText = extractedText;
    }


    public Subject getSubject() {
        return subject;
    }


    public void setSubject(Subject subject) {
        this.subject = subject;
    }


    public User getUser() {
        return user;
    }


    public void setUser(User user) {
        this.user = user;
    }
}