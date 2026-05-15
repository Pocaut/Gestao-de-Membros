package com.example.members.member;

import jakarta.validation.constraints.NotNull;

public record MemberStatusRequest(
        @NotNull(message = "Informe o status do membro.")
        Boolean active
) {
}
