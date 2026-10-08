package com.sushma.githubassistant.service;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RagService {

    private final VectorStore vectorStore;

    private final ChatClient chatClient;


    public RagService(
            VectorStore vectorStore,
            ChatClient.Builder chatClientBuilder) {

        this.vectorStore =
                vectorStore;

        this.chatClient =
                chatClientBuilder.build();
    }


    public String askQuestion(
            String question,
            Long userId) {

        // =====================================================
        // SEARCH ONLY THIS USER'S DOCUMENTS
        // =====================================================

        List<Document> documents =
                vectorStore.similaritySearch(
                        SearchRequest.builder()
                                .query(question)
                                .topK(5)
                                .filterExpression(
                                        "userId == '" +
                                                userId +
                                                "'"
                                )
                                .build()
                );


        if (documents == null ||
                documents.isEmpty()) {

            return "I could not find relevant information in your uploaded study materials.";
        }


        // =====================================================
        // BUILD CONTEXT
        // =====================================================

        StringBuilder context =
                new StringBuilder();

        for (Document document :
                documents) {

            context.append(
                    document.getText()
            );

            context.append("\n\n");
        }


        // =====================================================
        // AI TUTOR INSTRUCTIONS
        // =====================================================

        String systemPrompt = """
                You are an AI Academic Copilot and a helpful
                personal tutor for a college student.

                Your job is to help the student understand the
                concepts found in their uploaded study materials.

                IMPORTANT RULES:

                1. Use the uploaded study material as the primary
                   source for factual information.

                2. Explain concepts clearly and simply, as if you
                   are teaching a college student who is learning
                   the topic for the first time.

                3. Do not simply repeat sentences from the study
                   material. Explain them in easier language.

                4. When the student asks for an example, provide
                   a small and easy illustrative example that helps
                   explain the concept.

                5. If you create an illustrative example that is
                   not directly present in the uploaded material,
                   do not claim that the example came from the PDF.

                6. When useful, use simple programming examples,
                   numerical examples, or real-world examples.

                7. Keep the answer focused on the student's
                   question. Do not add unrelated information.

                8. Prefer this structure when appropriate:

                   Explanation:
                   Give a clear explanation.

                   Example:
                   Give a simple example.

                   Key Point:
                   Give the main thing the student should remember.

                9. If the student asks about something that is not
                   supported by the uploaded study material, clearly
                   say that the required information is not available
                   in the uploaded study materials.

                10. Do not invent facts and present them as if they
                    came from the uploaded material.

                11. Do not use raw LaTeX formatting such as
                    $O(1)$ or $x^2$.
                    Use normal text such as O(1) and x^2 instead.

                12. Use clear headings, bullet points, and short
                    paragraphs when they improve readability.

                13. The goal is understanding, not just giving a
                    definition.
                """;


        // =====================================================
        // USER QUESTION + RETRIEVED MATERIAL
        // =====================================================

        String userPrompt = """
                Uploaded Study Material Context:

                %s


                Student Question:

                %s


                Answer the student's question using the study
                material context and the instructions provided.
                """.formatted(
                context,
                question
        );


        // =====================================================
        // CALL GEMINI
        // =====================================================

        try {

            return chatClient
                    .prompt()
                    .system(systemPrompt)
                    .user(userPrompt)
                    .call()
                    .content();

        } catch (Exception e) {

            // =================================================
            // GEMINI 429 / QUOTA ERROR
            // =================================================

            if (containsError(
                    e,
                    "429"
            ) ||
                    containsError(
                            e,
                            "quota"
                    ) ||
                    containsError(
                            e,
                            "resource exhausted"
                    ) ||
                    containsError(
                            e,
                            "rate limit"
                    )) {

                throw new RuntimeException(
                        "Gemini request limit was reached temporarily. " +
                                "Please wait a little while and try again.",
                        e
                );
            }


            // =================================================
            // GEMINI 503 / HIGH DEMAND
            // =================================================

            if (containsError(
                    e,
                    "503"
            ) ||
                    containsError(
                            e,
                            "high demand"
                    ) ||
                    containsError(
                            e,
                            "service unavailable"
                    )) {

                throw new RuntimeException(
                        "Gemini is temporarily unavailable because " +
                                "the service is experiencing high demand. " +
                                "Please try again later.",
                        e
                );
            }


            // =================================================
            // OTHER AI ERROR
            // =================================================

            throw new RuntimeException(
                    "Unable to generate an answer right now. " +
                            "Please try again later.",
                    e
            );
        }
    }


    private boolean containsError(
            Throwable throwable,
            String text) {

        Throwable current =
                throwable;

        while (current != null) {

            String message =
                    current.getMessage();

            if (message != null &&
                    message
                            .toLowerCase()
                            .contains(
                                    text.toLowerCase()
                            )) {

                return true;
            }

            current =
                    current.getCause();
        }

        return false;
    }
}