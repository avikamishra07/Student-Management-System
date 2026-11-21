package com.sms.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** Positive points = award, negative points = deduct / adjust. */
public record AwardPointsRequest(
        @NotNull(message = "Points are required")
        @Min(value = -1000, message = "Points must be between -1000 and 1000")
        @Max(value = 1000, message = "Points must be between -1000 and 1000")
        Integer points,

        @Size(max = 255, message = "Reason must be at most 255 characters")
        String reason
) {
}
