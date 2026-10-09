package com.sushma.githubassistant.service;

import com.sushma.githubassistant.model.StudyMaterial;
import com.sushma.githubassistant.repository.StudyMaterialRepository;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Service;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.util.List;

@Service
public class QuizService {

    private final VectorStore vectorStore;
    private final ChatClient chatClient;
    private final StudyMaterialRepository studyMaterialRepository;
    private final ObjectMapper objectMapper;


    public QuizService(
            VectorStore vectorStore,
            ChatClient.Builder chatClientBuilder,
            StudyMaterialRepository studyMaterialRepository,
            ObjectMapper objectMapper) {

        this.vectorStore = vectorStore;

        this.chatClient =
                chatClientBuilder.build();

        this.studyMaterialRepository =
                studyMaterialRepository;

        this.objectMapper =
                objectMapper;
    }


    // =====================================================
    // GENERATE QUIZ
    // =====================================================

    public JsonNode generateQuiz(
            Long userId,
            Long materialId,
            String topic,
            int numberOfQuestions) {


        // =================================================
        // 1. VALIDATE INPUT
        // =================================================

        if (userId == null) {

            throw new RuntimeException(
                    "Please login first."
            );
        }


        if (materialId == null) {

            throw new RuntimeException(
                    "Study material is required."
            );
        }


        if (topic == null ||
                topic.trim().isEmpty()) {

            throw new RuntimeException(
                    "Quiz topic is required."
            );
        }


        if (numberOfQuestions < 1 ||
                numberOfQuestions > 10) {

            throw new RuntimeException(
                    "Number of questions must be between 1 and 10."
            );
        }


        String cleanTopic =
                topic.trim();


        // =================================================
        // 2. VERIFY MATERIAL BELONGS TO USER
        // =================================================

        StudyMaterial material =
                studyMaterialRepository
                        .findByIdAndUserId(
                                materialId,
                                userId
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Study material not found."
                                )
                        );


        // =================================================
        // 3. VERIFY EXTRACTED TEXT
        // =================================================

        String extractedText =
                material.getExtractedText();


        if (extractedText == null ||
                extractedText.trim().isEmpty()) {

            throw new RuntimeException(
                    "The selected study material does not contain extracted text."
            );
        }


        // =================================================
        // 4. SEARCH QDRANT
        //
        // Search only:
        // - current user
        // - selected material
        // =================================================

        List<Document> documents =
                vectorStore.similaritySearch(

                        SearchRequest.builder()

                                .query(cleanTopic)

                                .topK(8)

                                .similarityThreshold(
                                        0.55
                                )

                                .filterExpression(
                                        "userId == '" +
                                                userId +
                                                "' && materialId == '" +
                                                materialId +
                                                "'"
                                )

                                .build()
                );


        // =================================================
        // 5. CHECK TOPIC IN QDRANT RESULTS AND EXTRACTED TEXT
        // =================================================

        boolean topicFoundInVectorResults =
                isTopicRelevant(cleanTopic, documents);

        boolean topicFoundInExtractedText =
                isTopicRelevantInText(cleanTopic, extractedText);

        if (!topicFoundInVectorResults &&
                !topicFoundInExtractedText) {

            throw new RuntimeException(
                    "The topic '" +
                            cleanTopic +
                            "' was not found in the selected study material. " +
                            "Please enter a topic related to this PDF."
            );
        }


        // =================================================
        // 6. BUILD CONTEXT
        // Use Qdrant chunks when relevant. If Qdrant returns
        // no useful chunks, fall back to the selected PDF's
        // already-extracted text instead of rejecting a valid topic.
        // =================================================

        StringBuilder context =
                new StringBuilder();

        if (topicFoundInVectorResults) {

            for (Document document : documents) {

                if (document.getText() != null &&
                        !document.getText().trim().isEmpty()) {

                    context.append(document.getText());
                    context.append("\n\n");
                }
            }
        }

        if (context.toString().trim().isEmpty()) {
            context.append(extractedText);
        }

        if (context.toString().trim().isEmpty()) {

            throw new RuntimeException(
                    "No relevant study material was found for this topic."
            );
        }


        // =================================================
        // 7. CREATE GEMINI PROMPT
        // =================================================

        String prompt = """
                You are an AI Academic Copilot.

                Your task is to generate a multiple-choice quiz
                for a student using ONLY the provided study
                material context.

                ==================================================
                IMPORTANT RULES
                ==================================================

                1. Generate exactly %d questions.

                2. Questions must be based ONLY on the
                   provided study material context.

                3. The quiz topic is:
                   %s

                4. Every question must be directly related
                   to the requested topic.

                5. Do NOT use outside knowledge.

                6. Do NOT generate questions about another topic
                   just because that topic appears in the context.

                7. Each question must have exactly four options.

                8. Options must be A, B, C and D.

                9. Provide the correct answer as A, B, C or D.

                10. Provide a short explanation based only
                    on the provided context.

                11. Questions should test understanding of the
                    material rather than simply copying sentences.

                12. Return ONLY valid JSON.

                13. Do NOT use Markdown.

                14. Do NOT use code fences.

                ==================================================
                STUDY MATERIAL CONTEXT
                ==================================================

                %s

                ==================================================
                QUIZ TOPIC
                ==================================================

                %s

                ==================================================
                RETURN EXACTLY THIS FORMAT
                ==================================================

                {
                  "topic": "%s",
                  "questions": [
                    {
                      "question": "question text",
                      "options": {
                        "A": "option A",
                        "B": "option B",
                        "C": "option C",
                        "D": "option D"
                      },
                      "correctAnswer": "A",
                      "explanation": "short explanation"
                    }
                  ]
                }
                """.formatted(
                numberOfQuestions,
                cleanTopic,
                context,
                cleanTopic,
                cleanTopic
        );


        // =================================================
        // 8. CALL GEMINI
        //
        // Retry once for temporary 503 errors.
        // =================================================

        String response = null;

        int maxAttempts = 2;


        for (
                int attempt = 1;
                attempt <= maxAttempts;
                attempt++
        ) {

            try {

                System.out.println(
                        "========================================"
                );

                System.out.println(
                        "Gemini quiz generation attempt " +
                                attempt +
                                " of " +
                                maxAttempts
                );

                System.out.println(
                        "Topic: " +
                                cleanTopic
                );

                System.out.println(
                        "Material ID: " +
                                materialId
                );

                System.out.println(
                        "User ID: " +
                                userId
                );

                System.out.println(
                        "Questions: " +
                                numberOfQuestions
                );

                System.out.println(
                        "========================================"
                );


                response =
                        chatClient
                                .prompt()
                                .user(prompt)
                                .call()
                                .content();


                // Gemini successfully responded

                break;


            } catch (Exception e) {


                // =========================================
                // PRINT COMPLETE ERROR
                // =========================================

                System.out.println(
                        "========================================"
                );

                System.out.println(
                        "Gemini attempt " +
                                attempt +
                                " failed."
                );

                System.out.println(
                        "Exception type: " +
                                e.getClass().getName()
                );

                System.out.println(
                        "Reason: " +
                                (
                                        e.getMessage() == null
                                                ? "No message"
                                                : e.getMessage()
                                )
                );

                System.out.println(
                        "Full exception:"
                );

                e.printStackTrace();

                System.out.println(
                        "========================================"
                );


                // =========================================
                // CHECK COMPLETE EXCEPTION CHAIN
                // =========================================

                boolean is503 =
                        containsError(
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
                                );


                boolean is429 =
                        containsError(
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
                                );


                boolean is404 =
                        containsError(
                                e,
                                "404"
                        ) ||
                                containsError(
                                        e,
                                        "not found"
                                );


                // =========================================
                // RETRY 503
                // =========================================

                if (
                        is503 &&
                                attempt < maxAttempts
                ) {

                    System.out.println(
                            "Gemini returned a temporary 503 error."
                    );

                    System.out.println(
                            "Waiting 3 seconds before retry..."
                    );


                    try {

                        Thread.sleep(3000);

                    } catch (
                            InterruptedException interruptedException
                    ) {

                        Thread.currentThread()
                                .interrupt();

                        throw new RuntimeException(
                                "Quiz generation was interrupted."
                        );
                    }


                    continue;
                }


                // =========================================
                // 429 QUOTA ERROR
                // =========================================

                if (is429) {

                    throw new RuntimeException(
                            "Gemini request limit was reached temporarily. " +
                                    "Please wait a little while and try again.",
                            e
                    );
                }


                // =========================================
                // 404 MODEL ERROR
                // =========================================

                if (is404) {

                    throw new RuntimeException(
                            "The configured Gemini model is unavailable. " +
                                    "Please check the Gemini model configuration.",
                            e
                    );
                }


                // =========================================
                // 503 AFTER RETRY
                // =========================================

                if (is503) {

                    throw new RuntimeException(
                            "Gemini is temporarily unavailable because " +
                                    "the model is experiencing high demand. " +
                                    "Please wait a little while and try again.",
                            e
                    );
                }


                // =========================================
                // OTHER GEMINI ERROR
                // =========================================

                throw new RuntimeException(
                        "Unable to contact Gemini right now. " +
                                "Please try again.",
                        e
                );
            }
        }


        // =================================================
        // 9. CHECK RESPONSE
        // =================================================

        if (
                response == null ||
                        response.trim().isEmpty()
        ) {

            throw new RuntimeException(
                    "Gemini returned an empty response."
            );
        }


        response =
                response.trim();


        // =================================================
        // 10. REMOVE MARKDOWN CODE FENCES
        // =================================================

        if (
                response.startsWith(
                        "```json"
                )
        ) {

            response =
                    response
                            .substring(7)
                            .trim();

        } else if (
                response.startsWith(
                        "```"
                )
        ) {

            response =
                    response
                            .substring(3)
                            .trim();
        }


        if (
                response.endsWith(
                        "```"
                )
        ) {

            response =
                    response.substring(
                            0,
                            response.length() - 3
                    ).trim();
        }


        // =================================================
        // 11. PARSE JSON
        // =================================================

        try {

            JsonNode quiz =
                    objectMapper.readTree(
                            response
                    );


            // =================================================
            // 12. VALIDATE QUESTIONS
            // =================================================

            if (
                    !quiz.has("questions") ||
                            !quiz
                                    .get("questions")
                                    .isArray()
            ) {

                throw new RuntimeException(
                        "Gemini returned an invalid quiz format."
                );
            }


            if (
                    quiz
                            .get("questions")
                            .size() == 0
            ) {

                throw new RuntimeException(
                        "Gemini returned no quiz questions."
                );
            }


            // =================================================
            // 13. VALIDATE EACH QUESTION
            // =================================================

            JsonNode questions =
                    quiz.get("questions");


            for (
                    int i = 0;
                    i < questions.size();
                    i++
            ) {

                JsonNode question =
                        questions.get(i);


                if (
                        !question.has("question") ||
                                !question.has("options") ||
                                !question.has("correctAnswer")
                ) {

                    throw new RuntimeException(
                            "Question " +
                                    (i + 1) +
                                    " has an invalid format."
                    );
                }


                JsonNode options =
                        question.get("options");


                if (
                        !options.has("A") ||
                                !options.has("B") ||
                                !options.has("C") ||
                                !options.has("D")
                ) {

                    throw new RuntimeException(
                            "Question " +
                                    (i + 1) +
                                    " must contain four options: A, B, C and D."
                    );
                }


                String correctAnswer =
                        options.has(
                                question
                                        .get("correctAnswer")
                                        .asText()
                        )
                                ? question
                                .get("correctAnswer")
                                .asText()
                                : "";


                if (
                        correctAnswer.isEmpty()
                ) {

                    throw new RuntimeException(
                            "Question " +
                                    (i + 1) +
                                    " contains an invalid correct answer."
                    );
                }
            }


            // =================================================
            // 14. RETURN QUIZ
            // =================================================

            return quiz;


        } catch (RuntimeException e) {

            throw e;


        } catch (Exception e) {

            System.out.println(
                    "========================================"
            );

            System.out.println(
                    "Quiz JSON parsing failed."
            );

            System.out.println(
                    "Gemini response:"
            );

            System.out.println(
                    response
            );

            System.out.println(
                    "========================================"
            );


            throw new RuntimeException(
                    "Gemini returned an invalid quiz response. " +
                            "Please try again.",
                    e
            );
        }
    }


    // =====================================================
    // TOPIC RELEVANCE CHECK AGAINST EXTRACTED PDF TEXT
    // =====================================================

    private boolean isTopicRelevantInText(
            String topic,
            String text) {

        if (topic == null || topic.trim().isEmpty() ||
                text == null || text.trim().isEmpty()) {
            return false;
        }

        String topicLower = topic
                .toLowerCase()
                .replaceAll("[^a-z0-9 ]", " ")
                .replaceAll("\\s+", " ")
                .trim();

        String textLower = text
                .toLowerCase()
                .replaceAll("[^a-z0-9 ]", " ")
                .replaceAll("\\s+", " ")
                .trim();

        String[] words = topicLower.split(" ");
        int meaningfulWords = 0;

        for (String word : words) {

            if (word.length() < 3) {
                continue;
            }

            if (word.equals("the") ||
                    word.equals("and") ||
                    word.equals("for") ||
                    word.equals("from") ||
                    word.equals("with") ||
                    word.equals("using") ||
                    word.equals("algorithm") ||
                    word.equals("concept") ||
                    word.equals("topic") ||
                    word.equals("method") ||
                    word.equals("problem")) {
                continue;
            }

            meaningfulWords++;

            // Match complete words, not partial words.
            if (java.util.Arrays.asList(textLower.split(" "))
                    .contains(word)) {
                return true;
            }
        }

        // Generic topics are allowed through validation; Gemini is
        // still instructed to use only the supplied study material.
        return meaningfulWords == 0;
    }


    // =====================================================
    // TOPIC RELEVANCE CHECK AGAINST QDRANT DOCUMENTS
    // =====================================================

    private boolean isTopicRelevant(
            String topic,
            List<Document> documents) {


        if (
                documents == null ||
                        documents.isEmpty()
        ) {

            return false;
        }


        // =================================================
        // CLEAN TOPIC
        // =================================================

        String topicLower =
                topic
                        .toLowerCase()
                        .replaceAll(
                                "[^a-z0-9 ]",
                                " "
                        )
                        .replaceAll(
                                "\\s+",
                                " "
                        )
                        .trim();


        // =================================================
        // BUILD CONTEXT
        // =================================================

        StringBuilder context =
                new StringBuilder();


        for (
                Document document :
                documents
        ) {

            if (
                    document.getText() != null
            ) {

                context
                        .append(" ")
                        .append(
                                document.getText()
                        );
            }
        }


        String contextLower =
                context
                        .toString()
                        .toLowerCase()
                        .replaceAll(
                                "[^a-z0-9 ]",
                                " "
                        )
                        .replaceAll(
                                "\\s+",
                                " "
                        );


        // =================================================
        // CHECK TOPIC WORDS
        // =================================================

        String[] words =
                topicLower.split(" ");


        int matchedWords = 0;

        int meaningfulWords = 0;


        for (
                String word :
                words
        ) {

            if (
                    word.length() < 3
            ) {

                continue;
            }


            // Ignore generic words

            if (
                    word.equals("the") ||
                            word.equals("and") ||
                            word.equals("for") ||
                            word.equals("from") ||
                            word.equals("with") ||
                            word.equals("using") ||
                            word.equals("algorithm") ||
                            word.equals("concept") ||
                            word.equals("topic") ||
                            word.equals("method") ||
                            word.equals("problem")
            ) {

                continue;
            }


            meaningfulWords++;


            if (
                    contextLower.contains(word)
            ) {

                matchedWords++;
            }
        }


        // =================================================
        // IF ONLY GENERIC WORDS WERE PROVIDED
        // =================================================

        if (
                meaningfulWords == 0
        ) {

            return true;
        }


        // =================================================
        // AT LEAST ONE MEANINGFUL TOPIC WORD
        // MUST APPEAR IN THE CONTEXT
        // =================================================

        return matchedWords >= 1;
    }


    // =====================================================
    // CHECK COMPLETE EXCEPTION CHAIN
    // =====================================================

    private boolean containsError(
            Throwable throwable,
            String searchText) {


        Throwable current =
                throwable;


        while (
                current != null
        ) {

            String message =
                    current.getMessage();


            if (
                    message != null &&
                            message
                                    .toLowerCase()
                                    .contains(
                                            searchText
                                                    .toLowerCase()
                                    )
            ) {

                return true;
            }


            String exceptionText =
                    current
                            .toString();


            if (
                    exceptionText
                            .toLowerCase()
                            .contains(
                                    searchText
                                            .toLowerCase()
                            )
            ) {

                return true;
            }


            current =
                    current.getCause();
        }


        return false;
    }
}
