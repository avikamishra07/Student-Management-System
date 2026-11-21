package com.sms.controller;

import com.sms.dto.AwardPointsRequest;
import com.sms.dto.LeaderboardEntryDto;
import com.sms.dto.MyStandingDto;
import com.sms.security.AuthUser;
import com.sms.service.StudentService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/students")
public class StudentController {

    private final StudentService studentService;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    /** STUDENT only (see SecurityConfig): own points, rank and class size. */
    @GetMapping("/me")
    public ResponseEntity<MyStandingDto> myStanding(@AuthenticationPrincipal AuthUser user) {
        return ResponseEntity.ok(studentService.getMyStanding(user.id()));
    }

    /**
     * TEACHER only (see SecurityConfig): award (+) or deduct (-) points.
     * 200 with the updated row, 400 invalid, 403 not a teacher, 404 unknown student.
     */
    @PostMapping("/{studentId}/points")
    public ResponseEntity<LeaderboardEntryDto> awardPoints(@PathVariable Long studentId,
                                                           @Valid @RequestBody AwardPointsRequest request,
                                                           @AuthenticationPrincipal AuthUser teacher) {
        return ResponseEntity.ok(
                studentService.awardPoints(studentId, request.points(), request.reason(), teacher.id()));
    }
}
