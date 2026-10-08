package com.sushma.githubassistant.controller;

import com.sushma.githubassistant.service.StudyPlanService;

import jakarta.servlet.http.HttpSession;

import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/study-plan")
public class StudyPlanController {

    private final StudyPlanService studyPlanService;

    public StudyPlanController(
            StudyPlanService studyPlanService) {

        this.studyPlanService =
                studyPlanService;
    }

    @GetMapping
    public List<Map<String, Object>> getStudyPlan(
            HttpSession session) {

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

        return studyPlanService
                .generateStudyPlan(userId);
    }
}