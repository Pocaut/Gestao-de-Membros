package com.example.members.exception;

import java.util.HashMap;
import java.util.Map;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidation(MethodArgumentNotValidException exception) {
        Map<String, String> errors = new HashMap<>();

        exception.getBindingResult().getFieldErrors().forEach(error ->
                errors.put(error.getField(), error.getDefaultMessage()));

        return ResponseEntity.badRequest()
                .body(ApiError.of("Corrija os campos destacados.", errors));
    }

    @ExceptionHandler(InvalidCpfException.class)
    public ResponseEntity<ApiError> handleInvalidCpf(InvalidCpfException exception) {
        return ResponseEntity.badRequest()
                .body(ApiError.of(exception.getMessage(), Map.of("cpf", exception.getMessage())));
    }

    @ExceptionHandler(InvalidBirthDateException.class)
    public ResponseEntity<ApiError> handleInvalidBirthDate(InvalidBirthDateException exception) {
        return ResponseEntity.badRequest()
                .body(ApiError.of(exception.getMessage(), Map.of("birthDate", exception.getMessage())));
    }

    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<ApiError> handleDuplicate(DuplicateResourceException exception) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ApiError.of(exception.getMessage(), Map.of(exception.getField(), exception.getMessage())));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiError> handleDataIntegrity() {
        String message = "CPF já cadastrado.";

        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ApiError.of(message, Map.of("cpf", message)));
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ApiError> handleResponseStatus(ResponseStatusException exception) {
        String message = exception.getReason() == null
                ? "Operação não permitida."
                : exception.getReason();

        return ResponseEntity.status(exception.getStatusCode())
                .body(ApiError.of(message, Map.of()));
    }
}
