package com.sushma.githubassistant.controller;

import com.sushma.githubassistant.model.StudyMaterial;
import com.sushma.githubassistant.model.Subject;
import com.sushma.githubassistant.model.User;
import com.sushma.githubassistant.repository.StudyMaterialRepository;
import com.sushma.githubassistant.repository.SubjectRepository;
import com.sushma.githubassistant.repository.UserRepository;
import com.sushma.githubassistant.service.PdfTextExtractor;
import com.sushma.githubassistant.service.TextChunkService;

import jakarta.servlet.http.HttpSession;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/files")
public class FileUploadController {

    private final StudyMaterialRepository studyMaterialRepository;
    private final SubjectRepository subjectRepository;
    private final UserRepository userRepository;
    private final PdfTextExtractor pdfTextExtractor;
    private final TextChunkService textChunkService;

    private final Path uploadPath =
            Paths.get("uploads");


    public FileUploadController(
            StudyMaterialRepository studyMaterialRepository,
            SubjectRepository subjectRepository,
            UserRepository userRepository,
            PdfTextExtractor pdfTextExtractor,
            TextChunkService textChunkService) {

        this.studyMaterialRepository =
                studyMaterialRepository;

        this.subjectRepository =
                subjectRepository;

        this.userRepository =
                userRepository;

        this.pdfTextExtractor =
                pdfTextExtractor;

        this.textChunkService =
                textChunkService;
    }


    @PostMapping("/upload")
    public StudyMaterial uploadFile(

            @RequestParam("file")
            MultipartFile file,

            @RequestParam("subjectName")
            String subjectName,

            @RequestParam("title")
            String title,

            HttpSession session) {

        try {

            // =====================================================
            // 1. CHECK LOGIN
            // =====================================================

            Object userIdObject =
                    session.getAttribute("userId");

            if (userIdObject == null) {

                throw new RuntimeException(
                        "Please login before uploading study material."
                );
            }

            Long userId =
                    ((Number) userIdObject).longValue();


            // =====================================================
            // 2. FIND CURRENT USER
            // =====================================================

            User user =
                    userRepository
                            .findById(userId)
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "User account not found."
                                    )
                            );


            // =====================================================
            // 3. VALIDATION
            // =====================================================

            if (file == null ||
                    file.isEmpty()) {

                throw new RuntimeException(
                        "Please select a file."
                );
            }


            String originalFileName =
                    file.getOriginalFilename();


            if (originalFileName == null ||
                    !originalFileName
                            .toLowerCase()
                            .endsWith(".pdf")) {

                throw new RuntimeException(
                        "Only PDF files are supported."
                );
            }


            if (title == null ||
                    title.trim().isEmpty()) {

                throw new RuntimeException(
                        "Material title is required."
                );
            }


            if (subjectName == null ||
                    subjectName.trim().isEmpty()) {

                throw new RuntimeException(
                        "Subject name is required."
                );
            }


            // =====================================================
            // 4. CREATE UPLOAD DIRECTORY
            // =====================================================

            if (!Files.exists(uploadPath)) {

                Files.createDirectories(
                        uploadPath
                );
            }


            // =====================================================
            // 5. SAVE PDF
            // =====================================================

            Path filePath =
                    uploadPath.resolve(
                            originalFileName
                    );

            Files.write(
                    filePath,
                    file.getBytes()
            );


            // =====================================================
            // 6. EXTRACT PDF TEXT
            // =====================================================

            String extractedText =
                    pdfTextExtractor.extractText(
                            filePath.toString()
                    );


            if (extractedText == null ||
                    extractedText.trim().isEmpty()) {

                throw new RuntimeException(
                        "No readable text was found in the PDF."
                );
            }


            // =====================================================
            // 7. SAVE EXTRACTED TEXT FILE
            // =====================================================

            String fileName =
                    originalFileName;


            if (fileName.toLowerCase()
                    .endsWith(".pdf")) {

                fileName =
                        fileName.substring(
                                0,
                                fileName.length() - 4
                        );
            }


            Path textFilePath =
                    uploadPath.resolve(
                            fileName + ".txt"
                    );


            Files.writeString(
                    textFilePath,
                    extractedText
            );


            // =====================================================
            // 8. FIND OR CREATE SUBJECT
            // =====================================================

            Subject subject =
                    subjectRepository
                            .findByNameIgnoreCase(
                                    subjectName.trim()
                            )
                            .orElseGet(() -> {

                                Subject newSubject =
                                        new Subject();

                                newSubject.setName(
                                        subjectName.trim()
                                );

                                return subjectRepository
                                        .save(newSubject);
                            });


            // =====================================================
            // 9. CREATE STUDY MATERIAL
            // =====================================================

            StudyMaterial material =
                    new StudyMaterial();


            material.setTitle(
                    title.trim()
            );


            material.setFileName(
                    originalFileName
            );


            material.setFileType(
                    file.getContentType()
            );


            material.setUploadDate(
                    LocalDate.now().toString()
            );


            material.setFilePath(
                    filePath.toString()
            );


            material.setExtractedText(
                    extractedText
            );


            material.setSubject(
                    subject
            );


            // =====================================================
            // 10. ASSIGN CURRENT USER
            // =====================================================

            material.setUser(
                    user
            );


            // =====================================================
            // 11. SAVE MATERIAL
            // =====================================================

            StudyMaterial savedMaterial =
                    studyMaterialRepository.save(
                            material
                    );


            // =====================================================
            // 12. CREATE CHUNKS + QDRANT VECTORS
            // =====================================================

            textChunkService.createChunks(
                    savedMaterial.getId(),
                    userId
            );


            // =====================================================
            // 13. RETURN SAVED MATERIAL
            // =====================================================

            return savedMaterial;


        } catch (IOException e) {

            throw new RuntimeException(
                    "File upload failed.",
                    e
            );
        }
    }
}