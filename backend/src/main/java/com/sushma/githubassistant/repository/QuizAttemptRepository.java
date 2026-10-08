package com.sushma.githubassistant.repository;

import com.sushma.githubassistant.model.QuizAttempt;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QuizAttemptRepository
        extends JpaRepository<QuizAttempt, Long> {

    List<QuizAttempt> findByUserIdOrderByAttemptedAtDesc(
            Long userId
    );

    List<QuizAttempt> findByUserIdAndTopicIgnoreCase(
            Long userId,
            String topic
    );
}