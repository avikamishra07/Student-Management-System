package com.sms.dto;

import com.sms.entity.Role;

/** Public user profile. studentId is null for teachers. */
public record UserDto(Long id, String name, String email, Role role, Long studentId) {
}
