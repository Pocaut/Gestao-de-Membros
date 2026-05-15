package com.example.members.auth;

public record AuthResponse(
        String token,
        String tokenType,
        Long expiresInMinutes
) {
}
