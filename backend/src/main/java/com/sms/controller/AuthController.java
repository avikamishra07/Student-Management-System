package com.sms.controller;

import com.sms.dto.AuthResponse;
import com.sms.dto.LoginRequest;
import com.sms.dto.RegisterRequest;
import com.sms.dto.UserDto;
import com.sms.security.AuthUser;
import com.sms.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /** 201 Created, 400 invalid body, 409 email already used. */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    /** 200 OK, 400 invalid body, 401 wrong email/password. */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    /** Current user. The app calls this on start-up to check a saved token is still valid. */
    @GetMapping("/me")
    public ResponseEntity<UserDto> me(@AuthenticationPrincipal AuthUser user) {
        return ResponseEntity.ok(authService.getProfile(user.id()));
    }
}
