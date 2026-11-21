package com.sms.service;

import com.sms.dto.LeaderboardEntryDto;
import com.sms.dto.MyStandingDto;
import com.sms.dto.PageResponse;
import com.sms.entity.PointTransaction;
import com.sms.entity.StudentProfile;
import com.sms.entity.User;
import com.sms.exception.ApiException;
import com.sms.repository.PointTransactionRepository;
import com.sms.repository.StudentProfileRepository;
import com.sms.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

@Service
public class StudentService {

    public static final int MAX_PAGE_SIZE = 50;

    private final StudentProfileRepository studentRepository;
    private final UserRepository userRepository;
    private final PointTransactionRepository transactionRepository;

    public StudentService(StudentProfileRepository studentRepository,
                          UserRepository userRepository,
                          PointTransactionRepository transactionRepository) {
        this.studentRepository = studentRepository;
        this.userRepository = userRepository;
        this.transactionRepository = transactionRepository;
    }

    /**
     * Server-side paginated and sorted rank list.
     *
     * @param sortBy    "points" (default) or "name"
     * @param direction "desc" (default) or "asc"
     */
    @Transactional(readOnly = true)
    public PageResponse<LeaderboardEntryDto> getLeaderboard(int page, int size, String sortBy, String direction) {
        if (page < 0) {
            throw ApiException.badRequest("page must be 0 or greater");
        }
        if (size < 1 || size > MAX_PAGE_SIZE) {
            throw ApiException.badRequest("size must be between 1 and " + MAX_PAGE_SIZE);
        }
        String sortKey = sortBy.toLowerCase(Locale.ROOT);
        String dirKey = direction.toLowerCase(Locale.ROOT);
        if (!sortKey.equals("points") && !sortKey.equals("name")) {
            throw ApiException.badRequest("sortBy must be 'points' or 'name'");
        }
        if (!dirKey.equals("asc") && !dirKey.equals("desc")) {
            throw ApiException.badRequest("direction must be 'asc' or 'desc'");
        }

        Sort sort = buildSort(sortKey, dirKey.equals("asc") ? Sort.Direction.ASC : Sort.Direction.DESC);
        Page<StudentProfile> result = studentRepository.findAll(PageRequest.of(page, size, sort));

        List<LeaderboardEntryDto> content = result.getContent().stream()
                .map(this::toEntry)
                .toList();

        return new PageResponse<>(content, result.getNumber(), result.getSize(), result.getTotalElements(),
                result.getTotalPages(), result.isLast(), sortKey, dirKey);
    }

    /** The logged-in student's own points and rank. */
    @Transactional(readOnly = true)
    public MyStandingDto getMyStanding(Long userId) {
        StudentProfile s = studentRepository.findByUserId(userId)
                .orElseThrow(() -> ApiException.notFound("Student profile not found"));
        return new MyStandingDto(s.getId(), s.getUser().getName(), s.getUser().getEmail(),
                s.getTotalPoints(), rankOf(s), studentRepository.count());
    }

    /** Teacher awards (positive) or deducts (negative) points. Returns the student's updated row. */
    @Transactional
    public LeaderboardEntryDto awardPoints(Long studentId, int points, String reason, Long teacherUserId) {
        if (points == 0) {
            throw ApiException.badRequest("Points cannot be zero");
        }
        StudentProfile student = studentRepository.findByIdForUpdate(studentId)
                .orElseThrow(() -> ApiException.notFound("Student with id " + studentId + " not found"));
        User teacher = userRepository.findById(teacherUserId)
                .orElseThrow(() -> ApiException.notFound("Teacher not found"));

        long newTotal = (long) student.getTotalPoints() + points;
        if (newTotal < 0) {
            throw ApiException.badRequest("Total points cannot go below zero (current: "
                    + student.getTotalPoints() + ")");
        }
        if (newTotal > Integer.MAX_VALUE) {
            throw ApiException.badRequest("Total points are too large");
        }

        student.setTotalPoints((int) newTotal);
        studentRepository.save(student);

        String cleanReason = (reason == null || reason.isBlank()) ? null : reason.trim();
        transactionRepository.save(new PointTransaction(student, teacher, points, cleanReason));

        return toEntry(student);
    }

    /**
     * Deterministic order. "asc" is the exact reverse of "desc", so the list never jumps around.
     * points desc: points high->low, then name A->Z, then id low->high
     */
    private static Sort buildSort(String sortBy, Sort.Direction dir) {
        Sort.Direction reverse = dir.isAscending() ? Sort.Direction.DESC : Sort.Direction.ASC;
        if (sortBy.equals("name")) {
            return Sort.by(new Sort.Order(dir, "user.name"), new Sort.Order(dir, "id"));
        }
        return Sort.by(new Sort.Order(dir, "totalPoints"),
                new Sort.Order(reverse, "user.name"),
                new Sort.Order(reverse, "id"));
    }

    private LeaderboardEntryDto toEntry(StudentProfile s) {
        return new LeaderboardEntryDto(s.getId(), s.getUser().getName(), s.getUser().getEmail(),
                s.getTotalPoints(), rankOf(s));
    }

    /** Rank is always based on points (highest = rank 1), whatever order the list is displayed in. */
    private long rankOf(StudentProfile s) {
        return studentRepository.countRankedAbove(s.getTotalPoints(), s.getUser().getName(), s.getId()) + 1;
    }
}
