package com.sms.security;

import com.sms.entity.Role;

/** The logged-in user, available in controllers via @AuthenticationPrincipal. */
public record AuthUser(Long id, String email, Role role) {
}
