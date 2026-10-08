package com.sushma.githubassistant.service;

import com.sushma.githubassistant.model.QuizAttempt;
import com.sushma.githubassistant.repository.QuizAttemptRepository;

import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class WeakTopicService {

    private final QuizAttemptRepository quizAttemptRepository;

    public WeakTopicService(
            QuizAttemptRepository quizAttemptRepository) {

        this.quizAttemptRepository =
                quizAttemptRepository;
    }

    public List<Map<String, Object>> getWeakTopics(
            Long userId) {

        List<QuizAttempt> attempts =
                quizAttemptRepository
                        .findByUserIdOrderByAttemptedAtDesc(
                                userId
                        );

        if (attempts.isEmpty()) {
            return new ArrayList<>();
        }

        Map<String, List<QuizAttempt>> topicAttempts =
                new HashMap<>();

        for (QuizAttempt attempt : attempts) {

            String topic =
                    attempt.getTopic()
                            .trim()
                            .toLowerCase();

            topicAttempts
                    .computeIfAbsent(
                            topic,
                            key -> new ArrayList<>()
                    )
                    .add(attempt);
        }

        List<Map<String, Object>> weakTopics =
                new ArrayList<>();

        for (Map.Entry<String, List<QuizAttempt>> entry :
                topicAttempts.entrySet()) {

            String topic = entry.getKey();

            List<QuizAttempt> topicResults =
                    entry.getValue();

            double totalPercentage = 0;

            for (QuizAttempt attempt :
                    topicResults) {

                totalPercentage +=
                        attempt.getPercentage();
            }

            double averagePercentage =
                    totalPercentage /
                            topicResults.size();

            Map<String, Object> result =
                    new LinkedHashMap<>();

            result.put(
                    "topic",
                    formatTopicName(topic)
            );

            result.put(
                    "averagePercentage",
                    Math.round(
                            averagePercentage * 100.0
                    ) / 100.0
            );

            result.put(
                    "attempts",
                    topicResults.size()
            );

            result.put(
                    "status",
                    getStatus(averagePercentage)
            );

            weakTopics.add(result);
        }

        weakTopics.sort(
                Comparator.comparingDouble(
                        item ->
                                ((Number)
                                        item.get(
                                                "averagePercentage"
                                        ))
                                        .doubleValue()
                )
        );

        return weakTopics;
    }

    private String getStatus(
            double percentage) {

        if (percentage < 50) {
            return "WEAK";
        }

        if (percentage < 70) {
            return "NEEDS_IMPROVEMENT";
        }

        return "GOOD";
    }

    private String formatTopicName(
            String topic) {

        String[] words =
                topic.split("\\s+");

        StringBuilder result =
                new StringBuilder();

        for (String word : words) {

            if (word.isEmpty()) {
                continue;
            }

            result.append(
                    Character.toUpperCase(
                            word.charAt(0)
                    )
            );

            if (word.length() > 1) {
                result.append(
                        word.substring(1)
                );
            }

            result.append(" ");
        }

        return result
                .toString()
                .trim();
    }
}