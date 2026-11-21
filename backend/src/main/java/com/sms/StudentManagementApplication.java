package com.sms;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;

import java.util.TimeZone;

// We authenticate with our own JWT filter, so Spring's default in-memory user is not needed.
@SpringBootApplication(exclude = UserDetailsServiceAutoConfiguration.class)
public class StudentManagementApplication {

    public static void main(String[] args) {
        // Machines in India report "Asia/Calcutta", which newer PostgreSQL versions reject.
        // Running the app in UTC avoids "invalid value for parameter TimeZone" on start-up.
        TimeZone.setDefault(TimeZone.getTimeZone("UTC"));
        SpringApplication.run(StudentManagementApplication.class, args);
    }
}
