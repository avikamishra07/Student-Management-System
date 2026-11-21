package com.sms.dto;

/** The logged-in student's own performance and position. */
public record MyStandingDto(Long studentId, String name, String email, int totalPoints, long rank, long totalStudents) {
}
