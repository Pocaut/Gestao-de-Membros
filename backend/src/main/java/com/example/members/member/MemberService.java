package com.example.members.member;

import java.time.LocalDate;
import java.time.Period;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.example.members.exception.DuplicateResourceException;
import com.example.members.exception.InvalidBirthDateException;
import com.example.members.exception.InvalidCpfException;

@Service
public class MemberService {

    private final MemberRepository memberRepository;

    public MemberService(MemberRepository memberRepository) {
        this.memberRepository = memberRepository;
    }

    @Transactional
    public MemberResponse create(MemberRequest request) {
        String cpf = CpfValidator.onlyDigits(request.cpf());
        String fullName = normalizeName(request.fullName());

        if (!CpfValidator.isValid(cpf)) {
            throw new InvalidCpfException("CPF inválido.");
        }

        if (request.birthDate().isAfter(LocalDate.now())) {
            throw new InvalidBirthDateException("A data de nascimento não pode estar no futuro.");
        }

        if (!isAdult(request.birthDate())) {
            throw new InvalidBirthDateException("Membros menores de 18 anos não podem ser cadastrados.");
        }

        if (memberRepository.existsByFullNameIgnoreCaseAndCpf(fullName, cpf)) {
            throw new DuplicateResourceException("cpf", "Já existe membro cadastrado com este nome e CPF.");
        }

        if (memberRepository.existsByCpf(cpf)) {
            throw new DuplicateResourceException("cpf", "CPF já cadastrado.");
        }

        Member member = new Member(
                fullName,
                request.birthDate(),
                cpf,
                Boolean.TRUE.equals(request.active())
        );

        return MemberResponse.from(memberRepository.save(member));
    }

    @Transactional(readOnly = true)
    public List<MemberResponse> listAll() {
        return memberRepository.findAll().stream()
                .map(MemberResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<MemberResponse> listActive() {
        return memberRepository.findByActiveTrueOrderByFullNameAsc().stream()
                .map(MemberResponse::from)
                .toList();
    }

    @Transactional
    public MemberResponse updateStatus(Long id, MemberStatusRequest request) {
        Member member = memberRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Membro não encontrado."));

        member.setActive(request.active());

        return MemberResponse.from(member);
    }

    private String normalizeName(String fullName) {
        return fullName.trim().replaceAll("\\s+", " ");
    }

    private boolean isAdult(LocalDate birthDate) {
        return Period.between(birthDate, LocalDate.now()).getYears() >= 18;
    }
}
