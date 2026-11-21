package com.sms.dto;

/** Session payload returned after login / registration. */
public record AuthResponse(String token, String tokenType, long expiresInMs, UserDto user) {
}
