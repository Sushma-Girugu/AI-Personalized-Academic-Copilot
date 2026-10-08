package com.sushma.githubassistant.service;

import com.sushma.githubassistant.model.User;
import com.sushma.githubassistant.repository.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    public User register(String name, String email, String password) {

        if (name == null || name.trim().isEmpty()) {
            throw new RuntimeException("Name is required.");
        }

        if (email == null || email.trim().isEmpty()) {
            throw new RuntimeException("Email is required.");
        }

        if (password == null || password.length() < 6) {
            throw new RuntimeException(
                    "Password must contain at least 6 characters."
            );
        }

        email = email.trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException(
                    "An account with this email already exists."
            );
        }

        String encryptedPassword =
                passwordEncoder.encode(password);

        User user = new User();
        user.setName(name.trim());
        user.setEmail(email);
        user.setPassword(encryptedPassword);

        return userRepository.save(user);
    }

    public User login(String email, String password) {

        if (email == null || email.trim().isEmpty()) {
            throw new RuntimeException("Email is required.");
        }

        if (password == null || password.isEmpty()) {
            throw new RuntimeException("Password is required.");
        }

        User user = userRepository
                .findByEmail(email.trim().toLowerCase())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Invalid email or password."
                        )
                );

        if (!passwordEncoder.matches(
                password,
                user.getPassword()
        )) {
            throw new RuntimeException(
                    "Invalid email or password."
            );
        }

        return user;
    }
}