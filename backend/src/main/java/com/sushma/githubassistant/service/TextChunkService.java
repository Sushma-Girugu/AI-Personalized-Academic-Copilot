package com.sushma.githubassistant.service;

import com.sushma.githubassistant.model.StudyMaterial;
import com.sushma.githubassistant.model.TextChunk;
import com.sushma.githubassistant.repository.StudyMaterialRepository;
import com.sushma.githubassistant.repository.TextChunkRepository;

import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class TextChunkService {

    private final TextChunkRepository textChunkRepository;

    private final VectorStore vectorStore;

    private final StudyMaterialRepository studyMaterialRepository;

    private final TextChunker textChunker;


    public TextChunkService(
            TextChunkRepository textChunkRepository,
            VectorStore vectorStore,
            StudyMaterialRepository studyMaterialRepository,
            TextChunker textChunker) {

        this.textChunkRepository =
                textChunkRepository;

        this.vectorStore =
                vectorStore;

        this.studyMaterialRepository =
                studyMaterialRepository;

        this.textChunker =
                textChunker;
    }


    // =========================================================
    // CREATE CHUNKS
    // =========================================================

    public void createChunks(
            Long studyMaterialId,
            Long userId) {


        // =====================================================
        // 1. VERIFY MATERIAL BELONGS TO USER
        // =====================================================

        StudyMaterial material =
                studyMaterialRepository
                        .findByIdAndUserId(
                                studyMaterialId,
                                userId
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Study material not found."
                                )
                        );


        // =====================================================
        // 2. GET EXTRACTED TEXT
        // =====================================================

        String extractedText =
                material.getExtractedText();


        if (extractedText == null ||
                extractedText.trim().isEmpty()) {

            throw new RuntimeException(
                    "Extracted text not available."
            );
        }


        // =====================================================
        // 3. SPLIT TEXT INTO CHUNKS
        // =====================================================

        List<String> chunks =
                textChunker.splitText(
                        extractedText
                );


        if (chunks == null ||
                chunks.isEmpty()) {

            throw new RuntimeException(
                    "Unable to create text chunks."
            );
        }


        // =====================================================
        // 4. DELETE OLD POSTGRES CHUNKS
        // =====================================================

        List<TextChunk> oldChunks =
                textChunkRepository
                        .findByStudyMaterialIdOrderByChunkIndex(
                                studyMaterialId
                        );


        textChunkRepository.deleteAll(
                oldChunks
        );


        // =====================================================
        // 5. DELETE OLD QDRANT VECTORS
        // =====================================================

        vectorStore.delete(

                "userId == '" +
                        userId +
                        "' && materialId == '" +
                        studyMaterialId +
                        "'"

        );


        // =====================================================
        // 6. CREATE NEW CHUNKS
        // =====================================================

        for (int i = 0;
             i < chunks.size();
             i++) {


            String chunkContent =
                    chunks.get(i);


            // =================================================
            // 7. CREATE METADATA
            // =================================================

            Map<String, Object> metadata =
                    Map.of(

                            "userId",
                            String.valueOf(
                                    userId
                            ),

                            "materialId",
                            String.valueOf(
                                    studyMaterialId
                            ),

                            "chunkIndex",
                            i
                    );


            // =================================================
            // 8. CREATE VECTOR DOCUMENT
            // =================================================

            Document document =
                    new Document(
                            chunkContent,
                            metadata
                    );


            // =================================================
            // 9. STORE VECTOR IN QDRANT
            // =================================================

            vectorStore.add(
                    List.of(document)
            );


            // =================================================
            // 10. STORE CHUNK IN POSTGRES
            // =================================================

            TextChunk textChunk =
                    new TextChunk();


            textChunk.setChunkIndex(
                    i
            );


            textChunk.setContent(
                    chunkContent
            );


            textChunk.setStudyMaterial(
                    material
            );


            textChunkRepository.save(
                    textChunk
            );
        }
    }


    // =========================================================
    // GET CHUNKS
    // =========================================================

    public List<TextChunk> getChunks(
            Long studyMaterialId) {

        return textChunkRepository
                .findByStudyMaterialIdOrderByChunkIndex(
                        studyMaterialId
                );
    }
}