package com.sushma.githubassistant.repository;

import com.sushma.githubassistant.model.Subject;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SubjectRepository
        extends JpaRepository<Subject, Long> {

    Optional<Subject> findByNameIgnoreCase(String name);
}