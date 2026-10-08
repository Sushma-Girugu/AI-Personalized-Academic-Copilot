package com.sushma.githubassistant.controller;

import com.sushma.githubassistant.service.WeakTopicService;

import jakarta.servlet.http.HttpSession;

import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/weak-topics")
public class WeakTopicController {

    private final WeakTopicService weakTopicService;

    public WeakTopicController(
            WeakTopicService weakTopicService) {

        this.weakTopicService =
                weakTopicService;
    }

    @GetMapping
    public List<Map<String, Object>> getWeakTopics(
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

        return weakTopicService
                .getWeakTopics(userId);
    }
}