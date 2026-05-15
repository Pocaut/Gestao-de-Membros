package com.example.members.exception;

import java.time.Instant;
import java.util.Map;

public record ApiError(
        Instant timestamp,
        String message,
        Map<String, String> fieldErrors
) {
    public static ApiError of(String message, Map<String, String> fieldErrors) {
        return new ApiError(Instant.now(), message, fieldErrors);
    }
}
