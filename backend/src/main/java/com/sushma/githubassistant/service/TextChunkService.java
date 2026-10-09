
package com.sushma.githubassistant.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sushma.githubassistant.model.StudyMaterial;
import com.sushma.githubassistant.model.TextChunk;
import com.sushma.githubassistant.repository.StudyMaterialRepository;
import com.sushma.githubassistant.repository.TextChunkRepository;

import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;
import java.util.Map;

@Service
public class TextChunkService {

    private final TextChunkRepository textChunkRepository;
    private final VectorStore vectorStore;
    private final StudyMaterialRepository studyMaterialRepository;
    private final TextChunker textChunker;

    @Value("${spring.ai.vectorstore.qdrant.host:localhost}")
    private String qdrantHost;

    @Value("${spring.ai.vectorstore.qdrant.api-key:}")
    private String qdrantApiKey;

    @Value("${spring.ai.vectorstore.qdrant.use-tls:false}")
    private boolean qdrantUseTls;

    private final HttpClient httpClient = HttpClient.newHttpClient();

    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final String COLLECTION_NAME = "academic_materials_v2";

    public TextChunkService(
            TextChunkRepository textChunkRepository,
            VectorStore vectorStore,
            StudyMaterialRepository studyMaterialRepository,
            TextChunker textChunker) {

        this.textChunkRepository = textChunkRepository;
        this.vectorStore = vectorStore;
        this.studyMaterialRepository = studyMaterialRepository;
        this.textChunker = textChunker;
    }

    // =========================================================
    // ENSURE QDRANT PAYLOAD INDEX EXISTS
    // =========================================================

    private void ensurePayloadIndex(String fieldName) {

        try {
            String host = qdrantHost
                    .replaceFirst("^https?://", "")
                    .replaceAll("/+$", "");

            String scheme = qdrantUseTls ? "https://" : "http://";
            String baseUrl = scheme + host + ":6333";

            // Check whether the payload index already exists.
            String collectionUrl = baseUrl
                    + "/collections/"
                    + COLLECTION_NAME
                    + "?with_payload_schema=true";

            HttpRequest.Builder getBuilder = HttpRequest.newBuilder()
                    .uri(URI.create(collectionUrl))
                    .GET();

            if (qdrantApiKey != null && !qdrantApiKey.isBlank()) {
                getBuilder.header("api-key", qdrantApiKey);
            }

            HttpResponse<String> getResponse = httpClient.send(
                    getBuilder.build(),
                    HttpResponse.BodyHandlers.ofString()
            );

            if (getResponse.statusCode() < 200
                    || getResponse.statusCode() >= 300) {
                throw new RuntimeException(
                        "Unable to inspect Qdrant collection. HTTP "
                                + getResponse.statusCode()
                                + ": " + getResponse.body()
                );
            }

            JsonNode root = objectMapper.readTree(getResponse.body());
            JsonNode payloadSchema = root
                    .path("result")
                    .path("payload_schema");

            if (payloadSchema.has(fieldName)) {
                return;
            }

            // Create a keyword index for the missing field.
            String indexUrl = baseUrl
                    + "/collections/"
                    + COLLECTION_NAME
                    + "/index?wait=true";

            String requestBody = objectMapper.writeValueAsString(
                    Map.of(
                            "field_name", fieldName,
                            "field_schema", "keyword"
                    )
            );

            HttpRequest.Builder putBuilder = HttpRequest.newBuilder()
                    .uri(URI.create(indexUrl))
                    .header("Content-Type", "application/json")
                    .PUT(HttpRequest.BodyPublishers.ofString(requestBody));

            if (qdrantApiKey != null && !qdrantApiKey.isBlank()) {
                putBuilder.header("api-key", qdrantApiKey);
            }

            HttpResponse<String> putResponse = httpClient.send(
                    putBuilder.build(),
                    HttpResponse.BodyHandlers.ofString()
            );

            if (putResponse.statusCode() < 200
                    || putResponse.statusCode() >= 300) {
                throw new RuntimeException(
                        "Unable to create Qdrant index for "
                                + fieldName
                                + ". HTTP " + putResponse.statusCode()
                                + ": " + putResponse.body()
                );
            }

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException(
                    "Interrupted while configuring Qdrant indexes.",
                    e
            );

        } catch (Exception e) {
            throw new RuntimeException(
                    "Failed to configure Qdrant index for "
                            + fieldName + ".",
                    e
            );
        }
    }

    private void ensurePayloadIndexes() {
        ensurePayloadIndex("userId");
        ensurePayloadIndex("materialId");
    }

    // =========================================================
    // CREATE CHUNKS
    // =========================================================

    public void createChunks(Long studyMaterialId, Long userId) {

        // 1. Verify that the material belongs to the current user.
        StudyMaterial material = studyMaterialRepository
                .findByIdAndUserId(studyMaterialId, userId)
                .orElseThrow(() ->
                        new RuntimeException("Study material not found.")
                );

        // 2. Get extracted text.
        String extractedText = material.getExtractedText();

        if (extractedText == null || extractedText.trim().isEmpty()) {
            throw new RuntimeException("Extracted text not available.");
        }

        // 3. Split text into chunks.
        List<String> chunks = textChunker.splitText(extractedText);

        if (chunks == null || chunks.isEmpty()) {
            throw new RuntimeException("Unable to create text chunks.");
        }

        // 4. Ensure indexes exist before using Qdrant filters.
        ensurePayloadIndexes();

        // 5. Delete old PostgreSQL chunks.
        List<TextChunk> oldChunks = textChunkRepository
                .findByStudyMaterialIdOrderByChunkIndex(studyMaterialId);

        textChunkRepository.deleteAll(oldChunks);

        // 6. Delete old Qdrant vectors for this user and material.
        vectorStore.delete(
                "userId == '" + userId
                        + "' && materialId == '" + studyMaterialId + "'"
        );

        // 7. Create new chunks, metadata, and vectors.
        for (int i = 0; i < chunks.size(); i++) {

            String chunkContent = chunks.get(i);

            Map<String, Object> metadata = Map.of(
                    "userId", String.valueOf(userId),
                    "materialId", String.valueOf(studyMaterialId),
                    "chunkIndex", i
            );

            Document document = new Document(chunkContent, metadata);

            // Store vector in Qdrant.
            vectorStore.add(List.of(document));

            // Store chunk in PostgreSQL.
            TextChunk textChunk = new TextChunk();
            textChunk.setChunkIndex(i);
            textChunk.setContent(chunkContent);
            textChunk.setStudyMaterial(material);

            textChunkRepository.save(textChunk);
        }
    }

    // =========================================================
    // GET CHUNKS
    // =========================================================

    public List<TextChunk> getChunks(Long studyMaterialId) {

        return textChunkRepository
                .findByStudyMaterialIdOrderByChunkIndex(studyMaterialId);
    }
}
