package com.sushma.githubassistant.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // =========================================================
    // RUNTIME EXCEPTIONS
    // =========================================================

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntimeException(
            RuntimeException e) {

        // Print complete error in IntelliJ console
        e.printStackTrace();

        String message = e.getMessage();

        if (message == null || message.isBlank()) {
            message = "Something went wrong.";
        }

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(
                        Map.of(
                                "message",
                                message
                        )
                );
    }


    // =========================================================
    // ALL OTHER EXCEPTIONS
    // =========================================================

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleException(
            Exception e) {

        // Print complete error in IntelliJ console
        e.printStackTrace();

        String message = e.getMessage();

        if (message == null || message.isBlank()) {
            message =
                    "Something went wrong while processing your request.";
        }

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(
                        Map.of(
                                "message",
                                message
                        )
                );
    }
}