package com.example.members.auth;

import java.time.Instant;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.encrypt.Encryptors;
import org.springframework.security.crypto.encrypt.TextEncryptor;
import org.springframework.stereotype.Service;

@Service
public class TokenService {

    private static final String SEPARATOR = "|";

    private final TextEncryptor textEncryptor;
    private final Long expirationMinutes;

    public TokenService(
            @Value("${app.token.secret}") String secret,
            @Value("${app.token.salt}") String salt,
            @Value("${app.token.expiration-minutes}") Long expirationMinutes
    ) {
        this.textEncryptor = Encryptors.text(secret, salt);
        this.expirationMinutes = expirationMinutes;
    }

    public String generateToken(String username) {
        long expiresAt = Instant.now()
                .plusSeconds(expirationMinutes * 60)
                .toEpochMilli();

        return textEncryptor.encrypt(username + SEPARATOR + expiresAt);
    }

    public Optional<String> extractUsername(String token) {
        try {
            String payload = textEncryptor.decrypt(token);
            String[] parts = payload.split("\\|", 2);

            if (parts.length != 2 || isExpired(parts[1])) {
                return Optional.empty();
            }

            return Optional.of(parts[0]);
        } catch (RuntimeException exception) {
            return Optional.empty();
        }
    }

    public Long getExpirationMinutes() {
        return expirationMinutes;
    }

    private boolean isExpired(String expiresAt) {
        return Instant.now().toEpochMilli() > Long.parseLong(expiresAt);
    }
}
