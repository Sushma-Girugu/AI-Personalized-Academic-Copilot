package com.sushma.githubassistant.repository;

import com.sushma.githubassistant.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StudentRepository extends JpaRepository<Student, Long> {
}