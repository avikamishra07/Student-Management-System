package com.sms.config;

import com.sms.entity.Role;
import com.sms.entity.StudentProfile;
import com.sms.entity.User;
import com.sms.repository.StudentProfileRepository;
import com.sms.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Adds demo accounts the first time the app starts (only if there are no users yet),
 * so the leaderboard has data during the demo. All demo passwords: password123
 */
@Component
@ConditionalOnProperty(name = "app.seed-demo-data", havingValue = "true")
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);
    private static final String DEMO_PASSWORD = "password123";

    private final UserRepository userRepository;
    private final StudentProfileRepository studentRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository,
                      StudentProfileRepository studentRepository,
                      PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) {
            return;
        }
        String hash = passwordEncoder.encode(DEMO_PASSWORD);
        userRepository.save(new User("Mrs. Sharma", "teacher@school.com", hash, Role.TEACHER));

        Object[][] students = {
                {"Aarav Patel", "aarav@school.com", 120},
                {"Diya Nair", "diya@school.com", 95},
                {"Rohan Gupta", "rohan@school.com", 95},
                {"Ananya Iyer", "ananya@school.com", 80},
                {"Kabir Singh", "kabir@school.com", 60},
                {"Meera Reddy", "meera@school.com", 45},
                {"Vihaan Joshi", "vihaan@school.com", 30},
                {"Isha Kulkarni", "isha@school.com", 10},
        };
        for (Object[] s : students) {
            User u = userRepository.save(new User((String) s[0], (String) s[1], hash, Role.STUDENT));
            StudentProfile p = new StudentProfile(u);
            p.setTotalPoints((Integer) s[2]);
            studentRepository.save(p);
        }
        log.info("Demo data created: teacher@school.com and {} students (password: {})", students.length, DEMO_PASSWORD);
    }
}
