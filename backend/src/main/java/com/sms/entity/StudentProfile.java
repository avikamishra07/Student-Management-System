package com.sms.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.ColumnDefault;

/** Student-specific data. One row per user with role STUDENT. Holds the running point total. */
@Entity
@Table(name = "student_profiles",
        uniqueConstraints = @UniqueConstraint(name = "uk_student_profiles_user", columnNames = "user_id"),
        indexes = @Index(name = "idx_student_profiles_points", columnList = "total_points"))
public class StudentProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "user_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_student_profiles_user"))
    private User user;

    @ColumnDefault("0")
    @Column(name = "total_points", nullable = false)
    private int totalPoints = 0;

    public StudentProfile() {
    }

    public StudentProfile(User user) {
        this.user = user;
    }

    public Long getId() { return id; }
    public User getUser() { return user; }
    public int getTotalPoints() { return totalPoints; }
    public void setTotalPoints(int totalPoints) { this.totalPoints = totalPoints; }
}
