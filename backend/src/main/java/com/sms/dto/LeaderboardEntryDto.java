package com.sms.dto;

/** One row of the rank list. */
public record LeaderboardEntryDto(Long studentId, String name, String email, int totalPoints, long rank) {
}
