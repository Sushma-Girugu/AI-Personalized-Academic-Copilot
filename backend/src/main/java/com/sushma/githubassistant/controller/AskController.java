package com.sushma.githubassistant.controller;

import com.sushma.githubassistant.service.RagService;

import jakarta.servlet.http.HttpSession;

import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class AskController {

    private final RagService ragService;


    public AskController(
            RagService ragService) {

        this.ragService =
                ragService;
    }


    @PostMapping("/ask")
    public Map<String, String> askQuestion(
            @RequestBody Map<String, String> request,
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


        String question =
                request.get("question");


        String answer =
                ragService.askQuestion(
                        question,
                        userId
                );


        return Map.of(
                "question",
                question,

                "answer",
                answer
        );
    }
}