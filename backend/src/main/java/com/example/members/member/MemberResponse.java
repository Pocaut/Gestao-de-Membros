package com.example.members.member;

public record MemberResponse(
        Long id,
        String fullName,
        Integer age,
        String cpf,
        Boolean active
) {
    public static MemberResponse from(Member member) {
        return new MemberResponse(
                member.getId(),
                member.getFullName(),
                member.getAge(),
                member.getCpf(),
                member.getActive()
        );
    }
}
