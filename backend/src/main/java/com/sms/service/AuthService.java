package com.sms.service;

import com.sms.dto.AuthResponse;
import com.sms.dto.LoginRequest;
import com.sms.dto.RegisterRequest;
import com.sms.dto.UserDto;
import com.sms.entity.Role;
import com.sms.entity.StudentProfile;
import com.sms.entity.User;
import com.sms.exception.ApiException;
import com.sms.repository.StudentProfileRepository;
import com.sms.repository.UserRepository;
import com.sms.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository,
                       StudentProfileRepository studentProfileRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService) {
        this.userRepository = userRepository;
        this.studentProfileRepository = studentProfileRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        String email = normalizeEmail(req.email());
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw ApiException.conflict("An account with this email already exists");
        }

        User user = userRepository.save(
                new User(req.name().trim(), email, passwordEncoder.encode(req.password()), req.role()));

        // Every student gets a profile that starts at 0 points
        if (user.getRole() == Role.STUDENT) {
            studentProfileRepository.save(new StudentProfile(user));
        }
        return buildAuthResponse(user);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest req) {
        User user = userRepository.findByEmailIgnoreCase(normalizeEmail(req.email()))
                .filter(u -> passwordEncoder.matches(req.password(), u.getPasswordHash()))
                .orElseThrow(() -> ApiException.unauthorized("Invalid email or password"));
        return buildAuthResponse(user);
    }

    @Transactional(readOnly = true)
    public UserDto getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("User not found"));
        return toDto(user);
    }

    private AuthResponse buildAuthResponse(User user) {
        return new AuthResponse(jwtService.generateToken(user), "Bearer", jwtService.getExpirationMs(), toDto(user));
    }

    private UserDto toDto(User user) {
        Long studentId = user.getRole() == Role.STUDENT
                ? studentProfileRepository.findByUserId(user.getId()).map(StudentProfile::getId).orElse(null)
                : null;
        return new UserDto(user.getId(), user.getName(), user.getEmail(), user.getRole(), studentId);
    }

    private static String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
