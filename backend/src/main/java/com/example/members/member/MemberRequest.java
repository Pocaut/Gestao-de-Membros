package com.example.members.member;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record MemberRequest(
        @NotBlank(message = "Informe o nome completo.")
        String fullName,

        @NotNull(message = "Informe a data de nascimento.")
        LocalDate birthDate,

        @NotBlank(message = "Informe o CPF.")
        String cpf,

        Boolean active
) {
}
