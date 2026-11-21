package com.sms.dto;

import java.util.List;

/** Paginated result with metadata the app needs for "load more". */
public record PageResponse<T>(
        List<T> content,
        int page,
        int size,
        long totalElements,
        int totalPages,
        boolean last,
        String sortBy,
        String direction
) {
}
