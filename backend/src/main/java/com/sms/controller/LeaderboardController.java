package com.sms.controller;

import com.sms.dto.LeaderboardEntryDto;
import com.sms.dto.PageResponse;
import com.sms.service.StudentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/leaderboard")
public class LeaderboardController {

    private final StudentService studentService;

    public LeaderboardController(StudentService studentService) {
        this.studentService = studentService;
    }

    /**
     * GET /api/v1/leaderboard?page=0&size=10&sortBy=points&direction=desc
     * Available to any logged-in user (students and teachers).
     */
    @GetMapping
    public ResponseEntity<PageResponse<LeaderboardEntryDto>> getLeaderboard(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "points") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {
        return ResponseEntity.ok(studentService.getLeaderboard(page, size, sortBy, direction));
    }
}
