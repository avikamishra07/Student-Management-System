package com.sms.entity;

import jakarta.persistence.*;

import java.time.Instant;

/** Audit log: one row every time a teacher awards or deducts points. */
@Entity
@Table(name = "point_transactions")
public class PointTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_point_tx_student"))
    private StudentProfile student;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "teacher_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_point_tx_teacher"))
    private User teacher;

    @Column(nullable = false)
    private int points;

    @Column(length = 255)
    private String reason;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }

    public PointTransaction() {
    }

    public PointTransaction(StudentProfile student, User teacher, int points, String reason) {
        this.student = student;
        this.teacher = teacher;
        this.points = points;
        this.reason = reason;
    }

    public Long getId() { return id; }
    public StudentProfile getStudent() { return student; }
    public User getTeacher() { return teacher; }
    public int getPoints() { return points; }
    public String getReason() { return reason; }
    public Instant getCreatedAt() { return createdAt; }
}
