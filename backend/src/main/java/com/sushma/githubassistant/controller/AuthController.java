package com.sushma.githubassistant.controller;

import com.sushma.githubassistant.model.User;
import com.sushma.githubassistant.service.AuthService;

import jakarta.servlet.http.HttpSession;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(
        origins = {
                "http://localhost:5173",
                "http://localhost:5174"
        },
        allowCredentials = "true"
)
public class AuthController {

    private final AuthService authService;


    public AuthController(
            AuthService authService) {

        this.authService =
                authService;
    }


    // =========================================================
    // REGISTER
    // =========================================================

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(
            @RequestBody Map<String, String> request) {

        try {

            String name =
                    request.get("name");

            String email =
                    request.get("email");

            String password =
                    request.get("password");


            if (name == null ||
                    name.trim().isEmpty()) {

                return ResponseEntity
                        .badRequest()
                        .body(Map.of(
                                "message",
                                "Name is required."
                        ));
            }


            if (email == null ||
                    email.trim().isEmpty()) {

                return ResponseEntity
                        .badRequest()
                        .body(Map.of(
                                "message",
                                "Email is required."
                        ));
            }


            if (password == null ||
                    password.isEmpty()) {

                return ResponseEntity
                        .badRequest()
                        .body(Map.of(
                                "message",
                                "Password is required."
                        ));
            }


            User user =
                    authService.register(
                            name.trim(),
                            email.trim(),
                            password
                    );


            // IMPORTANT:
            // DO NOT CREATE SESSION HERE.
            //
            // Registration only creates the account.
            // User must login separately.


            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(Map.of(
                            "message",
                            "Registration successful. Please login.",

                            "userId",
                            user.getId(),

                            "name",
                            user.getName(),

                            "email",
                            user.getEmail()
                    ));

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(Map.of(
                            "message",
                            e.getMessage() != null
                                    ? e.getMessage()
                                    : "Registration failed."
                    ));
        }
    }


    // =========================================================
    // LOGIN
    // =========================================================

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(
            @RequestBody Map<String, String> request,
            HttpSession session) {

        try {

            String email =
                    request.get("email");

            String password =
                    request.get("password");


            if (email == null ||
                    email.trim().isEmpty()) {

                return ResponseEntity
                        .badRequest()
                        .body(Map.of(
                                "message",
                                "Email is required."
                        ));
            }


            if (password == null ||
                    password.isEmpty()) {

                return ResponseEntity
                        .badRequest()
                        .body(Map.of(
                                "message",
                                "Password is required."
                        ));
            }


            User user =
                    authService.login(
                            email.trim(),
                            password
                    );


            // =================================================
            // CREATE SESSION ONLY AFTER SUCCESSFUL LOGIN
            // =================================================

            session.setAttribute(
                    "userId",
                    user.getId()
            );

            session.setAttribute(
                    "userName",
                    user.getName()
            );

            session.setAttribute(
                    "userEmail",
                    user.getEmail()
            );


            return ResponseEntity
                    .ok()
                    .body(Map.of(
                            "message",
                            "Login successful.",

                            "userId",
                            user.getId(),

                            "name",
                            user.getName(),

                            "email",
                            user.getEmail()
                    ));

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                            "message",
                            e.getMessage() != null
                                    ? e.getMessage()
                                    : "Invalid email or password."
                    ));
        }
    }


    // =========================================================
    // CURRENT USER
    // =========================================================

    @GetMapping("/me")
    public Map<String, Object> currentUser(
            HttpSession session) {

        Object userId =
                session.getAttribute("userId");


        if (userId == null) {

            return Map.of(
                    "loggedIn",
                    false
            );
        }


        return Map.of(
                "loggedIn",
                true,

                "userId",
                userId,

                "name",
                session.getAttribute(
                        "userName"
                ),

                "email",
                session.getAttribute(
                        "userEmail"
                )
        );
    }


    // =========================================================
    // LOGOUT
    // =========================================================

    @PostMapping("/logout")
    public Map<String, String> logout(
            HttpSession session) {

        session.invalidate();

        return Map.of(
                "message",
                "Logout successful."
        );
    }
}