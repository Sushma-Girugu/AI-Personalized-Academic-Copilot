package com.sushma.githubassistant.controller;

import com.sushma.githubassistant.model.Student;
import com.sushma.githubassistant.model.Subject;
import com.sushma.githubassistant.repository.StudentRepository;
import com.sushma.githubassistant.repository.SubjectRepository;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    private final StudentRepository studentRepository;
    private final SubjectRepository subjectRepository;

    public StudentController(
            StudentRepository studentRepository,
            SubjectRepository subjectRepository) {

        this.studentRepository = studentRepository;
        this.subjectRepository = subjectRepository;
    }

    @PostMapping
    public Student addStudent(@RequestBody Student student) {
        return studentRepository.save(student);
    }

    @GetMapping
    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    @GetMapping("/{id}")
    public Student getStudentById(@PathVariable Long id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found"));
    }

    @PutMapping("/{id}")
    public Student updateStudent(
            @PathVariable Long id,
            @RequestBody Student updatedStudent) {

        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        student.setName(updatedStudent.getName());
        student.setEmail(updatedStudent.getEmail());
        student.setCourse(updatedStudent.getCourse());
        student.setSemester(updatedStudent.getSemester());
        student.setAvailableStudyHours(
                updatedStudent.getAvailableStudyHours()
        );

        return studentRepository.save(student);
    }

    @DeleteMapping("/{id}")
    public String deleteStudent(@PathVariable Long id) {

        if (!studentRepository.existsById(id)) {
            throw new RuntimeException("Student not found");
        }

        studentRepository.deleteById(id);

        return "Student deleted successfully";
    }

    @PostMapping("/{studentId}/subjects/{subjectId}")
    public Student assignSubject(
            @PathVariable Long studentId,
            @PathVariable Long subjectId) {

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new RuntimeException("Subject not found"));

        student.getSubjects().add(subject);

        return studentRepository.save(student);
    }
}