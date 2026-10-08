package com.sushma.githubassistant.controller;

import com.sushma.githubassistant.model.QuizAttempt;
import com.sushma.githubassistant.repository.QuizAttemptRepository;

import jakarta.servlet.http.HttpSession;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/quiz")
public class QuizHistoryController {

    private final QuizAttemptRepository quizAttemptRepository;

    public QuizHistoryController(
            QuizAttemptRepository quizAttemptRepository) {

        this.quizAttemptRepository =
                quizAttemptRepository;
    }

    @GetMapping("/history")
    public List<QuizAttempt> getQuizHistory(
            HttpSession session) {

        Long userId = getLoggedInUserId(session);

        return quizAttemptRepository
                .findByUserIdOrderByAttemptedAtDesc(userId);
    }

    private Long getLoggedInUserId(
            HttpSession session) {

        Object userIdObject =
                session.getAttribute("userId");

        if (userIdObject == null) {

            throw new RuntimeException(
                    "Please login first."
            );
        }

        return ((Number) userIdObject)
                .longValue();
    }
}