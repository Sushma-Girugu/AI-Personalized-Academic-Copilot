package com.sushma.githubassistant.service;

import com.sushma.githubassistant.model.QuizAttempt;
import com.sushma.githubassistant.model.StudyMaterial;
import com.sushma.githubassistant.model.User;
import com.sushma.githubassistant.repository.QuizAttemptRepository;
import com.sushma.githubassistant.repository.StudyMaterialRepository;
import com.sushma.githubassistant.repository.UserRepository;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class QuizAttemptService {

    private final QuizAttemptRepository quizAttemptRepository;

    private final UserRepository userRepository;

    private final StudyMaterialRepository studyMaterialRepository;


    public QuizAttemptService(
            QuizAttemptRepository quizAttemptRepository,
            UserRepository userRepository,
            StudyMaterialRepository studyMaterialRepository) {

        this.quizAttemptRepository =
                quizAttemptRepository;

        this.userRepository =
                userRepository;

        this.studyMaterialRepository =
                studyMaterialRepository;
    }


    public Map<String, Object> calculateScore(
            Long userId,
            Long materialId,
            String topic,
            int correctAnswers,
            Map<String, Object> studentAnswers) {

        // =====================================================
        // 1. VALIDATE INPUT
        // =====================================================

        if (topic == null ||
                topic.trim().isEmpty()) {

            throw new RuntimeException(
                    "Quiz topic is required."
            );
        }

        if (correctAnswers < 0) {

            throw new RuntimeException(
                    "Correct answer count cannot be negative."
            );
        }

        if (studentAnswers == null) {

            studentAnswers =
                    new HashMap<>();
        }


        // =====================================================
        // 2. VERIFY USER
        // =====================================================

        User user =
                userRepository
                        .findById(userId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "User not found."
                                )
                        );


        // =====================================================
        // 3. VERIFY MATERIAL BELONGS TO USER
        // =====================================================

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


        // =====================================================
        // 4. CALCULATE SCORE
        // =====================================================

        int totalQuestions =
                studentAnswers.size();

        if (correctAnswers > totalQuestions) {

            throw new RuntimeException(
                    "Correct answers cannot be greater than total questions."
            );
        }

        int wrongAnswers =
                totalQuestions -
                        correctAnswers;


        double percentage =
                totalQuestions == 0
                        ? 0
                        : (correctAnswers * 100.0)
                        / totalQuestions;


        // =====================================================
        // 5. SAVE QUIZ ATTEMPT
        // =====================================================

        QuizAttempt attempt =
                new QuizAttempt();

        attempt.setUser(user);

        attempt.setStudyMaterial(
                material
        );

        attempt.setTopic(
                topic.trim()
        );

        attempt.setTotalQuestions(
                totalQuestions
        );

        attempt.setCorrectAnswers(
                correctAnswers
        );

        attempt.setWrongAnswers(
                wrongAnswers
        );

        attempt.setPercentage(
                percentage
        );

        attempt.setAttemptedAt(
                LocalDateTime.now()
        );

        quizAttemptRepository.save(
                attempt
        );


        // =====================================================
        // 6. RETURN RESULT
        // =====================================================

        return Map.of(

                "attemptId",
                attempt.getId(),

                "topic",
                topic.trim(),

                "totalQuestions",
                totalQuestions,

                "correctAnswers",
                correctAnswers,

                "wrongAnswers",
                wrongAnswers,

                "score",
                correctAnswers,

                "percentage",
                percentage,

                "message",
                "Quiz attempt saved successfully."
        );
    }
}