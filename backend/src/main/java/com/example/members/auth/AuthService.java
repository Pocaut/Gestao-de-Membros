package com.example.members.auth;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

    private final String username;
    private final String encryptedPassword;
    private final PasswordEncoder passwordEncoder;
    private final TokenService tokenService;

    public AuthService(
            @Value("${app.security.username}") String username,
            @Value("${app.security.password}") String password,
            PasswordEncoder passwordEncoder,
            TokenService tokenService
    ) {
        this.username = username;
        this.encryptedPassword = passwordEncoder.encode(password);
        this.passwordEncoder = passwordEncoder;
        this.tokenService = tokenService;
    }

    public AuthResponse login(AuthRequest request) {
        boolean validUsername = username.equals(request.username());
        boolean validPassword = passwordEncoder.matches(request.password(), encryptedPassword);

        if (!validUsername || !validPassword) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuário ou senha inválidos.");
        }

        return new AuthResponse(
                tokenService.generateToken(username),
                "Bearer",
                tokenService.getExpirationMinutes()
        );
    }
}
