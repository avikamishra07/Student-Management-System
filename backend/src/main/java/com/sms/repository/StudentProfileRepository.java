package com.sms.repository;

import com.sms.entity.StudentProfile;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface StudentProfileRepository extends JpaRepository<StudentProfile, Long> {

    Optional<StudentProfile> findByUserId(Long userId);

    /** Locks the row while points are being changed, so two teachers cannot overwrite each other. */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select s from StudentProfile s where s.id = :id")
    Optional<StudentProfile> findByIdForUpdate(@Param("id") Long id);

    /**
     * Counts how many students are ranked ABOVE the given student.
     * Rank = this count + 1.
     *
     * Ranking order (deterministic, no two students share a position):
     *   1. total points, highest first
     *   2. on equal points: name A to Z
     *   3. on equal points and name: lower student id first
     */
    @Query("""
            select count(s) from StudentProfile s
            where s.totalPoints > :points
               or (s.totalPoints = :points and s.user.name < :name)
               or (s.totalPoints = :points and s.user.name = :name and s.id < :id)
            """)
    long countRankedAbove(@Param("points") int points,
                          @Param("name") String name,
                          @Param("id") Long id);
}
