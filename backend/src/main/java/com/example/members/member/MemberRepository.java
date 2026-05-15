package com.example.members.member;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface MemberRepository extends JpaRepository<Member, Long> {

    boolean existsByCpf(String cpf);

    boolean existsByFullNameIgnoreCaseAndCpf(String fullName, String cpf);

    List<Member> findByActiveTrueOrderByFullNameAsc();
}
