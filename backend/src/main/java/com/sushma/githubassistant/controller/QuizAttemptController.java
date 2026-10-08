package com.sushma.githubassistant.controller;

import com.sushma.githubassistant.service.QuizAttemptService;

import jakarta.servlet.http.HttpSession;

import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/quiz")
public class QuizAttemptController {

    private final QuizAttemptService quizAttemptService;

    public QuizAttemptController(
            QuizAttemptService quizAttemptService) {

        this.quizAttemptService =
                quizAttemptService;
    }

    @PostMapping("/submit")
    public Map<String, Object> submitQuiz(
            @RequestBody Map<String, Object> request,
            HttpSession session) {

        // =====================================================
        // 1. CHECK LOGIN
        // =====================================================

        Object userIdObject =
                session.getAttribute("userId");

        if (userIdObject == null) {

            throw new RuntimeException(
                    "Please login first."
            );
        }

        Long userId =
                ((Number) userIdObject)
                        .longValue();


        // =====================================================
        // 2. GET MATERIAL ID
        // =====================================================

        Object materialIdObject =
                request.get("materialId");

        if (materialIdObject == null) {

            throw new RuntimeException(
                    "Material ID is required."
            );
        }

        Long materialId =
                ((Number) materialIdObject)
                        .longValue();


        // =====================================================
        // 3. GET TOPIC
        // =====================================================

        Object topicObject =
                request.get("topic");

        if (!(topicObject instanceof String)) {

            throw new RuntimeException(
                    "Quiz topic is required."
            );
        }

        String topic =
                ((String) topicObject).trim();

        if (topic.isEmpty()) {

            throw new RuntimeException(
                    "Quiz topic is required."
            );
        }


        // =====================================================
        // 4. GET CORRECT ANSWER COUNT
        // =====================================================

        Object correctAnswersObject =
                request.get("correctAnswers");

        if (!(correctAnswersObject instanceof Number)) {

            throw new RuntimeException(
                    "Correct answer count is required."
            );
        }

        int correctAnswers =
                ((Number) correctAnswersObject)
                        .intValue();


        // =====================================================
        // 5. GET STUDENT ANSWERS
        // =====================================================

        Object studentAnswersObject =
                request.get("studentAnswers");

        Map<String, Object> studentAnswers =
                null;

        if (studentAnswersObject instanceof Map) {

            studentAnswers =
                    (Map<String, Object>)
                            studentAnswersObject;
        }


        // =====================================================
        // 6. SAVE QUIZ ATTEMPT
        // =====================================================

        return quizAttemptService.calculateScore(
                userId,
                materialId,
                topic,
                correctAnswers,
                studentAnswers
        );
    }
}