package com.sushma.githubassistant.service;

import com.sushma.githubassistant.model.StudyMaterial;
import com.sushma.githubassistant.repository.StudyMaterialRepository;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class StudyPlanService {

    private final WeakTopicService weakTopicService;
    private final StudyMaterialRepository studyMaterialRepository;

    public StudyPlanService(
            WeakTopicService weakTopicService,
            StudyMaterialRepository studyMaterialRepository) {

        this.weakTopicService =
                weakTopicService;

        this.studyMaterialRepository =
                studyMaterialRepository;
    }


    // =========================================================
    // GENERATE PERSONALIZED STUDY PLAN
    // =========================================================

    public List<Map<String, Object>> generateStudyPlan(
            Long userId) {

        List<Map<String, Object>> weakTopics =
                weakTopicService.getWeakTopics(userId);

        List<Map<String, Object>> studyPlan =
                new ArrayList<>();


        if (weakTopics.isEmpty()) {
            return studyPlan;
        }


        // Get only this user's study materials
        List<StudyMaterial> materials =
                studyMaterialRepository
                        .findByUserId(userId);


        int day = 1;


        for (Map<String, Object> topicData :
                weakTopics) {

            String topic =
                    String.valueOf(
                            topicData.get("topic")
                    );


            double percentage =
                    ((Number)
                            topicData.get(
                                    "averagePercentage"
                            ))
                            .doubleValue();


            String status =
                    String.valueOf(
                            topicData.get("status")
                    );


            // GOOD topics do not need a study plan
            if ("GOOD".equals(status)) {
                continue;
            }


            // -------------------------------------------------
            // FIND RELEVANT STUDY MATERIAL
            // -------------------------------------------------

            StudyMaterial relevantMaterial =
                    findRelevantMaterial(
                            topic,
                            materials
                    );


            // -------------------------------------------------
            // CREATE PLAN
            // -------------------------------------------------

            Map<String, Object> plan =
                    new LinkedHashMap<>();


            plan.put(
                    "day",
                    day
            );


            plan.put(
                    "topic",
                    topic
            );


            plan.put(
                    "currentPercentage",
                    percentage
            );


            plan.put(
                    "priority",
                    getPriority(
                            percentage
                    )
            );


            // -------------------------------------------------
            // MATERIAL INFORMATION
            // -------------------------------------------------

            if (relevantMaterial != null) {

                plan.put(
                        "materialId",
                        relevantMaterial.getId()
                );


                plan.put(
                        "materialTitle",
                        relevantMaterial.getTitle()
                );


                String subjectName =
                        "Not specified";


                if (relevantMaterial.getSubject() != null) {

                    subjectName =
                            relevantMaterial
                                    .getSubject()
                                    .getName();

                }


                plan.put(
                        "subject",
                        subjectName
                );


                String relevantContent =
                        extractRelevantContent(
                                relevantMaterial
                                        .getExtractedText(),
                                topic
                        );


                plan.put(
                        "revisionContent",
                        relevantContent
                );

            } else {

                plan.put(
                        "materialId",
                        null
                );


                plan.put(
                        "materialTitle",
                        "No matching study material found"
                );


                plan.put(
                        "subject",
                        "Not available"
                );


                plan.put(
                        "revisionContent",
                        "No specific section containing this topic was found in the uploaded study materials."
                );

            }


            // -------------------------------------------------
            // ACTIVITIES
            // -------------------------------------------------

            List<String> activities =
                    new ArrayList<>();


            if (relevantMaterial != null) {

                activities.add(
                        "Review the relevant section from \"" +
                                relevantMaterial.getTitle() +
                                "\"."
                );

            } else {

                activities.add(
                        "Review the uploaded study materials for this topic."
                );

            }


            if (percentage < 50) {

                activities.add(
                        "Relearn the basic concepts and algorithm steps."
                );

                activities.add(
                        "Practice simple questions related to " +
                                topic +
                                "."
                );

                activities.add(
                        "Solve at least 3 practice problems before retaking the quiz."
                );

            } else {

                activities.add(
                        "Review the concepts where mistakes were made."
                );

                activities.add(
                        "Practice application-based questions related to " +
                                topic +
                                "."
                );

                activities.add(
                        "Retake the quiz and try to improve your previous score."
                );

            }


            plan.put(
                    "activities",
                    activities
            );


            studyPlan.add(plan);

            day++;
        }


        return studyPlan;
    }


    // =========================================================
    // FIND MATERIAL RELEVANT TO TOPIC
    // =========================================================

    private StudyMaterial findRelevantMaterial(
            String topic,
            List<StudyMaterial> materials) {

        if (topic == null ||
                topic.trim().isEmpty() ||
                materials == null ||
                materials.isEmpty()) {

            return null;
        }


        String cleanTopic =
                topic
                        .toLowerCase()
                        .trim();


        String[] topicWords =
                cleanTopic
                        .split("\\s+");


        StudyMaterial bestMaterial =
                null;


        int bestScore = 0;


        for (StudyMaterial material :
                materials) {

            String extractedText =
                    material.getExtractedText();


            if (extractedText == null ||
                    extractedText.trim().isEmpty()) {

                continue;
            }


            String text =
                    extractedText
                            .toLowerCase();


            int score = 0;


            // Exact topic match gets strong priority
            if (text.contains(cleanTopic)) {

                score += 10;

            }


            // Count individual topic words
            for (String word : topicWords) {

                if (word.length() < 2) {
                    continue;
                }


                if (text.contains(word)) {

                    score += 1;

                }

            }


            if (score > bestScore) {

                bestScore = score;

                bestMaterial = material;

            }

        }


        return bestMaterial;
    }


    // =========================================================
    // EXTRACT RELEVANT CONTENT FROM PDF
    // =========================================================

    private String extractRelevantContent(
            String extractedText,
            String topic) {

        if (extractedText == null ||
                extractedText.trim().isEmpty()) {

            return "No extracted content is available for this study material.";
        }


        String text =
                extractedText.trim();


        String lowerText =
                text.toLowerCase();


        String lowerTopic =
                topic
                        .toLowerCase()
                        .trim();


        int position =
                lowerText.indexOf(
                        lowerTopic
                );


        // -----------------------------------------------------
        // Exact topic found
        // -----------------------------------------------------

        if (position >= 0) {

            int start =
                    Math.max(
                            0,
                            position - 250
                    );


            int end =
                    Math.min(
                            text.length(),
                            position +
                                    lowerTopic.length() +
                                    650
                    );


            String excerpt =
                    text.substring(
                            start,
                            end
                    ).trim();


            return cleanExcerpt(
                    excerpt
            );
        }


        // -----------------------------------------------------
        // Exact topic not found
        // Try first topic word
        // -----------------------------------------------------

        String[] words =
                lowerTopic.split("\\s+");


        for (String word : words) {

            if (word.length() < 3) {
                continue;
            }


            position =
                    lowerText.indexOf(
                            word
                    );


            if (position >= 0) {

                int start =
                        Math.max(
                                0,
                                position - 250
                        );


                int end =
                        Math.min(
                                text.length(),
                                position + 650
                        );


                String excerpt =
                        text.substring(
                                start,
                                end
                        ).trim();


                return cleanExcerpt(
                        excerpt
                );
            }
        }


        return "The topic was not found directly in the extracted study material text.";
    }


    // =========================================================
    // CLEAN EXTRACTED CONTENT
    // =========================================================

    private String cleanExcerpt(
            String excerpt) {

        if (excerpt == null ||
                excerpt.isEmpty()) {

            return "No relevant content found.";
        }


        // Remove excessive whitespace
        excerpt =
                excerpt
                        .replaceAll(
                                "\\s+",
                                " "
                        )
                        .trim();


        // Keep the response readable
        if (excerpt.length() > 900) {

            excerpt =
                    excerpt.substring(
                            0,
                            900
                    ).trim();

            excerpt += "...";

        }


        return excerpt;
    }


    // =========================================================
    // PRIORITY
    // =========================================================

    private String getPriority(
            double percentage) {

        if (percentage < 50) {
            return "HIGH";
        }


        if (percentage < 70) {
            return "MEDIUM";
        }


        return "LOW";
    }
}