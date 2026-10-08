package com.sushma.githubassistant.controller;

import com.sushma.githubassistant.service.QuizService;
import jakarta.servlet.http.HttpSession;
import org.springframework.web.bind.annotation.*;
import tools.jackson.databind.JsonNode;

@RestController
@RequestMapping("/api/quiz")
public class QuizController {

    private final QuizService quizService;

    public QuizController(QuizService quizService) {
        this.quizService = quizService;
    }

    @PostMapping("/generate")
    public JsonNode generateQuiz(

            @RequestParam Long materialId,

            @RequestParam String topic,

            @RequestParam(defaultValue = "5")
            int numberOfQuestions,

            HttpSession session) {


        // =====================================================
        // CHECK LOGIN
        // =====================================================

        Object userIdObject =
                session.getAttribute("userId");

        if (userIdObject == null) {

            throw new RuntimeException(
                    "Please login first."
            );
        }


        Long userId =
                ((Number) userIdObject).longValue();


        // =====================================================
        // VALIDATE NUMBER OF QUESTIONS
        // =====================================================

        if (numberOfQuestions < 1 ||
                numberOfQuestions > 10) {

            throw new RuntimeException(
                    "Number of questions must be between 1 and 10."
            );
        }


        // =====================================================
        // GENERATE QUIZ
        // =====================================================

        return quizService.generateQuiz(
                userId,
                materialId,
                topic,
                numberOfQuestions
        );
    }
}